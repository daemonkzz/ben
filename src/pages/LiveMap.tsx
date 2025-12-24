import { useState, useEffect, useRef, useCallback } from 'react';
import { Excalidraw, exportToCanvas } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawImperativeAPI, AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, Wifi, WifiOff, RefreshCw, AlertTriangle, Crosshair, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SceneData {
  elements: any[];
  appState: Partial<AppState>;
  files: BinaryFiles;
}

// Normalize files: ensure each file has an id field
const normalizeFiles = (files: BinaryFiles | undefined): BinaryFiles => {
  if (!files || typeof files !== 'object') return {};

  const normalized: BinaryFiles = {};
  for (const [key, value] of Object.entries(files)) {
    if (value && typeof value === 'object') {
      normalized[key] = {
        ...value,
        id: (value as any).id || key,
        mimeType:
          (value as any).mimeType ||
          ((value as any).dataURL?.match(/^data:([^;,]+)/)?.[1] || 'image/png'),
      };
    }
  }
  return normalized;
};

const DEFAULT_VIEW_BG_LIGHT = 'hsl(var(--foreground))';
const DEFAULT_VIEW_BG_DARK = 'hsl(var(--background))';

/**
 * Normalize elements - fixes image status and filters deleted elements
 * CRITICAL: Filters out isDeleted elements to prevent invisible elements bug
 */
const normalizeElements = (elements: any[], files: BinaryFiles): any[] => {
  if (!Array.isArray(elements)) return [];

  return elements
    // CRITICAL FIX: First filter out deleted elements
    .filter(el => el && typeof el === 'object' && !el.isDeleted)
    .map((el) => {
      if (el.type === 'image') {
        const fileId = (el as any).fileId;
        const hasFile = !!fileId && !!(files as any)[fileId];

        // Excalidraw sometimes persists image elements as "pending" even though
        // file data exists. Force to "saved" so it can render in view mode.
        if ((el as any).status === 'pending') {
          return { ...el, status: hasFile ? 'saved' : 'error' };
        }

        // If we don't have the file payload, mark as error to avoid bounds issues.
        if (!hasFile && ((el as any).status === 'saved' || (el as any).status == null)) {
          return { ...el, status: 'error' };
        }
      }

      return el;
    });
};

/**
 * Get renderable elements - filters out deleted elements and broken images
 * CRITICAL: This ensures we never try to render or scroll to deleted elements
 */
const getRenderableElements = (elements: any[], files: BinaryFiles) => {
  return (elements || []).filter((el) => {
    if (!el || typeof el !== 'object') return false;
    
    // CRITICAL FIX: Always exclude deleted elements
    if (el.isDeleted) return false;

    if (el.type === 'image') {
      const fileId = (el as any).fileId;
      const hasFile = !!fileId && !!(files as any)[fileId];
      const status = (el as any).status;
      return hasFile && (status === 'saved' || status == null);
    }

    return true;
  });
};

