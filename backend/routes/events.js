import express from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  approveEvent,
  rejectEvent,
  getPendingEvents,
  cancelEvent,
  pauseEvent,
  resumeEvent,
} from "../controllers/eventController.js";
import { authenticate, isApprovedCollegeAdmin, isSuperAdmin, optionalAuthenticate } from "../middleware/auth.js";
import validateRequest, { createEventSchema, updateEventSchema } from "../middleware/validateMiddleware.js";

const router = express.Router();

// 1. Browsing Authority (Public — with optional auth so scope filter can read req.user)
router.get("/", optionalAuthenticate, getEvents);
router.get("/:id", getEvent);

// 2. Management Authority (Approved College Admin or SuperAdmin)
router.post("/create", authenticate, isApprovedCollegeAdmin, validateRequest(createEventSchema), createEvent);
router.get("/my/events", authenticate, isApprovedCollegeAdmin, getMyEvents);

// 3. Owner Authority (Resource Specific)
router.patch("/:id", authenticate, isApprovedCollegeAdmin, validateRequest(updateEventSchema), updateEvent);
router.patch("/:id/cancel", authenticate, isApprovedCollegeAdmin, cancelEvent);
router.patch("/:id/pause", authenticate, isApprovedCollegeAdmin, pauseEvent);
router.patch("/:id/resume", authenticate, isApprovedCollegeAdmin, resumeEvent);
router.delete("/:id", authenticate, isApprovedCollegeAdmin, deleteEvent);

// 4. Admin Authority (SuperAdmin only)
router.get("/admin/pending-events", authenticate, isSuperAdmin, getPendingEvents);
router.patch("/:id/approve", authenticate, isSuperAdmin, approveEvent);
router.delete("/:id/reject", authenticate, isSuperAdmin, rejectEvent);

export default router;
