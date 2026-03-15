import express from "express";
import {
  submitFeedback,
  getFeedbackByEvent,
  getMyFeedback,
  getSuperAdminFeedbackAnalytics,
  getCollegeAdminFeedback,
} from "../controllers/feedbackController.js";
import { authenticate, isStudent, isSuperAdmin, isApprovedCollegeAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, isStudent, submitFeedback);
router.get("/event/:eventId", getFeedbackByEvent);
router.get("/my", authenticate, isStudent, getMyFeedback);
router.get("/admin/analytics", authenticate, isSuperAdmin, getSuperAdminFeedbackAnalytics);
router.get("/college/mine", authenticate, isApprovedCollegeAdmin, getCollegeAdminFeedback);

export default router;
