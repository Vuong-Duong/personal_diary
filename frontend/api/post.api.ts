import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type { Post, CreatePostRequest, UpdatePostRequest, ApiResponse } from "@/types";

export const getAllPosts = async (): Promise<ApiResponse<Post[]>> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_ALL);
};

export const getPostById = async (id: string): Promise<ApiResponse<Post>> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_BY_ID(id));
};

export const createPost = async (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updatePost = async (id: string, data: UpdatePostRequest): Promise<ApiResponse<Post>> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.UPDATE(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deletePost = async (id: string): Promise<ApiResponse<void>> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.DELETE(id), {
    method: "DELETE",
  });
};

export const publishPost = async (id: string): Promise<ApiResponse<Post>> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.PUBLISH(id), {
    method: "PATCH",
  });
};

export const getUserPosts = async (userId: string): Promise<ApiResponse<Post[]>> => {
  return await fetchWithoutAuth(
    API_ENDPOINTS.POST.GET_USER_POSTS(userId)
  );
};