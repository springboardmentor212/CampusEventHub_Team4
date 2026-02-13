import express from "express";
import { register, login, getProfile, updateProfile, verifyEmail } from "../controllers/authController.js";
import { requestPasswordReset, resetPassword, changePassword } from "../controllers/passwordController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Protected routes (authentication required)
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

export default router;
