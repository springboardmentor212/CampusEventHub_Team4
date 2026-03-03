import express from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  registerForEvent,
  approveEvent,
  getPendingEvents,
} from "../controllers/eventController.js";
import { authenticate, isApprovedCollegeAdmin, canManageEvents, isStudent, isSuperAdmin } from "../middleware/auth.js";
import validateRequest, { createEventSchema, updateEventSchema } from "../middleware/validateMiddleware.js";

const router = express.Router();

// 1. Browsing Authority (Public)
router.get("/", getEvents);
router.get("/:id", getEvent);

// 2. Participation Authority (Student-Only)
router.post("/:id/register", authenticate, isStudent, registerForEvent);

// 3. Management Authority (Approved College Admin or SuperAdmin)
router.post("/create", authenticate, canManageEvents, validateRequest(createEventSchema), createEvent);
router.get("/my/events", authenticate, canManageEvents, getMyEvents);

// 4. Owner Authority (Resource Specific)
router.patch("/:id", authenticate, canManageEvents, validateRequest(updateEventSchema), updateEvent);
router.delete("/:id", authenticate, canManageEvents, deleteEvent);

// 5. Admin Authority (SuperAdmin only)
router.get("/admin/pending-events", authenticate, isSuperAdmin, getPendingEvents);
router.patch("/:id/approve", authenticate, isSuperAdmin, approveEvent);

export default router;
