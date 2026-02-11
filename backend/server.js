import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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
  Basic Health Route
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Backend running",
  });
});

/*
  Start Server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
