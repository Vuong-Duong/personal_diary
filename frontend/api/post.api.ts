import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type { Post, CreatePostRequest, UpdatePostRequest } from "@/types";

interface PostListResponse {
  posts: Post[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getAllPosts = async (): Promise<PostListResponse> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_ALL);
};

export const getPostById = async (id: string): Promise<Post> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_BY_ID(id));
};

export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updatePost = async (
  id: string,
  data: UpdatePostRequest,
): Promise<Post> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.UPDATE(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deletePost = async (id: string): Promise<void> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.DELETE(id), {
    method: "DELETE",
  });
};

export const publishPost = async (id: string): Promise<Post> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.PUBLISH(id), {
    method: "PATCH",
  });
};

export const getUserPosts = async (
  userId: string,
): Promise<PostListResponse> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_USER_POSTS(userId));
};
