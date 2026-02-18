import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import collegeRoutes from "./routes/colleges.js";

/*
  Environment configuration
  If running inside Docker, NODE_ENV=docker will be set
  Otherwise default to local configuration
*/

if (process.env.NODE_ENV === "docker") {
  dotenv.config({ path: "./.env" });
} else {
  dotenv.config({ path: "./.env.local" });
}

const app = express();

/*
  Middleware
*/
app.use(cors());
app.use(express.json());

/*
  Routes
*/
app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);

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

/*
  MongoDB Connection
  Uses MONGO_URI from environment variables
*/
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

/*
  Start Server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});