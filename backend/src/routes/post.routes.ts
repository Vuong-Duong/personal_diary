// src/routes/post.routes.ts
import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  publishPost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPostById);

// Protected routes (require auth)
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/publish", authMiddleware, publishPost);

export default router;
