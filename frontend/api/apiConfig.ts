export const API_URL = "http://localhost:8000/api";
export const AUTH_URL = "http://localhost:8000/api/auth";

// export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // === AUTH ===
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },

  // === USER ===
  USER: {
    GET_PROFILE: "/users",
    UPDATE_PROFILE: "/users",
    CHANGE_PASSWORD: "/users/password",
    GET_BY_ID: (id: string) => `/users/${id}`,
    GET_ALL: "/users/admin/users",
    DELETE: (id: string) => `/users/${id}`,
  },

  // === POST ===
  POST: {
    GET_ALL: "/posts",
    CREATE: "/posts",
    GET_BY_ID: (id: string) => `/posts/${id}`,
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    PUBLISH: (id: string) => `/posts/${id}/publish`,
    GET_USER_POSTS: (userId: string) => `/posts/user/${userId}`,
  },

  // === COMMENT ===
  COMMENT: {
    CREATE: "/comments",
    GET_POST_COMMENTS: (postId: string) => `/comments/post/${postId}`,
    GET_BY_ID: (id: string) => `/comments/${id}`,
    UPDATE: (id: string) => `/comments/${id}`,
    DELETE: (id: string) => `/comments/${id}`,
    GET_USER_COMMENTS: (userId: string) => `/comments/user/${userId}`,
  },

  // === POST STATS ===
  STATS: {
    GET_POST_STATS: (postId: string) => `/stats/${postId}`,
    LIKE_POST: (postId: string) => `/stats/${postId}/like`,
    UNLIKE_POST: (postId: string) => `/stats/${postId}/unlike`,
    GET_TOP_POSTS: "/stats/top",
    GET_TRENDING_POSTS: "/stats/trending",
    UPDATE_SCORE: (postId: string) => `/stats/${postId}/score`,
  },
} as const;
