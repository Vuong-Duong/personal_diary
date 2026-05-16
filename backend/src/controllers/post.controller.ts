// src/controllers/post.controller.ts
import { Response } from "express";
import { Post, PostStats } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Types } from "mongoose";
import {
  validateData,
  createPostSchema,
  updatePostSchema,
  publishPostSchema,
} from "../utils/validation";

/**
 * Create a new post
 */
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate input
    const validation = validateData(createPostSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    const { title, content, visibility, isAnonymous, status } = validation.data!;

    const post = await Post.create({
      userId,
      title,
      content,
      visibility,
      isAnonymous,
      status,
    });

    // Create PostStats entry
    await PostStats.create({
      postId: post._id,
      views: 0,
      likes: 0,
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
 * Get all public posts (PUBLISHED & visibility PUBLIC)
 */
export const getPublicPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    };

    const posts = await Post.find(filter)
      .populate("userId", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);

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
    await PostStats.findOneAndUpdate({ postId: id }, { $inc: { views: 1 } });

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
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate input
    const validation = validateData(updatePostSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is owner or admin
    if (post.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to update this post",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    });

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
 * Publish post / toggle visibility (PUBLIC <-> PRIVATE)
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

    const validation = validateData(publishPostSchema, req.body ?? {});
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    const { status, visibility } = validation.data!;

    if (status || visibility) {
      if (status) {
        post.status = status;
      }
      if (visibility) {
        post.visibility = visibility;
      }
    } else if (post.status !== "PUBLISHED") {
      post.status = "PUBLISHED";
      post.visibility = "PUBLIC";
    } else {
      post.visibility = post.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    }

    await post.save();

    res.json(post.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Save post
 */
export const savePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      {
        $addToSet: { savedBy: new Types.ObjectId(userId) },
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      message: "Post saved successfully",
      post: post.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Unsave post
 */
export const unsavePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { savedBy: new Types.ObjectId(userId) },
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      message: "Post unsaved successfully",
      post: post.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Get saved posts (only PUBLIC)
 */
export const getSavedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      savedBy: new Types.ObjectId(userId),
      visibility: "PUBLIC",
      status: "PUBLISHED",
    };

    const posts = await Post.find(filter)
      .populate("userId", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);

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
 * Move post to trash (soft delete)
 */
export const moveToTrash = async (req: AuthRequest, res: Response) => {
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

    // Check quyền
    if (post.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();

    await post.save();

    res.json({
      message: "Post moved to trash",
      post: post.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getDeletedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const posts = await Post.find({
      userId: userId,
      isDeleted: true,
    }).sort({ deletedAt: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
