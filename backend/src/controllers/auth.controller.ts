// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { User } from "../models";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  revokeAccessToken,
  revokeRefreshToken,
} from "../utils/jwt";
import {
  validateData,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../utils/validation";

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateData(registerSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    const { name, email, password } = validation.data!;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Password will be hashed automatically in pre-save hook
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "Register successful. Please log in to continue.",
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateData(loginSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    const { email, password } = validation.data!;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const refreshToken = signRefreshToken(user._id.toString());

    // Set refresh token in httpOnly cookie (secure, not accessible by JS)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      access_token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookieToken = req.cookies?.refreshToken;
    let token = cookieToken;

    if (!token && req.body?.refreshToken) {
      const validation = validateData(refreshTokenSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error });
      }
      token = validation.data!.refreshToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token) as { userId: string };

    // Get user to include in new access token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.json({
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: error.message || "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Get access token from header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];

    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    // Revoke tokens
    if (accessToken) {
      revokeAccessToken(accessToken);
    }

    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logout successful" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ message: error.message || "Logout failed" });
  }
};
