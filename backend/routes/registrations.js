import express from "express";
import {
  registerForEvent,
  getEventRegistrations,
  getMyRegistrations,
  approveRegistration,
  rejectRegistration,
  cancelRegistration,
  markAttendance,
  exportRegistrations,
  getRegistrationStats,
  getAllRegistrations,
  getRegistrationById,
  confirmWaitlist,
  getWaitlistByEvent,
} from "../controllers/registrationController.js";
import { authenticate, isStudent, canManageEvents, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Student routes (stable)
router.get("/my", authenticate, isStudent, getMyRegistrations);
router.delete("/:id/cancel", authenticate, isStudent, cancelRegistration);
router.patch("/:id/confirm-waitlist", authenticate, isStudent, confirmWaitlist);

// MILESTONE 3 FEATURE START
// Student-facing aliases for registration module.
router.post("/register", authenticate, isStudent, registerForEvent);
router.post("/register/:eventId", authenticate, isStudent, registerForEvent);
router.get("/my-registrations", authenticate, isStudent, getMyRegistrations);
router.get("/:id", authenticate, getRegistrationById);
router.delete("/:id", authenticate, isStudent, cancelRegistration);
// MILESTONE 3 FEATURE END

// Admin / College Admin routes
router.get("/event/:eventId", authenticate, canManageEvents, getEventRegistrations);
router.get("/event/:eventId/export", authenticate, canManageEvents, exportRegistrations);
router.patch("/:id/approve", authenticate, canManageEvents, approveRegistration);
router.patch("/:id/reject", authenticate, canManageEvents, rejectRegistration);
router.patch("/:id/attendance", authenticate, canManageEvents, markAttendance);
router.get("/event/:eventId/waitlist", authenticate, canManageEvents, getWaitlistByEvent);

// MILESTONE 3 FEATURE START
router.get("/stats/:eventId", authenticate, canManageEvents, getRegistrationStats);
router.get("/", authenticate, isSuperAdmin, getAllRegistrations);
// MILESTONE 3 FEATURE END

export default router;
