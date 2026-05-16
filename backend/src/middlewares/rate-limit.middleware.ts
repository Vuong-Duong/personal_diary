import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Middleware
 */

const rateLimitResponse = (message: string) => ({
  message,
  code: "RATE_LIMITED",
});

/**
 * Strict rate limiter for login - 5 requests per minute per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: rateLimitResponse("Too many login attempts, please try again later"),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Moderate rate limiter for registration - 3 requests per hour per IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: rateLimitResponse(
    "Too many registration attempts, please try again later",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter - 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: rateLimitResponse(
    "Too many requests from this IP, please try again later",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create post rate limiter - 20 requests per hour per IP
 */
export const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 post creations per hour
  message: rateLimitResponse("Too many posts created, please try again later"),
  standardHeaders: true,
  legacyHeaders: false,
});
