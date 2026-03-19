import express from "express";
import {
    getSuperAdminStats,
    getCollegeAdminStats,
    getStudentStats,
    getAnalytics,
    getPlatformSignals
} from "../controllers/dashboardController.js";
import { authenticate, isSuperAdmin, isApprovedCollegeAdmin, isStudent, isSuperAdminOrCollegeAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/super-admin", authenticate, isSuperAdmin, getSuperAdminStats);
router.get("/college-admin", authenticate, isApprovedCollegeAdmin, getCollegeAdminStats);
router.get("/student", authenticate, isStudent, getStudentStats);
router.get("/analytics", authenticate, isSuperAdminOrCollegeAdmin, getAnalytics);
router.get("/signals", authenticate, isSuperAdmin, getPlatformSignals);

export default router;
