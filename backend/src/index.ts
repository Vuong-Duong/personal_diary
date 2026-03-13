import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { connectDB } from "./config/db";



const app = express();
const server = http.createServer(app);

// BODY PARSER (10MB)
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));


//    CORS CONFIG
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [];

const allowedOrigins = ["http://localhost:3000", ...frontendUrls].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

//    ROUTES
app.use("/api/auth", authRoutes);
app.use("/api", require("./routes"));

//    ERROR HANDLING (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//    START SERVER
const port = process.env.PORT || 8000;

const startServer = async () => {
  console.log("🚀 Starting server...");
  await connectDB();
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});


