"use client";

import type React from "react";
import Cookies from "js-cookie";

import { fetchWithAuth } from "@/api/apiClient";
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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  refreshUser: async () => { },
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
  const [isMounted, setIsMounted] = useState(false);
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
      // console.error("Failed to fetch user data", error)
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await getUserFromToken();
    setUser(userData);
  }, [getUserFromToken]);

  // chỉ chạy 1 lần khi component mount
  useEffect(() => {
    setIsMounted(true);

    // Check if user is logged in on initial load using cookies
    const checkAuth = async () => {
      try {
        const userData = await getUserFromToken();
        setUser(userData);
      } catch (error) {
        // console.error("Auth check failed", error)
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getUserFromToken]); // dependency getUserFromToken (đã được memoize)

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin({ email, password });
      // Store token from response
      Cookies.set("token", response.token, { expires: 7 });
      const userData = await getUserFromToken();
      setUser(userData);
      router.push("/home");
    },
    [getUserFromToken, router]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ) => {
      await apiRegister({ name, email, password });
      // Register doesn't return a token, user needs to verify email first
      // No need to fetch user data or set user at this point
    },
    []
  );

  const logout = useCallback(() => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setUser(null);
    window.dispatchEvent(new CustomEvent("logout"));
    window.dispatchEvent(new CustomEvent("authChange"));
  }, []);

  const contextValue = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
