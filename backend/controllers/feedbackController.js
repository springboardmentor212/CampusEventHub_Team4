import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Feedback } from "../models/Feedback.js";
import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";

export const submitFeedback = catchAsync(async (req, res, next) => {
  const { eventId, rating, comment } = req.body;

  if (!eventId || !rating || !comment) {
    return next(new AppError("eventId, rating and comment are required", 400));
  }

  const parsedRating = Number(rating);
  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return next(new AppError("rating must be between 1 and 5", 400));
  }

  const event = await Event.findById(eventId).select("_id endDate");
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  const registration = await Registration.findOne({
    event: eventId,
    user: req.userId,
    status: "attended",
  }).select("_id");

  if (!registration) {
    return next(new AppError("Feedback requires an attended registration for this event", 403));
  }

  const existing = await Feedback.findOne({ eventId, userId: req.userId });
  if (existing) {
    return next(new AppError("Feedback already submitted for this event", 400));
  }

  const feedback = await Feedback.create({
    eventId,
    userId: req.userId,
    registrationId: registration._id,
    rating: parsedRating,
    comment: String(comment).trim(),
  });

  await feedback.populate([
    { path: "eventId", select: "title college" },
    { path: "userId", select: "firstName lastName email" },
  ]);

  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    data: { feedback },
  });
});

export const getFeedbackByEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const feedback = await Feedback.find({ eventId })
    .sort({ createdAt: -1 })
    .populate("userId", "firstName lastName college")
    .populate("eventId", "title college");

  const averageRating = feedback.length
    ? feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length
    : 0;

  res.status(200).json({
    success: true,
    data: {
      averageRating,
      totalFeedback: feedback.length,
      feedback,
    },
  });
});

export const getMyFeedback = catchAsync(async (req, res) => {
  const feedback = await Feedback.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .populate("eventId", "title startDate endDate college")
    .populate({ path: "eventId", populate: { path: "college", select: "name code" } });

  res.status(200).json({
    success: true,
    data: {
      feedback,
    },
  });
});

export const getSuperAdminFeedbackAnalytics = catchAsync(async (req, res) => {
  const analytics = await Feedback.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $group: {
        _id: "$event.college",
        avgRating: { $avg: "$rating" },
        feedbackCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "colleges",
        localField: "_id",
        foreignField: "_id",
        as: "college",
      },
    },
    { $unwind: "$college" },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "college",
        as: "events",
      },
    },
    {
      $lookup: {
        from: "registrations",
        localField: "_id",
        foreignField: "college",
        as: "registrations",
      },
    },
    {
      $project: {
        collegeId: "$college._id",
        collegeName: "$college.name",
        eventsCount: {
          $size: {
            $filter: {
              input: "$events",
              as: "event",
              cond: { $eq: ["$$event.isActive", true] },
            },
          },
        },
        registrationsCount: { $size: "$registrations" },
        avgRating: { $round: ["$avgRating", 2] },
        feedbackCount: 1,
      },
    },
    { $sort: { feedbackCount: -1, collegeName: 1 } },
  ]);

  const [totalEvents, totalRegistrations, totalFeedback] = await Promise.all([
    Event.countDocuments({ isActive: true }),
    Registration.countDocuments({}),
    Feedback.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalEvents,
        totalRegistrations,
        totalFeedback,
      },
      perCollege: analytics,
    },
  });
});

export const getCollegeAdminFeedback = catchAsync(async (req, res, next) => {
  if (req.userRole !== "college_admin") {
    return next(new AppError("Only college admins can access this endpoint", 403));
  }

  const feedback = await Feedback.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: "eventId",
      select: "title college",
      match: { college: req.user.college },
      populate: { path: "college", select: "name code" },
    })
    .populate("userId", "firstName lastName email");

  const filtered = feedback.filter((item) => item.eventId);

  const aggregateByEvent = filtered.reduce((acc, item) => {
    const eventKey = String(item.eventId._id);
    if (!acc[eventKey]) {
      acc[eventKey] = {
        eventId: item.eventId._id,
        eventTitle: item.eventId.title,
        count: 0,
        totalRating: 0,
      };
    }
    acc[eventKey].count += 1;
    acc[eventKey].totalRating += item.rating;
    return acc;
  }, {});

  const eventSummaries = Object.values(aggregateByEvent).map((item) => ({
    eventId: item.eventId,
    eventTitle: item.eventTitle,
    count: item.count,
    avgRating: Number((item.totalRating / item.count).toFixed(2)),
  }));

  res.status(200).json({
    success: true,
    data: {
      feedback: filtered,
      eventSummaries,
    },
  });
});
