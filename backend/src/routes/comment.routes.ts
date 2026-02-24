// src/routes/comment.routes.ts
import express from "express";
import {
  createComment,
  getPostComments,
  getCommentById,
  updateComment,
  deleteComment,
  getUserComments,
} from "../controllers/Comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes
router.get("/post/:postId", getPostComments);
router.get("/user/:userId", getUserComments);
router.get("/:id", getCommentById);

// Protected routes (require auth)
router.post("/", authMiddleware, createComment);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
