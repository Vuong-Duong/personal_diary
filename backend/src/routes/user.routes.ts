// src/routes/user.routes.ts
import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  deleteUser,
  getUserActivityStats,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middlewares";

const router = express.Router();

// Protected routes (require auth)
router.get("/", authMiddleware, getProfile);
router.get("/stats/activity", authMiddleware, getUserActivityStats);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);

// Admin only routes
router.get("/admin/users", authMiddleware, requireRole(["admin"]), getAllUsers);
router.delete("/:id", authMiddleware, requireRole(["admin"]), deleteUser);

// Public routes
router.get("/:id", getUserById);

export default router;
