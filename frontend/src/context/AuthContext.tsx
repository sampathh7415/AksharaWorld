'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'bizops_access';
const REFRESH_KEY = 'bizops_refresh';
const USER_KEY = 'bizops_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const persist = useCallback((u: User, access: string, refresh: string) => {
    setUser(u);
    setAccessToken(access);
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const clear = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      setAccessToken(token);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clear();
      }
    }
    setIsLoading(false);
  }, [clear]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    persist(res.user as User, res.accessToken, res.refreshToken);
    router.push('/dashboard');
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const res = await api.register(data) as { accessToken: string; refreshToken: string };
    const loginRes = await api.login({ email: data.email, password: data.password });
    persist(loginRes.user as User, loginRes.accessToken, loginRes.refreshToken);
    router.push('/dashboard');
  };

  const logout = async () => {
    if (accessToken) {
      try {
        await api.logout(accessToken);
      } catch {
        /* ignore */
      }
    }
    clear();
    router.push('/login');
  };

  const value = useMemo(
    () => ({ user, accessToken, isLoading, login, register, logout }),
    [user, accessToken, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
