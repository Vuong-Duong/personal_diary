import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import type { Comment, CreateCommentRequest, UpdateCommentRequest, ApiResponse } from "@/types";

export const createComment = async (data: CreateCommentRequest): Promise<ApiResponse<Comment>> => {
  return await fetchWithAuth(API_ENDPOINTS.COMMENT.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getPostComments = async (postId: string): Promise<ApiResponse<Comment[]>> => {
  return await fetchWithoutAuth(
    API_ENDPOINTS.COMMENT.GET_POST_COMMENTS(postId)
  );
};

export const updateComment = async (id: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> => {
  return await fetchWithAuth(API_ENDPOINTS.COMMENT.UPDATE(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteComment = async (id: string): Promise<ApiResponse<void>> => {
  return await fetchWithAuth(API_ENDPOINTS.COMMENT.DELETE(id), {
    method: "DELETE",
  });
};

export const getUserComments = async (userId: string): Promise<ApiResponse<Comment[]>> => {
  return await fetchWithoutAuth(
    API_ENDPOINTS.COMMENT.GET_USER_COMMENTS(userId)
  );
};