export default function LiveMap() {
  const location = useLocation();
  const debugMode = new URLSearchParams(location.search).get('debug') === '1';

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [followMode, setFollowMode] = useState(true);
  const [elementCount, setElementCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [fallbackDataUrl, setFallbackDataUrl] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(true); // Default to fallback for guaranteed visibility
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const sceneDataRef = useRef<SceneData | null>(null);

  // Apply scene to Excalidraw - single source of truth
  const applyScene = useCallback((api: ExcalidrawImperativeAPI, sceneData: SceneData, shouldScroll = true) => {
    if (!api || !sceneData) {
      console.warn('[LiveMap] applyScene: missing api or sceneData');
      return;
    }

    const rawElements = sceneData.elements || [];
    const files = normalizeFiles(sceneData.files);
    const filesArray = Object.values(files);

    const elements = normalizeElements(rawElements, files);
    const renderableElements = getRenderableElements(elements, files);

    console.log('[LiveMap] applyScene:', {
      elementsCount: elements.length,
      renderableCount: renderableElements.length,
      filesCount: filesArray.length,
      firstElement: elements[0] ? { type: elements[0].type, x: elements[0].x, y: elements[0].y } : null,
    });

    // Step 1: Add files FIRST (so images can reference them)
    if (filesArray.length > 0) {
      try {
        api.addFiles(filesArray);
        console.log('[LiveMap] Files added:', filesArray.length);
      } catch (err) {
        console.error('[LiveMap] Error adding files:', err);
      }
    }

    // Step 2: Update scene with elements + apply persisted viewport/background
    try {
      // LiveMap is read-only; force a high-contrast background so dark strokes/images are visible.
      const persistedAppState: Partial<AppState> = {
        viewBackgroundColor: '#ffffff',
      };

      if (sceneData.appState?.scrollX != null) persistedAppState.scrollX = sceneData.appState.scrollX;
      if (sceneData.appState?.scrollY != null) persistedAppState.scrollY = sceneData.appState.scrollY;
      if (sceneData.appState?.zoom != null) persistedAppState.zoom = sceneData.appState.zoom;

      api.updateScene({
        elements,
        appState: {
          ...persistedAppState,
          viewModeEnabled: true,
          zenModeEnabled: true,
          gridModeEnabled: false,
        } as any,
      });
      console.log('[LiveMap] Scene updated with', elements.length, 'elements');
    } catch (err) {
      console.error('[LiveMap] Error updating scene:', err);
    }

    // Step 3: Scroll to content if follow mode is on
    if (shouldScroll && followMode && renderableElements.length > 0) {
      setTimeout(() => {
        try {
          api.scrollToContent(renderableElements, {
            fitToViewport: true,
            viewportZoomFactor: 0.85,
            animate: false,
            minZoom: 0.1,
            maxZoom: 2,
          });
          console.log('[LiveMap] Scrolled to content');
        } catch (err) {
          console.error('[LiveMap] Error scrolling:', err);
        }
      }, 150);
    }

    // Update counts
    setElementCount(elements.length);
    setFileCount(filesArray.length);
    setLastUpdate(new Date());
  }, [followMode]);

  // Center camera on content
  const handleCenterCamera = useCallback(() => {
    if (!excalidrawAPI) return;

    try {
      const files = normalizeFiles(excalidrawAPI.getFiles());
      const elements = excalidrawAPI.getSceneElements();
      const renderableElements = getRenderableElements(elements as any[], files);

      if (renderableElements.length === 0) {
        toast.info('Haritada öğe yok');
        return;
      }

      excalidrawAPI.scrollToContent(renderableElements as any, {
        fitToViewport: true,
        viewportZoomFactor: 0.85,
        animate: false,
        minZoom: 0.1,
        maxZoom: 2,
      });
      toast.success('Kamera merkeze alındı');
    } catch (err) {
      console.error('[LiveMap] Center camera error:', err);
    }
  }, [excalidrawAPI]);

  // Load whiteboard data
  const loadWhiteboard = useCallback(async (showToast = false) => {
    try {
      console.log('[LiveMap] Loading whiteboard...');
      const { data, error } = await supabase
        .from('whiteboards')
        .select('id, scene_data')
        .eq('name', 'Ana Harita')
        .maybeSingle();

      if (error) {
        console.error('[LiveMap] Load error:', error);
        if (showToast) toast.error('Yükleme hatası');
        return null;
      }

      if (data) {
        console.log('[LiveMap] Loaded whiteboard:', data.id);
        setWhiteboardId(data.id);
        const sceneData = data.scene_data as SceneData | null;
        
        if (sceneData) {
          const count = sceneData.elements?.length || 0;
          const fCount = sceneData.files ? Object.keys(sceneData.files).length : 0;
          
          console.log('[LiveMap] Scene data from DB:', { elements: count, files: fCount });
          sceneDataRef.current = sceneData;
          setElementCount(count);
          setFileCount(fCount);
          
          if (showToast) {
            toast.success(`${count} öğe, ${fCount} dosya yüklendi`);
          }
          return sceneData;
        }
        
        if (showToast) toast.info('Harita boş');
      }
      return null;
    } catch (err) {
      console.error('[LiveMap] Load error:', err);
      if (showToast) toast.error('Yükleme hatası');
      return null;
    }
  }, []);

  // Generate fallback canvas image from scene data
  const generateFallbackImage = useCallback(async (sceneData: SceneData) => {
    if (!sceneData || !sceneData.elements || sceneData.elements.length === 0) {
      console.log('[LiveMap] No elements for fallback render');
      return;
    }

    try {
      const files = normalizeFiles(sceneData.files);
      const elements = normalizeElements(sceneData.elements, files);
      const renderableElements = getRenderableElements(elements, files);

      if (renderableElements.length === 0) {
        console.log('[LiveMap] No renderable elements for fallback');
        return;
      }

      console.log('[LiveMap] Generating fallback canvas with', renderableElements.length, 'elements');

      const canvas = await exportToCanvas({
        elements: renderableElements,
        appState: {
          viewBackgroundColor: '#ffffff',
          exportWithDarkMode: false,
        },
        files,
        maxWidthOrHeight: 1920,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setFallbackDataUrl(dataUrl);
      console.log('[LiveMap] Fallback image generated:', canvas.width, 'x', canvas.height);

      // Debug info
      setDebugInfo({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        elementsCount: renderableElements.length,
        firstElement: renderableElements[0] ? {
          type: renderableElements[0].type,
          x: Math.round(renderableElements[0].x),
          y: Math.round(renderableElements[0].y),
          width: Math.round(renderableElements[0].width || 0),
          height: Math.round(renderableElements[0].height || 0),
        } : null,
      });
    } catch (err) {
      console.error('[LiveMap] Fallback render error:', err);
    }
  }, []);

  // Initial load + generate fallback image
  useEffect(() => {
    const init = async () => {
      const sceneData = await loadWhiteboard();
      if (sceneData) {
        await generateFallbackImage(sceneData);
      }
      setIsLoading(false);
    };
    init();
  }, [loadWhiteboard, generateFallbackImage]);

  // Apply scene when API becomes ready and we have data
  useEffect(() => {
    if (apiReady && excalidrawAPI && sceneDataRef.current) {
      console.log('[LiveMap] API ready, applying initial scene');
      // Small delay to ensure Excalidraw is fully mounted
      setTimeout(() => {
        applyScene(excalidrawAPI, sceneDataRef.current!, true);
      }, 100);
    }
  }, [apiReady, excalidrawAPI, applyScene]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const sceneData = await loadWhiteboard(true);
    
    if (sceneData) {
      if (excalidrawAPI) {
        applyScene(excalidrawAPI, sceneData, true);
      }
      // Also generate fallback
      await generateFallbackImage(sceneData);
    }
    
    setIsRefreshing(false);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!whiteboardId) return;

    console.log('[LiveMap] Setting up realtime subscription for:', whiteboardId);

    const channel = supabase
      .channel('whiteboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whiteboards',
          filter: `id=eq.${whiteboardId}`,
        },
        (payload) => {
          console.log('[LiveMap] Realtime update received');
          const newSceneData = (payload.new as any).scene_data as SceneData;
          
          if (newSceneData) {
            sceneDataRef.current = newSceneData;
            
            if (excalidrawAPI) {
              applyScene(excalidrawAPI, newSceneData, followMode);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[LiveMap] Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[LiveMap] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [whiteboardId, excalidrawAPI, followMode, applyScene]);

  // Handle API ready
  const handleAPIReady = useCallback((api: ExcalidrawImperativeAPI) => {
    console.log('[LiveMap] Excalidraw API ready');
    setExcalidrawAPI(api);
    setApiReady(true);
  }, []);

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return null;
    const diff = Date.now() - lastUpdate.getTime();
    if (diff < 5000) return 'Az önce';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s önce`;
    return `${Math.floor(diff / 60000)}dk önce`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Canlı Harita</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {elementCount} öğe {fileCount > 0 && `• ${fileCount} dosya`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Center camera button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCenterCamera}
            className="gap-2"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Merkez</span>
          </Button>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </Button>

          {/* Follow mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFollowMode(!followMode)}
            className="gap-2"
          >
            {followMode ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Takip</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Takip</span>
              </>
            )}
          </Button>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            {lastUpdate && (
              <span className="text-muted-foreground/70">
                {formatLastUpdate()}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 64px)' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Harita yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Debug Panel (only when ?debug=1) */}
            {debugMode && (
              <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs font-mono">
                <div className="font-bold mb-2 text-yellow-400">DEBUG MODE</div>
                <div>Elements: {elementCount}</div>
                <div>Files: {fileCount}</div>
                <div>API Ready: {apiReady ? 'Yes' : 'No'}</div>
                <div>Fallback: {fallbackDataUrl ? 'Ready' : 'None'}</div>
                <div>Using Fallback: {useFallback ? 'Yes' : 'No'}</div>
                {debugInfo && (
                  <>
                    <div className="mt-2 text-green-400">Canvas: {debugInfo.canvasWidth}x{debugInfo.canvasHeight}</div>
                    {debugInfo.firstElement && (
                      <div className="mt-1 text-blue-400">
                        First: {debugInfo.firstElement.type} @ ({debugInfo.firstElement.x}, {debugInfo.firstElement.y})
                        <br />Size: {debugInfo.firstElement.width}x{debugInfo.firstElement.height}
                      </div>
                    )}
                  </>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setUseFallback(!useFallback)}
                    className="px-2 py-1 bg-blue-600 rounded text-xs"
                  >
                    Toggle Fallback
                  </button>
                </div>
              </div>
            )}

            {/* Empty state overlay */}
            {elementCount === 0 && apiReady && !fallbackDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-8 text-center border border-border pointer-events-auto">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Harita Boş</h2>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Admin panelinden içerik ekleyin
                  </p>
                  <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Tekrar Yükle
                  </Button>
                </div>
              </div>
            )}

            {/* Fallback Image Mode - guaranteed to show if we have elements */}
            {useFallback && fallbackDataUrl && (
              <div className="absolute inset-0 z-20 bg-white flex items-center justify-center overflow-auto">
                <img
                  src={fallbackDataUrl}
                  alt="Harita"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Excalidraw - with explicit white background */}
            <div 
              style={{ 
                width: '100%', 
                height: '100%',
                backgroundColor: '#ffffff',
                position: 'relative',
                zIndex: 10,
              }}
              className={useFallback ? 'hidden' : ''}
            >
              <Excalidraw
                excalidrawAPI={handleAPIReady}
                viewModeEnabled={true}
                zenModeEnabled={true}
                theme="light"
                langCode="tr-TR"
                UIOptions={{
                  canvasActions: {
                    export: false,
                    saveAsImage: false,
                    loadScene: false,
                    clearCanvas: false,
                    toggleTheme: false,
                  },
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}