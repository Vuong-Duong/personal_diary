// src/routes/user.routes.ts
import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  deleteUser,
} from "../controllers/User.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middlewares";

const router = express.Router();

// Public routes
router.get("/:id", getUserById);

// Protected routes (require auth)
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);

// Admin only routes
router.get("/admin/users", authMiddleware, requireRole(["admin"]), getAllUsers);
router.delete("/:id", authMiddleware, requireRole(["admin"]), deleteUser);

export default router;
