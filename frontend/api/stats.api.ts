import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type { PostStats, Post, ApiResponse } from "@/types";

export const getPostStats = async (postId: string): Promise<ApiResponse<PostStats>> => {
  return await fetchWithoutAuth(
    API_ENDPOINTS.STATS.GET_POST_STATS(postId)
  );
};

export const likePost = async (postId: string): Promise<ApiResponse<PostStats>> => {
  return await fetchWithAuth(
    API_ENDPOINTS.STATS.LIKE_POST(postId),
    { method: "POST" }
  );
};

export const unlikePost = async (postId: string): Promise<ApiResponse<PostStats>> => {
  return await fetchWithAuth(
    API_ENDPOINTS.STATS.UNLIKE_POST(postId),
    { method: "POST" }
  );
};

export const getTopPosts = async (): Promise<ApiResponse<Post[]>> => {
  return await fetchWithoutAuth(API_ENDPOINTS.STATS.GET_TOP_POSTS);
};

export const getTrendingPosts = async (): Promise<ApiResponse<Post[]>> => {
  return await fetchWithoutAuth(API_ENDPOINTS.STATS.GET_TRENDING_POSTS);
};

export const updateScore = async (postId: string): Promise<ApiResponse<PostStats>> => {
  return await fetchWithAuth(
    API_ENDPOINTS.STATS.UPDATE_SCORE(postId),
    { method: "PATCH" }
  );
};