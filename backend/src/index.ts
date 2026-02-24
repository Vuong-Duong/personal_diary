import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";

dotenv.config();

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


//    STATIC FILES
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
//auth
app.use("/api/auth", authRoutes);
//    API PREFIX
app.use("/api", require("./routes")); // bạn gắn router ở đây


//    START SERVER
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


