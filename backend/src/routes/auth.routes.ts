// src/routes/auth.routes.ts
import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import {
  loginLimiter,
  registerLimiter,
} from "../middlewares/rate-limit.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @body    { name, email, password }
 * @returns { message, user }
 */
router.post("/register", registerLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return access token + refresh token
 * @body    { email, password }
 * @returns { message, access_token, user }
 */
router.post("/login", loginLimiter, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @body    { refreshToken } (or in cookie)
 * @returns { message, access_token }
 */
router.post("/refresh-token", refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke tokens
 * @access  Protected
 * @returns { message }
 */
router.post("/logout", authMiddleware, logout);

export default router;
