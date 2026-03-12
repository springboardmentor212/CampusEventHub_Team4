import express from "express";
import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
  getRegistrationStats,
  getAllRegistrations,
  approveRegistration,
  rejectRegistration,
  getRegistrationById,
} from "../controllers/registrationController.js";
import { authenticate, authorize, isStudent, isCollegeAdmin, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/event/:eventId", getEventRegistrations);

// Protected routes for all authenticated users
router.get("/my-registrations", authenticate, getMyRegistrations);
router.get("/:id", authenticate, getRegistrationById);
router.delete("/:id", authenticate, cancelRegistration);

// Student registration routes
router.post("/register", authenticate, isStudent, registerForEvent);

// Admin management routes
router.patch("/:id/approve", authenticate, authorize("college_admin", "admin"), approveRegistration);
router.patch("/:id/reject", authenticate, authorize("college_admin", "admin"), rejectRegistration);
router.get("/stats/:eventId", authenticate, authorize("college_admin", "admin"), getRegistrationStats);

// Super admin only routes
router.get("/", authenticate, isAdmin, getAllRegistrations);

export default router;
