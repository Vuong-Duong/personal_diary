import { fetchWithoutAuth, fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  User,
} from "@/types";

export const register = async (
  data: RegisterRequest,
): Promise<{ message: string; user: User }> => {
  return await fetchWithoutAuth(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return await fetchWithoutAuth(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const refreshToken = async (): Promise<{
  message: string;
  access_token: string;
}> => {
  return await fetchWithoutAuth(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const logout = async (): Promise<{ message: string }> => {
  return await fetchWithAuth(API_ENDPOINTS.AUTH.LOGOUT, {
    method: "POST",
  });
};
