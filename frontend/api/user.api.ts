import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type { User, UpdateUserRequest, ChangePasswordRequest, ApiResponse } from "@/types";

interface JwtPayload {
  userId: string;
}

export const getUserIdFromToken = (): string | null => {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.userId || null;
  } catch {
    return null;
  }
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.GET_PROFILE);
};

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.GET_ALL);
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.GET_BY_ID(id));
};

export const updateUser = async (
  id: string,
  data: UpdateUserRequest
): Promise<ApiResponse<User>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.DELETE(id), {
    method: "DELETE",
  });
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse<void>> => {
  return await fetchWithAuth(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};