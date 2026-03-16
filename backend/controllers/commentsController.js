import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Comment } from "../models/Comment.js";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";

const buildThreadedComments = (rows) => {
  const byId = new Map();
  const roots = [];

  rows.forEach((row) => {
    byId.set(String(row._id), {
      ...row.toObject(),
      replies: [],
      likesCount: Number(row.likesCount || row.likedBy?.length || 0),
    });
  });

  byId.forEach((row) => {
    if (row.parentCommentId) {
      const parent = byId.get(String(row.parentCommentId));
      if (parent) {
        parent.replies.push(row);
      } else {
        roots.push(row);
      }
    } else {
      roots.push(row);
    }
  });

  roots.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  roots.forEach((root) => {
    root.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  return roots;
};

const canManageCommentForEvent = (event, req) => {
  if (!event || !req?.user) return false;
  if (req.userRole === "admin") return true;
  if (req.userRole === "college_admin" && String(event.createdBy) === String(req.userId)) return true;
  return false;
};

export const postComment = catchAsync(async (req, res, next) => {
  const { eventId, message, parentCommentId } = req.body;

  if (!eventId || !message || !String(message).trim()) {
    return next(new AppError("eventId and message are required", 400));
  }

  if (!["student", "college_admin", "admin"].includes(req.userRole)) {
    return next(new AppError("Only authenticated users can post comments", 403));
  }

  const event = await Event.findById(eventId).select("_id isActive isApproved createdBy");
  if (!event || !event.isActive || !event.isApproved) {
    return next(new AppError("Event not available for discussion", 404));
  }

  let parent = null;
  if (parentCommentId) {
    parent = await Comment.findOne({ _id: parentCommentId, eventId }).select("_id");
    if (!parent) {
      return next(new AppError("Parent comment not found for this event", 404));
    }
  }

  if (req.userRole === "student") {
    const hasRegistration = await Registration.findOne({
      event: eventId,
      user: req.userId,
      status: { $in: ["approved", "waitlisted", "attended", "no_show"] },
    }).select("_id");

    if (!hasRegistration) {
      return next(new AppError("You must register for this event before posting in discussion", 403));
    }
  } else {
    const canManage = canManageCommentForEvent(event, req);
    if (!canManage) {
      return next(new AppError("Only event owner admins can post admin replies", 403));
    }
    if (!parentCommentId) {
      return next(new AppError("Admin replies must target an existing comment", 400));
    }
  }

  const isOfficialReply = req.userRole !== "student";

  const comment = await Comment.create({
    eventId,
    userId: req.userId,
    message: String(message).trim(),
    parentCommentId: parent?._id || null,
    isOfficialReply,
    officialResponder: isOfficialReply ? req.userId : null,
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
    .sort({ isPinned: -1, createdAt: -1 })
    .populate({
      path: "userId",
      select: "firstName lastName college",
      populate: { path: "college", select: "name code" },
    });

  const threadedComments = buildThreadedComments(comments);

  res.status(200).json({
    success: true,
    data: { comments, threadedComments },
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const isOwner = String(comment.userId) === String(req.userId);
  const isSuperAdmin = req.userRole === "admin";
  let isCollegeAdminForOwnEvent = false;

  if (req.userRole === "college_admin") {
    const event = await Event.findById(comment.eventId).select("createdBy");
    isCollegeAdminForOwnEvent = event && String(event.createdBy) === String(req.userId);
  }

  if (!isOwner && !isCollegeAdminForOwnEvent && !isSuperAdmin) {
    return next(new AppError("Not authorized to delete this comment", 403));
  }

  await Comment.deleteMany({ $or: [{ _id: id }, { parentCommentId: id }] });

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});

export const toggleCommentLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const userId = String(req.userId);
  const existingIndex = (comment.likedBy || []).findIndex((likedUserId) => String(likedUserId) === userId);

  if (existingIndex >= 0) {
    comment.likedBy.splice(existingIndex, 1);
  } else {
    comment.likedBy.push(req.userId);
  }

  comment.likesCount = comment.likedBy.length;
  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      commentId: comment._id,
      likesCount: comment.likesCount,
      liked: existingIndex < 0,
    },
  });
});

export const togglePinComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const event = await Event.findById(comment.eventId).select("_id createdBy");
  if (!canManageCommentForEvent(event, req)) {
    return next(new AppError("Not authorized to pin comments for this event", 403));
  }

  comment.isPinned = !comment.isPinned;
  comment.pinnedBy = comment.isPinned ? req.userId : null;
  comment.pinnedAt = comment.isPinned ? new Date() : null;
  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      commentId: comment._id,
      isPinned: comment.isPinned,
    },
  });
});

export const postOfficialReply = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !String(message).trim()) {
    return next(new AppError("Reply message is required", 400));
  }

  const parent = await Comment.findById(id).select("_id eventId");
  if (!parent) {
    return next(new AppError("Parent comment not found", 404));
  }

  const event = await Event.findById(parent.eventId).select("_id createdBy");
  if (!canManageCommentForEvent(event, req)) {
    return next(new AppError("Not authorized to post official replies", 403));
  }

  const reply = await Comment.create({
    eventId: parent.eventId,
    parentCommentId: parent._id,
    userId: req.userId,
    message: String(message).trim(),
    isOfficialReply: true,
    officialResponder: req.userId,
  });

  await reply.populate("userId", "firstName lastName college");

  res.status(201).json({
    success: true,
    message: "Official reply posted",
    data: { comment: reply },
  });
});

export const getModerationComments = catchAsync(async (req, res, next) => {
  if (req.userRole !== "admin") {
    return next(new AppError("Only superadmin can access moderation comments", 403));
  }

  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

  const comments = await Comment.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "firstName lastName email")
    .populate("eventId", "title college")
    .populate({ path: "eventId", populate: { path: "college", select: "name code" } });

  res.status(200).json({
    success: true,
    data: {
      comments,
    },
  });
});
