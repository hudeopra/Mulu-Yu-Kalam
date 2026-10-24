'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    // 1. Check Supabase session first
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        } else {
          // Fallback: Check Payload active session (/api/users/me)
          await checkPayloadSession();
        }
      });

      // 2. Listen for Supabase auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
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

  const checkPayloadSession = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const unifiedUser = {
            id: String(data.user.id),
            email: data.user.email,
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: {},
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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsLoading(false);
        return { error: null };
      }
    }

    // 2. Unified fallback: Authenticate with Payload CMS
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const payloadData = await res.json();
        const payloadUser = payloadData.user;

        const unifiedUser = {
          id: String(payloadUser.id),
          email: payloadUser.email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: payloadUser.createdAt || new Date().toISOString(),
        } as unknown as User;

        setUser(unifiedUser);

        // Also provision in Supabase Auth in background so both stay in sync
        if (isSupabaseConfigured) {
          try {
            await supabase.auth.signUp({ email, password });
          } catch {
            // Ignore if already registered
          }
        }

        setIsLoading(false);
        return { error: null };
      }
    } catch (payloadErr) {
      console.error('[Unified Auth] Payload login check error:', payloadErr);
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
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }
    }
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useOptionalAuth = (): AuthContextType | null => {
  return useContext(AuthContext) ?? null;
};
