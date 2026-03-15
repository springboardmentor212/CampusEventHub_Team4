import express from "express";
import {
  postComment,
  getCommentsByEvent,
  deleteComment,
} from "../controllers/commentsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, postComment);
router.get("/event/:eventId", getCommentsByEvent);
router.delete("/:id", authenticate, deleteComment);

export default router;
