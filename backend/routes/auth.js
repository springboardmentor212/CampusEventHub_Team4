import express from "express";
import {
    register,
    login,
    getProfile,
    updateProfile,
    verifyEmail,
    deleteAccountByToken,
    resendVerification,
    logout,
    getPendingUsers,
    approveUser,
    rejectUser,
    getPendingStudents,
    getAllUsers,
    getAllColleges,
    createStudent,
    reportNotMe,
    getAllStudentsForCollege
} from "../controllers/authController.js";
// ...existing code...
import { requestPasswordReset, resetPassword, changePassword } from "../controllers/passwordController.js";
import { authenticate, isSuperAdmin, isApprovedCollegeAdmin, isSuperAdminOrCollegeAdmin } from "../middleware/auth.js";
import validateRequest, {
    registerSchema,
    loginSchema,
    requestResetSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../middleware/validateMiddleware.js";


const router = express.Router();
// College Admin: Get all students for their college
router.get("/college/all-students", authenticate, isApprovedCollegeAdmin, getAllStudentsForCollege);

// Public auth routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/logout", logout);

// Email verification & onboarding
router.get("/verify-email/:token", verifyEmail);
router.get("/delete-account/:token", deleteAccountByToken);
router.post("/not-me", reportNotMe);
router.post("/resend-verification", resendVerification);

// Password reset
router.post("/request-password-reset", validateRequest(requestResetSchema), requestPasswordReset);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.patch("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, validateRequest(changePasswordSchema), changePassword);

// Admin routes
// Shared Admin/College Admin routes
router.get("/admin/pending-users", authenticate, isSuperAdmin, getPendingUsers);
router.get("/admin/all-users", authenticate, isSuperAdmin, getAllUsers);
router.get("/admin/all-colleges", authenticate, isSuperAdmin, getAllColleges);
router.get("/college/pending-students", authenticate, isApprovedCollegeAdmin, getPendingStudents);
router.post("/admin/create-student", authenticate, isSuperAdminOrCollegeAdmin, createStudent);
router.patch("/admin/approve-user/:id", authenticate, isSuperAdminOrCollegeAdmin, approveUser);
router.delete("/admin/reject-user/:id", authenticate, isSuperAdminOrCollegeAdmin, rejectUser);

export default router;
