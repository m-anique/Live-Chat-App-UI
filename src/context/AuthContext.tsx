import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authApi, setAuthToken, type AuthUser } from "@/services/api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(
    async (fn: () => Promise<{ token: string; user: AuthUser }>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fn();
        setToken(res.token);
        setUser(res.user);
        setAuthToken(res.token);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ??
          (e as { message?: string })?.message ??
          "Authentication failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) => handleAuth(() => authApi.login({ email, password })),
    [handleAuth],
  );
  const register = useCallback(
    (name: string, email: string, password: string) =>
      handleAuth(() => authApi.register({ name, email, password })),
    [handleAuth],
  );
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout }),
    [user, token, loading, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
