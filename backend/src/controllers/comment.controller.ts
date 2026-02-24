// src/controllers/comment.controller.ts
import { Response } from "express";
import { Comment, Post, PostStats } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Create a new comment
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content, isAnonymous } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!postId || !content) {
      return res.status(400).json({ message: "PostId and content are required" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      postId,
      userId,
      content,
      isAnonymous: isAnonymous || false,
    });

    // Increment comment count in PostStats
    await PostStats.findOneAndUpdate(
      { postId },
      { $inc: { comments: 1 } }
    );

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name avatar role");

    res.status(201).json(populatedComment?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all comments for a post
 */
export const getPostComments = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId })
      .populate("userId", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ postId });

    res.json({
      comments,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get comment by ID
 */
export const getCommentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id)
      .populate("userId", "name avatar role")
      .populate("postId", "title");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(comment.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update comment
 */
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is owner or admin
    if (comment.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    ).populate("userId", "name avatar role");

    res.json(updatedComment?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete comment
 */
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is owner or admin
    if (comment.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Comment.findByIdAndDelete(id);

    // Decrement comment count in PostStats
    await PostStats.findOneAndUpdate(
      { postId: comment.postId },
      { $inc: { comments: -1 } }
    );

    res.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user's comments
 */
export const getUserComments = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({ userId })
      .populate("userId", "name avatar role")
      .populate("postId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ userId });

    res.json({
      comments,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
