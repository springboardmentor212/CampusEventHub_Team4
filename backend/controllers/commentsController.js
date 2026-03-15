import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Comment } from "../models/Comment.js";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";

export const postComment = catchAsync(async (req, res, next) => {
  const { eventId, message } = req.body;

  if (!eventId || !message || !String(message).trim()) {
    return next(new AppError("eventId and message are required", 400));
  }

  if (req.userRole !== "student") {
    return next(new AppError("Only approved students can post comments", 403));
  }

  const event = await Event.findById(eventId).select("_id isActive isApproved");
  if (!event || !event.isActive || !event.isApproved) {
    return next(new AppError("Event not available for discussion", 404));
  }

  const hasRegistration = await Registration.findOne({
    event: eventId,
    user: req.userId,
    status: { $in: ["pending", "approved", "attended", "no-show"] },
  }).select("_id");

  if (!hasRegistration) {
    return next(new AppError("You must register for this event before posting in discussion", 403));
  }

  const comment = await Comment.create({
    eventId,
    userId: req.userId,
    message: String(message).trim(),
  });

  await comment.populate("userId", "firstName lastName college");

  res.status(201).json({
    success: true,
    message: "Comment posted",
    data: { comment },
  });
});

export const getCommentsByEvent = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  const comments = await Comment.find({ eventId })
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      select: "firstName lastName college",
      populate: { path: "college", select: "name code" },
    });

  res.status(200).json({
    success: true,
    data: { comments },
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const isOwner = String(comment.userId) === String(req.userId);
  let isCollegeAdminForOwnEvent = false;

  if (req.userRole === "college_admin") {
    const event = await Event.findById(comment.eventId).select("createdBy");
    isCollegeAdminForOwnEvent = event && String(event.createdBy) === String(req.userId);
  }

  if (!isOwner && !isCollegeAdminForOwnEvent) {
    return next(new AppError("Not authorized to delete this comment", 403));
  }

  await Comment.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});
