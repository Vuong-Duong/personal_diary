// src/controllers/postStats.controller.ts
import { Response } from "express";
import { PostStats, Post } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Get stats for a specific post
 */
export const getPostStats = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const stats = await PostStats.findOne({ postId });

    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    res.json(stats.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Like a post
 */
export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const stats = await PostStats.findOneAndUpdate(
      { postId },
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json(stats?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unlike a post
 */
export const unlikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const stats = await PostStats.findOne({ postId });
    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    // Ensure likes doesn't go below 0
    const likes = stats.likes > 0 ? stats.likes - 1 : 0;

    const updatedStats = await PostStats.findOneAndUpdate(
      { postId },
      { likes },
      { new: true }
    );

    res.json(updatedStats?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get top posts by score
 */
export const getTopPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const stats = await PostStats.find()
      .sort({ score: -1 })
      .limit(Number(limit))
      .populate("postId");

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get trending posts (by views)
 */
export const getTrendingPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const stats = await PostStats.find()
      .sort({ views: -1 })
      .limit(Number(limit))
      .populate("postId");

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update post score (admin only)
 */
export const updatePostScore = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { score } = req.body;

    if (score === undefined || typeof score !== "number") {
      return res.status(400).json({ message: "Score must be a number" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const stats = await PostStats.findOneAndUpdate(
      { postId },
      { score },
      { new: true }
    );

    res.json(stats?.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
