import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

/**
 * In-memory token blacklist for logout functionality
 * In production, use Redis for distributed caching
 */
const tokenBlacklist = new Set<string>();

/**
 * In-memory refresh token storage
 * In production, use Redis with TTL
 * Format: Map<refreshToken, { userId, expiresAt }>
 */
const refreshTokenStorage = new Map<
  string,
  { userId: string; expiresAt: number }
>();

/**
 * Sign Access Token (short-lived: 15 minutes)
 */
export const signAccessToken = (payload: { userId: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

/**
 * Sign Refresh Token (long-lived: 7 days)
 */
export const signRefreshToken = (userId: string) => {
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  // Store refresh token in memory with expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  refreshTokenStorage.set(refreshToken, { userId, expiresAt });

  return refreshToken;
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error("Token has been revoked");
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      userId: string;
      iat: number;
      exp: number;
    };

    // Check if token exists in storage
    const storedToken = refreshTokenStorage.get(token);
    if (!storedToken) {
      throw new Error("Refresh token not found or has been revoked");
    }

    // Check if token has expired
    if (Date.now() > storedToken.expiresAt) {
      refreshTokenStorage.delete(token);
      throw new Error("Refresh token has expired");
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke Refresh Token (for logout)
 */
export const revokeRefreshToken = (token: string) => {
  refreshTokenStorage.delete(token);
};

/**
 * Revoke Access Token (add to blacklist for logout)
 */
export const revokeAccessToken = (token: string) => {
  tokenBlacklist.add(token);

  // Cleanup: Remove from blacklist after token expiration
  // In production, this should be handled by Redis TTL
  setTimeout(
    () => {
      tokenBlacklist.delete(token);
    },
    15 * 60 * 1000,
  ); // 15 minutes (access token lifetime)
};

/**
 * Cleanup expired refresh tokens (call periodically)
 */
export const cleanupExpiredRefreshTokens = () => {
  const now = Date.now();
  for (const [token, data] of refreshTokenStorage.entries()) {
    if (now > data.expiresAt) {
      refreshTokenStorage.delete(token);
    }
  }
};

// Cleanup every hour
setInterval(cleanupExpiredRefreshTokens, 60 * 60 * 1000);
