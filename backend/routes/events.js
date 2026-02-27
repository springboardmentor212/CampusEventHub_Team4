import express from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getEvents); // Get all events with filtering
router.get("/:id", getEvent); // Get single event by ID

// Protected routes (require authentication)
router.use(authenticate); // All routes below this require authentication

// College Admin routes
router.post("/create", createEvent); // Create new event (College Admin only)
router.get("/my/events", getMyEvents); // Get events created by current user (College Admin)

// Event management routes (College Admin who created event or System Admin)
router.patch("/:id", updateEvent); // Update event
router.delete("/:id", deleteEvent); // Delete event

export default router;
