'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Clock } from 'lucide-react';

interface IdleWarningState {
  isOpen: boolean;
  secondsRemaining: number;
  resetTimer: () => void;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: (reason?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  idleWarning: IdleWarningState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes fallback default
const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes warning countdown

/**
 * Resolves role-based auto-logout inactivity timeout configured by Admin in the Permissions Matrix.
 */
const getAutoLogoutConfig = (userRole?: string | null) => {
  if (typeof window === 'undefined') {
    return { enabled: true, timeoutMs: DEFAULT_TIMEOUT_MS };
  }

  // Recommended role defaults (60m admin, 30m artist, 15m author)
  const roleKey = (userRole?.toLowerCase() || 'author') as 'admin' | 'artist' | 'author';
  const defaultMinutes =
    roleKey === 'admin' ? 60 : roleKey === 'artist' ? 30 : 15;

  return { enabled: true, timeoutMs: defaultMinutes * 60 * 1000 };
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-logout state
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const enrichUserWithRole = async (baseUser: User | null): Promise<User | null> => {
    if (!baseUser) return null;
    let role = (baseUser.user_metadata?.role as string) || (baseUser.app_metadata?.role as string);
    let name = (baseUser.user_metadata?.name as string) || '';
    let username = (baseUser.user_metadata?.username as string) || '';

    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const pData = await res.json();
        if (pData?.user) {
          role = pData.user.role || role || 'author';
          name = pData.user.name || name;
          username = pData.user.username || username;
        }
      }
    } catch {
      // Offline fallback
    }

    return {
      ...baseUser,
      role,
      app_metadata: {
        ...baseUser.app_metadata,
        role,
      },
      user_metadata: {
        ...baseUser.user_metadata,
        role,
        name,
        username,
      },
    } as User;
  };

