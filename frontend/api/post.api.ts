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

export const getPublicPosts = async (): Promise<PostListResponse> => {
  return await fetchWithoutAuth(API_ENDPOINTS.POST.GET_PUBLIC);
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

export const savePost = async (id: string): Promise<void> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.SAVE(id), {
    method: "POST",
  });
};
export const unsavePost = async (id: string): Promise<void> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.UNSAVE(id), {
    method: "DELETE",
  });
};

export const getSavedPosts = async (): Promise<PostListResponse> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.GET_SAVED);
};

export const moveToTrash = async (id: string): Promise<void> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.MOVE_TO_TRASH(id), {
    method: "PATCH",
  });
};

export const getDeletedPosts = async (): Promise<PostListResponse> => {
  return await fetchWithAuth(API_ENDPOINTS.POST.GET_DELETED);
};
