// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "user" | "admin";
  };
}

/**
 * Authentication middleware for protected routes
 * Verifies access token from Authorization header
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token) as AuthRequest["user"];
      req.user = decoded;
      next();
    } catch (err: any) {
      // If token is expired, return 401 to prompt client to refresh
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
};
