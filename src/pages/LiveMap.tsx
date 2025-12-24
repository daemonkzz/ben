import { useState, useEffect, useRef, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawImperativeAPI, AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SceneData {
  elements: any[];
  appState: Partial<AppState>;
  files: BinaryFiles;
}

export default function LiveMap() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<SceneData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [followMode, setFollowMode] = useState(true);
  const [elementCount, setElementCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // Keep ref in sync
  useEffect(() => {
    excalidrawAPIRef.current = excalidrawAPI;
  }, [excalidrawAPI]);

  // Scroll to content helper
  const scrollToContent = useCallback(() => {
    const api = excalidrawAPIRef.current;
    if (!api) return;
    
    try {
      const elements = api.getSceneElements();
      if (elements.length > 0) {
        api.scrollToContent(elements, {
          fitToViewport: true,
          viewportZoomFactor: 0.9,
        });
      }
    } catch (e) {
      console.log('[LiveMap] scrollToContent not available');
    }
  }, []);

  // Load whiteboard data function (reusable)
  const loadWhiteboard = useCallback(async (showToast = false) => {
    try {
      console.log('[LiveMap] Loading whiteboard...');
      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
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
          const fileCount = sceneData.files ? Object.keys(sceneData.files).length : 0;
          
          console.log('[LiveMap] Scene data:', { elements: count, files: fileCount });
          setElementCount(count);
          
          if (count > 0) {
            setInitialData(sceneData);
            if (showToast) toast.success(`${count} öğe yüklendi`);
            return sceneData;
          }
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

  // Initial load
  useEffect(() => {
    const init = async () => {
      await loadWhiteboard();
      setIsLoading(false);
    };
    init();
  }, [loadWhiteboard]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const sceneData = await loadWhiteboard(true);
    
    if (sceneData && excalidrawAPI) {
      // Apply to existing instance
      if (sceneData.files && Object.keys(sceneData.files).length > 0) {
        excalidrawAPI.addFiles(Object.values(sceneData.files));
      }
      excalidrawAPI.updateScene({ elements: sceneData.elements });
      
      if (followMode) {
        setTimeout(scrollToContent, 100);
      }
    }
    
    setIsRefreshing(false);
  };

  // Initial scroll to content after load
  useEffect(() => {
    if (!isLoading && excalidrawAPI && initialData && followMode) {
      // Delay to ensure Excalidraw is fully rendered
      const timer = setTimeout(scrollToContent, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, excalidrawAPI, initialData, followMode, scrollToContent]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!whiteboardId || !excalidrawAPI) return;

    console.log('[LiveMap] Setting up realtime subscription...');

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
          
          if (newSceneData && newSceneData.elements) {
            try {
              const newElementCount = newSceneData.elements.length;
              const newFileCount = newSceneData.files ? Object.keys(newSceneData.files).length : 0;
              
              console.log('[LiveMap] Applying update:', { elements: newElementCount, files: newFileCount });
              
              // IMPORTANT: Add files FIRST so images are available when elements render
              if (newSceneData.files && Object.keys(newSceneData.files).length > 0) {
                excalidrawAPI.addFiles(Object.values(newSceneData.files));
              }

              // Then update elements
              excalidrawAPI.updateScene({
                elements: newSceneData.elements,
              });

              setElementCount(newElementCount);
              setLastUpdate(new Date());

              // Auto-scroll to content if follow mode is on
              if (followMode && newElementCount > 0) {
                setTimeout(scrollToContent, 100);
              }
            } catch (e) {
              console.error('[LiveMap] Error applying realtime update:', e);
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
  }, [whiteboardId, excalidrawAPI, followMode, scrollToContent]);

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
            {elementCount} öğe
          </span>
        </div>
        
        <div className="flex items-center gap-4">
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
                <span className="hidden sm:inline">Takip Açık</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Takip Kapalı</span>
              </>
            )}
          </Button>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline">Bağlı</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Bağlantı yok</span>
              </>
            )}
            {lastUpdate && (
              <span className="text-muted-foreground/70">
                • {formatLastUpdate()}
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
        ) : elementCount === 0 && !initialData ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
              <h2 className="text-xl font-semibold text-foreground">Harita Boş</h2>
              <p className="text-muted-foreground max-w-md">
                Henüz haritaya içerik eklenmemiş veya veriler yüklenemedi. 
                Admin panelinden içerik ekleyebilir veya yenilemeyi deneyebilirsiniz.
              </p>
              <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Tekrar Yükle
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%' }}>
            <Excalidraw
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
              initialData={initialData ? {
                elements: initialData.elements,
                appState: {
                  ...initialData.appState,
                  viewModeEnabled: true,
                },
                files: initialData.files,
              } : {
                appState: {
                  viewModeEnabled: true,
                }
              }}
              viewModeEnabled={true}
              zenModeEnabled={true}
              theme="dark"
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
        )}
      </div>
    </div>
  );
}
