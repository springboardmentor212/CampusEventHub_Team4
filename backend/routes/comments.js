import express from "express";
import {
  postComment,
  getCommentsByEvent,
  deleteComment,
  getModerationComments,
  toggleCommentLike,
  togglePinComment,
  postOfficialReply,
} from "../controllers/commentsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, postComment);
router.get("/event/:eventId", getCommentsByEvent);
router.get("/admin/moderation", authenticate, getModerationComments);
router.patch("/:id/like", authenticate, toggleCommentLike);
router.patch("/:id/pin", authenticate, togglePinComment);
router.post("/:id/official-reply", authenticate, postOfficialReply);
router.delete("/:id", authenticate, deleteComment);

export default router;
