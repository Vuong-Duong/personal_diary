"use client";

import type React from "react";

import {
  fetchWithAuth,
  fetchWithoutAuth,
  setAccessToken as setApiAccessToken,
  clearAccessToken,
} from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiConfig";
import { login as apiLogin, register as apiRegister } from "@/api/auth.api";
import { getUserIdFromToken } from "@/api/user.api";
import type { User } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  accessToken: null,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  refreshUser: async () => { },
  refreshAccessToken: async () => null,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const router = useRouter();

  const getUserFromToken = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;

    try {
      const userData = await fetchWithAuth(
        API_ENDPOINTS.USER.GET_BY_ID(userId)
      );
      return userData as User;
    } catch (error) {
      console.error("Failed to fetch user data", error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await getUserFromToken();
    setUser(userData);
  }, [getUserFromToken]);

  /**
   * Refresh access token using refresh token from httpOnly cookie
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetchWithoutAuth(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: "POST",
        body: JSON.stringify({}),
      }) as { access_token: string };

      if (response.access_token) {
        setApiAccessToken(response.access_token);
        setAccessTokenState(response.access_token);
        return response.access_token;
      }
    } catch (error) {
      console.error("Failed to refresh access token", error);
      clearAccessToken();
      setAccessTokenState(null);
      setUser(null);
      return null;
    }
  }, []);

  // chỉ chạy 1 lần khi component mount
  useEffect(() => {
    // Check if user is logged in on initial load using the httpOnly refresh cookie.
    const checkAuth = async () => {
      try {
        // Try to refresh token on app load to get new access token
        const newToken = await refreshAccessToken();
        if (newToken) {
          const userData = await getUserFromToken();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getUserFromToken, refreshAccessToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin({ email, password });
      setApiAccessToken(response.access_token);
      setAccessTokenState(response.access_token);
      const userData = await getUserFromToken();
      setUser(userData);
      router.push("/");
    },
    [getUserFromToken, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiRegister({ name, email, password });
    },
    []
  );

  const logout = useCallback(() => {
    // Call logout API to revoke tokens
    if (accessToken) {
      fetchWithAuth(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      }).catch((error) => {
        console.error("Logout API call failed", error);
      });
    }

    // Clear local state and token
    clearAccessToken();
    setAccessTokenState(null);
    setUser(null);

    window.dispatchEvent(new CustomEvent("logout"));
    window.dispatchEvent(new CustomEvent("authChange"));
    router.push("/login");
  }, [accessToken, router]);

  const contextValue = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser, accessToken, refreshAccessToken }),
    [user, isLoading, login, register, logout, refreshUser, accessToken, refreshAccessToken]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
