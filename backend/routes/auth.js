import express from "express";
import {
    register,
    login,
    getProfile,
    updateProfile,
    verifyEmail,
    logout,
    getPendingUsers,
    approveUser,
    rejectUser,
    getPendingStudents,
    getAllUsers,
    getAllColleges,
} from "../controllers/authController.js";
import { requestPasswordReset, resetPassword, changePassword } from "../controllers/passwordController.js";
import { authenticate, isSuperAdmin } from "../middleware/auth.js";
import validateRequest, {
    registerSchema,
    loginSchema,
    requestResetSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", validateRequest(requestResetSchema), requestPasswordReset);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, validateRequest(changePasswordSchema), changePassword);

// Admin routes
// Shared Admin/College Admin routes
router.get("/admin/pending-users", authenticate, isSuperAdmin, getPendingUsers);
router.get("/admin/all-users", authenticate, isSuperAdmin, getAllUsers);
router.get("/admin/all-colleges", authenticate, isSuperAdmin, getAllColleges);
router.get("/college/pending-students", authenticate, getPendingStudents);
router.patch("/admin/approve-user/:id", authenticate, approveUser); // Middlewares inside controller check permissions
router.delete("/admin/reject-user/:id", authenticate, rejectUser);

export default router;
