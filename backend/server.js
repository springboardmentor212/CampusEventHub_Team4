import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import collegeRoutes from "./routes/colleges.js";
import eventRoutes from "./routes/events.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import AppError from "./utils/appError.js";

/*
  Environment configuration
*/
if (process.env.NODE_ENV === "docker") {
  dotenv.config({ path: "./.env" });
} else {
  dotenv.config({ path: "./.env.local" });
}

// Critical Environment Variable Check
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];
requiredEnv.forEach((env) => {
  if (!process.env[env] && process.env.NODE_ENV !== "test") {
    console.warn(`WARNING: Missing environment variable ${env}`);
  }
});

const app = express();

/*
  Middleware
*/
// CORS Hardening
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});