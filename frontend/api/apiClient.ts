import { API_URL, API_ENDPOINTS } from "./apiConfig";

// Store access token in memory only; do not persist it to cookies/localStorage.
let accessToken: string | null = null;

/**
 * Set the access token (called after login/token refresh)
 */
export function setAccessToken(token: string) {
  accessToken = token;
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear the access token (called on logout)
 */
export function clearAccessToken() {
  accessToken = null;
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken() {
  try {
    const response = await fetch(
      `${API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies (refresh token)
        body: JSON.stringify({}),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to refresh token");
    }

    if (data.access_token) {
      setAccessToken(data.access_token);
      return data.access_token;
    }

    throw new Error("No access token in response");
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAccessToken();
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent("tokenExpired"));
    throw error;
  }
}

// For authenticated APIs
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = accessToken;

  let contentTypeHeader = {};
  if (
    options.body &&
    typeof options.body === "string" &&
    (!options.headers || !("Content-Type" in options.headers)) &&
    ["POST", "PUT", "PATCH"].includes((options.method || "").toUpperCase())
  ) {
    contentTypeHeader = { "Content-Type": "application/json" };
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...contentTypeHeader,
    ...options.headers,
  };

  const fullUrl = `${API_URL}${url}`;

  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // Include cookies (refresh token)
  });

  // Handle token expiration
  if (response.status === 401) {
    const data = await response.json();
    if (data.code === "TOKEN_EXPIRED") {
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        // Retry the original request with new token
        const retryHeaders = {
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          ...contentTypeHeader,
          ...options.headers,
        };

        response = await fetch(fullUrl, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to refresh token, user must login again", error);
        clearAccessToken();
        window.dispatchEvent(new CustomEvent("tokenExpired"));
        throw error;
      }
    } else {
      // Other 401 errors (invalid token, etc.)
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("tokenExpired"));
    }
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    if (!response.ok) {
      const error: any = new Error(
        "Request failed with status " + response.status,
      );
      error.status = response.status;
      throw error;
    }
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// For public APIs that don't need authentication
export async function fetchWithoutAuth(url: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const fullUrl = `${API_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // Include cookies for refresh token
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
