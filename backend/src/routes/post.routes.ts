// src/routes/post.routes.ts
import express from "express";
import {
  createPost,
  getAllPosts,
  getPublicPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  publishPost,
  savePost,
  unsavePost,
  getSavedPosts,
  moveToTrash,
  getDeletedPosts,
} from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createPostLimiter } from "../middlewares/rate-limit.middleware";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/public", getPublicPosts);
router.get("/user/:userId", getUserPosts);

// saved phải đặt trước :id
router.get("/saved", authMiddleware, getSavedPosts);
router.get("/deleted", authMiddleware, getDeletedPosts);

router.get("/:id", getPostById);

// Protected routes
router.post("/", authMiddleware, createPostLimiter, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id", authMiddleware, publishPost);

router.post("/:id/save", authMiddleware, savePost);
router.delete("/:id/save", authMiddleware, unsavePost);

router.patch("/:id/trash", authMiddleware, moveToTrash);
export default router;
