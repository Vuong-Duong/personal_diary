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
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let stats = await PostStats.findOne({ postId });

    // Create stats entry if somehow missing
    if (!stats) {
      stats = await PostStats.create({
        postId,
        views: 0,
        likes: 0,
        likedBy: [],
      });
    }

    // If user already liked, do not increment again
    const alreadyLiked = stats.likedBy?.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    stats.likes += 1;
    // Mongoose will cast string -> ObjectId
    // @ts-expect-error Mongoose cast
    stats.likedBy.push(userId);

    await stats.save();

    res.json(stats.toJSON());
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
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const stats = await PostStats.findOne({ postId });
    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    const likedIndex = stats.likedBy.findIndex(
      (id) => id.toString() === userId,
    );

    if (likedIndex === -1) {
      return res
        .status(400)
        .json({ message: "You have not liked this post yet" });
    }

    // Remove user from likedBy and decrement likes (not below 0)
    stats.likedBy.splice(likedIndex, 1);
    stats.likes = Math.max(0, stats.likes - 1);

    await stats.save();

    res.json(stats.toJSON());
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
