// src/controllers/post.controller.ts
import { Response } from "express";
import { Post, PostStats } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Create a new post
 */
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, visibility, isAnonymous, status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      userId,
      title,
      content,
      visibility: visibility || "PUBLIC",
      isAnonymous: isAnonymous || false,
      status: status || "DRAFT",
    });

    // Create PostStats entry
    await PostStats.create({
      postId: post._id,
      views: 0,
      likes: 0,
      comments: 0,
      score: 0,
    });

    res.status(201).json(post.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all posts (with pagination)
 */
export const getAllPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status = "PUBLISHED" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find({ status })
      .populate("userId", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments({ status });

    res.json({
      posts,
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
 * Get post by ID
 */
export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate("userId", "name avatar role");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment views
    await PostStats.findOneAndUpdate(
      { postId: id },
      { $inc: { views: 1 } }
    );

    res.json(post.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user's posts
 */
export const getUserPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments({ userId });

    res.json({
      posts,
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
 * Update post
 */
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, visibility, status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is owner or admin
    if (post.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, visibility, status },
      { new: true }
    );

    res.json(updatedPost?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete post
 */
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is owner or admin
    if (post.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Post.findByIdAndDelete(id);
    await PostStats.deleteOne({ postId: id });

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Publish post (change status to PUBLISHED)
 */
export const publishPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { status: "PUBLISHED" },
      { new: true }
    );

    res.json(updatedPost?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
