import Cookies from "js-cookie";
import { API_URL } from "./apiConfig";

// For authenticated APIs
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from cookies
  const token = Cookies.get("token");

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

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

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
  console.log(
    "fetchWithoutAuth - fullUrl:",
    fullUrl,
    "API_URL:",
    API_URL,
    "url:",
    url,
  );

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
