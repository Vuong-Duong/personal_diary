// src/routes/postStats.routes.ts
import express from "express";
import {
  getPostStats,
  likePost,
  unlikePost,
  getTopPosts,
  getTrendingPosts,
  updatePostScore,
} from "../controllers/PostStats.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middlewares";

const router = express.Router();

// Public routes
router.get("/:postId", getPostStats);
router.get("/trending", getTrendingPosts);
router.get("/top", getTopPosts);

// Protected routes (require auth)
router.post("/:postId/like", authMiddleware, likePost);
router.post("/:postId/unlike", authMiddleware, unlikePost);

// Admin only routes
router.put("/:postId/score", authMiddleware, requireRole(["admin"]), updatePostScore);

export default router;
