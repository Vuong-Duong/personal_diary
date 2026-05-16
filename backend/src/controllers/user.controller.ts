// src/controllers/user.controller.ts
import { Response } from "express";
import { User, Post, PostStats } from "../models";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Get profile người dùng hiện tại
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update profile người dùng
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, avatar },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user by ID (public info only)
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current user's activity stats
 * - Total likes received on all posts
 * - Total comments received on all posts
 * - Total private posts (including drafts)
 */
export const getUserActivityStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all posts by user
    const userPosts = await Post.find({ userId });
    const postIds = userPosts.map((p) => p._id);

    let totalLikesReceived = 0;
    let totalCommentsReceived = 0;

    if (postIds.length > 0) {
      const stats = await PostStats.find({ postId: { $in: postIds } });

      stats.forEach((s) => {
        totalLikesReceived += s.likes || 0;
        totalCommentsReceived += s.comments || 0;
      });
    }

    const totalPrivatePosts = await Post.countDocuments({
      userId,
      $or: [{ visibility: "PRIVATE" }, { status: "DRAFT" }],
    });

    res.json({
      totalLikesReceived,
      totalCommentsReceived,
      totalPrivatePosts,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