  const checkPayloadSession = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const unifiedUser = {
            id: String(data.user.id),
            email: data.user.email,
            aud: 'authenticated',
            role: data.user.role || 'author',
            app_metadata: { role: data.user.role || 'author' },
            user_metadata: {
              role: data.user.role || 'author',
              name: data.user.name || '',
              username: data.user.username || '',
              publicEmail: data.user.publicEmail || '',
            },
            created_at: data.user.createdAt || new Date().toISOString(),
          } as unknown as User;
          setUser(unifiedUser);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // No active session
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      if (isSupabaseConfigured) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          const enriched = await enrichUserWithRole(currentSession.user);
          setUser(enriched);
          return;
        }
      }
      await checkPayloadSession();
    } catch (err) {
      console.warn('[Unified Auth] refreshUser error:', err);
    }
  };

  useEffect(() => {
    // Clean up deprecated studio_role_security_policies if present
    try {
      localStorage.removeItem('studio_role_security_policies');
    } catch {}

    // 1. Check Supabase session first
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setSession(session);
          const enriched = await enrichUserWithRole(session.user);
          setUser(enriched);
          setIsLoading(false);
        } else {
          // Fallback: Check Payload active session
          await checkPayloadSession();
        }
      });

      // 2. Listen for Supabase auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          const enriched = await enrichUserWithRole(session.user);
          setUser(enriched);
          setIsLoading(false);
        } else {
          await checkPayloadSession();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      checkPayloadSession();
    }
  }, []);

  // Inactivity auto-logout tracker governed by user role policy
  useEffect(() => {
    if (!user) {
      setIsWarningOpen(false);
      return;
    }

    try {
      if (!localStorage.getItem('studio_last_active')) {
        localStorage.setItem('studio_last_active', String(Date.now()));
      }
    } catch {}

    let lastRecordTime = Date.now();
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastRecordTime > 5000) {
        lastRecordTime = now;
        try {
          localStorage.setItem('studio_last_active', String(now));
        } catch {}
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });

    const userRole =
      (user?.role as string) ||
      (user?.user_metadata?.role as string) ||
      'author';

    const interval = setInterval(() => {
      try {
        const { enabled, timeoutMs } = getAutoLogoutConfig(userRole);
        if (!enabled || timeoutMs <= 0) {
          setIsWarningOpen(false);
          return;
        }

        const lastActive = Number(localStorage.getItem('studio_last_active') || Date.now());
        const idleMs = Date.now() - lastActive;

        if (idleMs >= timeoutMs) {
          setIsWarningOpen(false);
          signOut('timeout');
        } else if (idleMs >= timeoutMs - WARNING_TIME_MS) {
          const remaining = Math.max(0, Math.ceil((timeoutMs - idleMs) / 1000));
          setSecondsRemaining(remaining);
          setIsWarningOpen(true);
        } else {
          setIsWarningOpen(false);
        }
      } catch {}
    }, 5000);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'studio_logout_event') {
        signOut('cross_tab');
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, updateActivity);
      });
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user]);

  const resetInactivityTimer = () => {
    try {
      localStorage.setItem('studio_last_active', String(Date.now()));
    } catch {}
    setIsWarningOpen(false);
    setSecondsRemaining(120);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    // 1. Authenticate with Payload CMS to set the HTTP-only 'payload-token' cookie for /cms
    let payloadSuccess = false;
    let payloadUser: any = null;
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const payloadData = await res.json();
        payloadUser = payloadData.user;
        payloadSuccess = true;
      }
    } catch (err) {
      console.warn('[Unified Auth] Payload CMS login error:', err);
    }

    // 2. Authenticate with Supabase Auth for /admin appointments
    let supabaseSuccess = false;
    let supabaseUser: any = null;
    let supabaseSession: any = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.session) {
          supabaseSuccess = true;
          supabaseUser = data.user;
          supabaseSession = data.session;
        } else if (payloadSuccess) {
          // User exists in Payload CMS: auto-sync into Supabase Auth
          try {
            const signUpRes = await supabase.auth.signUp({ email, password });
            if (signUpRes.data.session) {
              supabaseSuccess = true;
              supabaseUser = signUpRes.data.user;
              supabaseSession = signUpRes.data.session;
            }
          } catch {}
        }
      } catch (err) {
        console.warn('[Unified Auth] Supabase sign-in error:', err);
      }
    }

    // 3. Unified authentication result
    if (payloadSuccess || supabaseSuccess) {
      const unifiedEmail = payloadUser?.email || supabaseUser?.email || email;
      const unifiedId = String(payloadUser?.id || supabaseUser?.id || '1');
      const unifiedRole = payloadUser?.role || (supabaseUser?.user_metadata?.role as string) || 'author';
      const unifiedName = payloadUser?.name || (supabaseUser?.user_metadata?.name as string) || '';
      const unifiedUsername = payloadUser?.username || (supabaseUser?.user_metadata?.username as string) || '';

      const unifiedUser = {
        id: unifiedId,
        email: unifiedEmail,
        aud: 'authenticated',
        role: unifiedRole,
        app_metadata: { role: unifiedRole },
        user_metadata: {
          role: unifiedRole,
          name: unifiedName,
          username: unifiedUsername,
          publicEmail: payloadUser?.publicEmail || '',
        },
        created_at: payloadUser?.createdAt || new Date().toISOString(),
      } as unknown as User;

      try {
        localStorage.setItem('studio_last_active', String(Date.now()));
      } catch {}

      setUser(unifiedUser);
      if (supabaseSession) {
        setSession(supabaseSession);
      }
      setIsLoading(false);
      return { error: null };
    }

    setIsLoading(false);
    return {
      error: {
        name: 'AuthApiError',
        message: 'Invalid email or password. Please try again.',
        status: 401,
      } as AuthError,
    };
  };

  const signOut = async (reason?: string) => {
    setIsLoading(true);

    // 1. Broadcast logout to other tabs
    try {
      localStorage.setItem('studio_logout_event', String(Date.now()));
      localStorage.removeItem('studio_last_active');
    } catch {}

    // 2. Sign out of Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    // 3. Sign out of Payload CMS
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch {}

    setUser(null);
    setSession(null);
    setIsLoading(false);

    // 4. Force clean redirect to /login with reason
    const query = reason === 'timeout' ? '?reason=timeout' : '';
    window.location.href = `/login${query}`;
  };

  const idleWarning: IdleWarningState = {
    isOpen: isWarningOpen,
    secondsRemaining,
    resetTimer: resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, refreshUser, idleWarning }}>
      {children}

      {/* Inactivity Auto-Logout Warning Modal */}
      {isWarningOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-[#2e0249]">
                Session Inactivity Warning
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                You have been inactive for a while. For your security, you will be automatically signed out in:
              </p>
            </div>
            <div className="px-5 py-2.5 bg-amber-100 text-amber-900 rounded-2xl font-mono text-2xl font-bold tracking-tight">
              {secondsRemaining}s
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => signOut('manual')}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Sign Out Now
              </button>
              <button
                type="button"
                onClick={resetInactivityTimer}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff7b01] hover:bg-[#e06c00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 transition-all cursor-pointer"
              >
                Keep Me Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useOptionalAuth = (): AuthContextType | null => {
  return useContext(AuthContext) ?? null;
};
