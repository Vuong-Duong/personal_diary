import express from "express";
import userRoutes from "./user.routes";
import postRoutes from "./post.routes";
import commentRoutes from "./comment.routes";
import postStatsRoutes from "./postStats.routes";

const router = express.Router();

// User routes
router.use("/users", userRoutes);

// Post routes
router.use("/posts", postRoutes);

// Comment routes
router.use("/comments", commentRoutes);

// PostStats routes
router.use("/stats", postStatsRoutes);

export = router;
