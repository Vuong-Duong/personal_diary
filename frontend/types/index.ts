export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type PostVisibility = "PRIVATE" | "PUBLIC";
export type PostStatus = "DRAFT" | "PUBLISHED";

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: PostVisibility;
  isAnonymous: boolean;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PostStats {
  id: string;
  postId: string;
  views: number;
  likes: number;
  comments: number;
  score: number;
}

// Request DTOs
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  visibility?: PostVisibility;
  isAnonymous?: boolean;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  visibility?: PostVisibility;
  isAnonymous?: boolean;
  status?: PostStatus;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  isAnonymous?: boolean;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response DTOs
export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
