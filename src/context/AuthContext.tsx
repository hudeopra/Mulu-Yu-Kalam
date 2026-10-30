'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      } else if (res.status === 401) {
        // Authenticated session explicitly expired/cleared
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }
    } catch {
      // Network or transient server error - retain existing state
    }
    // Only clear on first load if we never had a user
    setUser((prev) => prev);
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
    // Clean up all deprecated auto-logout and security policy artifacts
    try {
      localStorage.removeItem('studio_role_security_policies');
      localStorage.removeItem('studio_last_active');
      localStorage.removeItem('studio_logout_event');
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

  const signOut = async () => {
    setIsLoading(true);

    try {
      localStorage.removeItem('studio_last_active');
      localStorage.removeItem('studio_logout_event');
    } catch {}

    // 1. Sign out of Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    // 2. Sign out of Payload CMS
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch {}

    setUser(null);
    setSession(null);
    setIsLoading(false);

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, refreshUser }}>
      {children}
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
