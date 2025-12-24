import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { verifyTOTP } from '@epic-web/totp';
import type { Admin2FASettings } from '@/types/admin2fa';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const SESSION_KEY = 'admin_2fa_session';
const SESSION_EXPIRY_KEY = 'admin_2fa_session_expiry';

interface AdminSessionContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  lockSession: () => void;
  remainingTime: number | null;
  admin2FASettings: Admin2FASettings | null;
  refetch2FASettings: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider');
  }
  return context;
};

// Check if session is valid from storage
const getStoredSession = (userId: string): boolean => {
  try {
    const storedUserId = sessionStorage.getItem(SESSION_KEY);
    const expiryStr = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (!storedUserId || !expiryStr || storedUserId !== userId) {
      return false;
    }
    
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      // Session expired, clear it
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// Save session to storage
const saveSession = (userId: string) => {
  try {
    const expiry = Date.now() + IDLE_TIMEOUT;
    sessionStorage.setItem(SESSION_KEY, userId);
    sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
  } catch {
    // Ignore storage errors
  }
};

// Clear session from storage
const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const AdminSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin2FASettings, setAdmin2FASettings] = useState<Admin2FASettings | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Check stored session on mount and when user changes
  useEffect(() => {
    if (user) {
      const hasValidSession = getStoredSession(user.id);
      if (hasValidSession) {
        setIsAdminAuthenticated(true);
      }
    } else {
      setIsAdminAuthenticated(false);
      clearSession();
    }
  }, [user]);

  // Fetch user's 2FA settings
  const fetch2FASettings = useCallback(async () => {
    if (!user) {
      setAdmin2FASettings(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_2fa_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching 2FA settings:', error);
      }

      setAdmin2FASettings(data as Admin2FASettings | null);
    } catch (error) {
      console.error('Error fetching 2FA settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch2FASettings();
  }, [fetch2FASettings]);

  // Lock session and redirect to lock screen
  const lockSession = useCallback(() => {
    if (location.pathname !== '/admin/locked' && location.pathname.startsWith('/admin')) {
      setIsAdminAuthenticated(false);
      clearSession();
      navigate('/admin/locked', { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);

  // Handle idle timeout
  const onIdle = useCallback(() => {
    if (isAdminAuthenticated && location.pathname.startsWith('/admin') && location.pathname !== '/admin/locked') {
      lockSession();
    }
  }, [isAdminAuthenticated, location.pathname, lockSession]);

  // Idle timer
  const { getRemainingTime } = useIdleTimer({
    timeout: IDLE_TIMEOUT,
    onIdle,
    debounce: 500,
    disabled: !isAdminAuthenticated || !location.pathname.startsWith('/admin') || location.pathname === '/admin/locked',
  });

  // Update remaining time periodically and refresh session expiry
  useEffect(() => {
    if (!isAdminAuthenticated || !user) {
      setRemainingTime(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil(getRemainingTime() / 1000);
      setRemainingTime(remaining);
      
      // Refresh session expiry in storage (keep it in sync with idle timer)
      if (remaining > 0) {
        saveSession(user.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdminAuthenticated, getRemainingTime, user]);

  // Verify 2FA code
  const verify2FA = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !admin2FASettings?.totp_secret) {
      return { success: false, error: '2FA ayarları bulunamadı' };
    }

    if (admin2FASettings.is_blocked) {
      return { success: false, error: 'Hesabınız bloklanmış. Yönetici ile iletişime geçin.' };
    }

    try {
      // Verify the TOTP code
      const result = await verifyTOTP({
        otp: code,
        secret: admin2FASettings.totp_secret,
        window: 1, // Allow 1 period before/after for clock skew
      });

      if (result) {
        // Reset failed attempts on success
        await supabase
          .from('admin_2fa_settings')
          .update({ failed_attempts: 0, last_failed_at: null })
          .eq('user_id', user.id);

        setIsAdminAuthenticated(true);
        saveSession(user.id);
        return { success: true };
      } else {
        // Increment failed attempts
        const newAttempts = (admin2FASettings.failed_attempts || 0) + 1;
        const shouldBlock = newAttempts >= 5;

        await supabase
          .from('admin_2fa_settings')
          .update({
            failed_attempts: newAttempts,
            last_failed_at: new Date().toISOString(),
            is_blocked: shouldBlock,
          })
          .eq('user_id', user.id);

        // Refresh settings
        await fetch2FASettings();

        if (shouldBlock) {
          return { success: false, error: 'Çok fazla başarısız deneme. Hesabınız bloklandı.' };
        }

        return { success: false, error: `Yanlış kod. ${5 - newAttempts} deneme hakkınız kaldı.` };
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, error: 'Doğrulama sırasında hata oluştu' };
    }
  }, [user, admin2FASettings, fetch2FASettings]);

  return (
    <AdminSessionContext.Provider
      value={{
        isAdminAuthenticated,
        isLoading,
        verify2FA,
        lockSession,
        remainingTime,
        admin2FASettings,
        refetch2FASettings: fetch2FASettings,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
};
