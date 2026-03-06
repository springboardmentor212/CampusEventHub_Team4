import express from "express";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getMyNotifications);
router.patch("/read", authenticate, markAsRead);

export default router;
