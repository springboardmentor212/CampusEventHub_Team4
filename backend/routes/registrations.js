import express from "express";
import {
    getEventRegistrations,
    getMyRegistrations,
    approveRegistration,
    rejectRegistration,
    cancelRegistration,
    markAttendance,
    exportRegistrations,
} from "../controllers/registrationController.js";
import { authenticate, isStudent, canManageEvents } from "../middleware/auth.js";

const router = express.Router();

// Student routes
router.get("/my", authenticate, isStudent, getMyRegistrations);
router.delete("/:id/cancel", authenticate, isStudent, cancelRegistration);

// Admin / College Admin routes
router.get("/event/:eventId", authenticate, canManageEvents, getEventRegistrations);
router.get("/event/:eventId/export", authenticate, canManageEvents, exportRegistrations);
router.patch("/:id/approve", authenticate, canManageEvents, approveRegistration);
router.patch("/:id/reject", authenticate, canManageEvents, rejectRegistration);
router.patch("/:id/attendance", authenticate, canManageEvents, markAttendance);

export default router;
