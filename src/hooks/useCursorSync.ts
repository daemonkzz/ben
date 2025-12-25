import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { throttle } from 'lodash';

export interface CursorPosition {
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  color: string;
  lastUpdate: number;
}

// Generate consistent color from user_id
const generateUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    '#FF69B4', '#32CD32', '#FF8C00', '#9370DB'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

interface UseCursorSyncOptions {
  channelName?: string;
  isActive?: boolean;
}

export const useCursorSync = ({
  channelName = 'cursor-hikaye-tablosu',
  isActive = true
}: UseCursorSyncOptions = {}) => {
  const { user, profile } = useAuth();
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myColor = user ? generateUserColor(user.id) : '#fff';

  // Debug log on hook initialization
  console.log('[CursorSync] Hook init:', { userId: user?.id, isActive, channelName });

  // Cleanup stale cursors (inactive for more than 3 seconds)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const updated = new Map(prev);
        let hasChanges = false;
        
        updated.forEach((cursor, id) => {
          if (now - cursor.lastUpdate > 3000) {
            updated.delete(id);
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!user || !isActive) {
      setCursors(new Map());
      setIsConnected(false);
      return;
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('[CursorSync] Presence sync:', { state, userCount: Object.keys(state).length });
        
        const newCursors = new Map<string, CursorPosition>();

        Object.keys(state).forEach((key) => {
          if (key === user.id) return; // Skip own cursor
          
          const presences = state[key] as unknown as any[];
          if (presences && presences.length > 0) {
            const presence = presences[0];
            console.log('[CursorSync] Processing presence:', { key, presence });
            if (presence.cursor && typeof presence.cursor.x === 'number') {
              newCursors.set(key, {
                x: presence.cursor.x,
                y: presence.cursor.y,
                user_id: presence.user_id,
                username: presence.username,
                avatar_url: presence.avatar_url,
                color: generateUserColor(key),
                lastUpdate: Date.now(),
              });
            }
          }
        });

        console.log('[CursorSync] Cursors to show:', newCursors.size);
        setCursors(newCursors);
      })
      .subscribe(async (status) => {
        console.log('[CursorSync] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('[CursorSync] ✅ Connected to channel:', channelName);
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [user, channelName, isActive]);

  // Throttled cursor update function
  const updateCursor = useCallback(
    throttle(async (x: number, y: number) => {
      if (!channelRef.current || !user || !isActive) {
        console.log('[CursorSync] Skip update:', { hasChannel: !!channelRef.current, hasUser: !!user, isActive });
        return;
      }

      console.log('[CursorSync] Sending cursor:', { x: x.toFixed(1), y: y.toFixed(1) });
      await channelRef.current.track({
        user_id: user.id,
        username: profile?.username || null,
        avatar_url: profile?.avatar_url || null,
        cursor: { x, y },
        online_at: new Date().toISOString(),
      });
    }, 50), // 50ms throttle = max 20 updates per second
    [user, profile, isActive]
  );

  // Handle mouse move on container
  const handleMouseMove = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!containerRef.current || !isActive) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Only send if within bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      updateCursor(x, y);
    }
  }, [updateCursor, isActive]);

  // Handle touch move on container
  const handleTouchMove = useCallback((
    e: React.TouchEvent<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!containerRef.current || !isActive || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      updateCursor(x, y);
    }
  }, [updateCursor, isActive]);

  // Clear cursor when leaving
  const handleMouseLeave = useCallback(async () => {
    if (!channelRef.current || !user || !isActive) return;

    await channelRef.current.track({
      user_id: user.id,
      username: profile?.username || null,
      avatar_url: profile?.avatar_url || null,
      cursor: null, // Clear cursor position
      online_at: new Date().toISOString(),
    });
  }, [user, profile, isActive]);

  return {
    cursors: Array.from(cursors.values()),
    isConnected,
    handleMouseMove,
    handleTouchMove,
    handleMouseLeave,
    myColor,
    currentUserId: user?.id,
  };
};
