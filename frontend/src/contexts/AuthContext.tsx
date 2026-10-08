import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { fetchMe, login as apiLogin, register as apiRegister } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/auth";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_subscriber: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await fetchMe(token);
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const token = await apiLogin(email, password);
    setToken(token);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    const token = await apiRegister(email, password, fullName);
    setToken(token);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
