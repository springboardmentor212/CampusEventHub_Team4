import mongoose from "mongoose";
import dotenv from "dotenv";
import { initJobs } from "./jobs/eventJobs.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

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

if (process.env.NODE_ENV !== "test") {
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

  initJobs();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

