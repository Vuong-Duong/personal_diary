// src/routes/postStats.routes.ts
import express from "express";
import {
  getPostStats,
  likePost,
  unlikePost,
  getTopPosts,
  getTrendingPosts,
} from "../controllers/postStats.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes
router.get("/trending", getTrendingPosts);
router.get("/top", getTopPosts);
router.get("/:postId", getPostStats);

// Protected routes (require auth)
router.post("/:postId/like", authMiddleware, likePost);
router.post("/:postId/unlike", authMiddleware, unlikePost);

export default router;
