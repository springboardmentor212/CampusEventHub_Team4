import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import collegeRoutes from "./routes/colleges.js";
import eventRoutes from "./routes/events.js";
import dashboardRoutes from "./routes/dashboards.js";
import notificationRoutes from "./routes/notifications.js";
import registrationRoutes from "./routes/registrations.js";
import mediaRoutes from "./routes/media.js";
import feedbackRoutes from "./routes/feedback.js";
import commentsRoutes from "./routes/comments.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import AppError from "./utils/appError.js";
import { initJobs } from "./jobs/eventJobs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
const BACKEND_BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const uploadsPath = path.join(__dirname, "uploads");

/*
  Environment configuration
*/
dotenv.config({ path: ".env.local" });
dotenv.config();

// Critical Environment Variable Check
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];
requiredEnv.forEach((env) => {
  if (!process.env[env] && process.env.NODE_ENV !== "test") {
    console.warn(`WARNING: Missing environment variable ${env}`);
  }
});

const app = express();
app.set("trust proxy", 1);
app.use(helmet());

/*
  Middleware
*/
// CORS Hardening
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve locally uploaded images
app.use("/uploads", express.static(uploadsPath));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for development, lower for production in real scenarios
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/*
  Routes
*/
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/comments", commentsRoutes);

/*
  Basic Health Route
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Backend running",
    message: "CampusEventHub API is ready",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "campus-event-hub-backend",
    uptime: process.uptime(),
    sampleBannerImage: `${BACKEND_BASE_URL}/uploads/test.png`,
  });
});

// Handling Unhandled Routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

/*
  MongoDB Connection
*/
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
} else {
  console.error("error: MONGO_URI is not defined");
}

/*
  Start Server
*/
initJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads static path: ${uploadsPath}`);
  console.log(`Seed image URL: ${BACKEND_BASE_URL}/uploads/test.png`);
});

