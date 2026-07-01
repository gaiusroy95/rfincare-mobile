import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import {
  apiClient,
  loadStoredTokens,
  setTokens,
  setOnAuthFailure,
  getRefreshToken,
  getAccessToken,
} from '@/src/api/apiClient';

type User = { id: string; email: string; role: string };
type Profile = Record<string, unknown> & { role?: string };

type AuthContextType = {
  user: User | null;
  userProfile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: unknown; error?: { message: string } }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<{ error?: { message: string } }>;
  refreshSession: () => Promise<void>;
  setUserFromOAuth: (accessToken: string, refreshToken?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data?.user ?? null);
      setUserProfile(res.data?.profile ?? null);
    } catch {
      /* ignore */
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await loadStoredTokens();
    const rt = getRefreshToken();
    if (!rt) {
      setUser(null);
      setUserProfile(null);
      return;
    }

    // Reuse a still-valid access token before forcing a refresh (faster cold start).
    const at = getAccessToken();
    if (at) {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data?.user ?? null);
        setUserProfile(res.data?.profile ?? null);
        return;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status && status !== 401 && status !== 403) {
          // Transient/network error — keep stored tokens; user stays signed in offline.
          return;
        }
      }
    }

    try {
      const res = await apiClient.post(
        '/auth/refresh',
        { refreshToken: rt },
        { headers: { Authorization: undefined } },
      );
      await setTokens(res.data?.accessToken, res.data?.refreshToken ?? rt);
      const me = await apiClient.get('/auth/me');
      setUser(me.data?.user ?? null);
      setUserProfile(me.data?.profile ?? null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        await setTokens(null, null);
        setUser(null);
        setUserProfile(null);
      }
    }
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
      setUserProfile(null);
    });
    (async () => {
      await loadStoredTokens();
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      await setTokens(res.data?.accessToken, res.data?.refreshToken);
      setUser(res.data?.user);
      await loadProfile();
      return { data: res.data, error: undefined };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Network error. Please try again.';
      return { error: { message: msg } };
    }
  };

  const signOut = async () => {
    const rt = getRefreshToken();
    try {
      if (rt) {
        await apiClient.post('/auth/logout', { refreshToken: rt });
      }
    } catch {
      /* still clear local session */
    } finally {
      await setTokens(null, null);
      setUser(null);
      setUserProfile(null);
    }
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    try {
      const res = await apiClient.patch('/profiles/me', data);
      setUserProfile(res.data?.profile ?? res.data);
      return {};
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Update failed';
      return { error: { message: msg } };
    }
  };

  const setUserFromOAuth = async (accessToken: string, refreshToken?: string) => {
    await setTokens(accessToken, refreshToken ?? null);
    await loadProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        profileLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateProfile,
        refreshSession,
        setUserFromOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function getRoleRoute(role?: string) {
  const routes: Record<string, string> = {
    customer: '/(customer)/(tabs)/dashboard',
    agent: '/(agent)/(tabs)/dashboard',
    admin: '/(customer)/(tabs)/home',
    employee: '/(customer)/(tabs)/home',
  };
  return routes[role || ''] || '/(customer)/(tabs)/home';
}
