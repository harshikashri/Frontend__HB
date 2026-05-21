import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { AuthUser, LoginCredentials, RegisterCredentials } from "../services/authTypes";
import { createUserFromToken } from "../services/jwt";
import { loginUser, registerUser } from "../services/authService";
import { clearSession, getStoredToken, getStoredUser, saveSession } from "../services/tokenStorage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    if (!token) {
      return;
    }

    try {
      const userFromToken = createUserFromToken(token);
      setUser(userFromToken);
      saveSession(token, userFromToken);
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
    }
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials);
    const nextUser = createUserFromToken(response.access_token);

    saveSession(response.access_token, nextUser);
    setToken(response.access_token);
    setUser(nextUser);

    return nextUser;
  }, []);

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      await registerUser(credentials);
      return login({
        username: credentials.name,
        password: credentials.password,
      });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
