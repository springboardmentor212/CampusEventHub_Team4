import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { Feedback } from "../models/Feedback.js";
import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";

const ISSUE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "was", "were", "are", "from", "have", "has",
  "had", "too", "very", "but", "not", "you", "your", "our", "just", "about", "into", "than",
  "they", "them", "their", "would", "could", "should", "there", "here", "when", "where", "what",
  "which", "while", "event", "events", "good", "great", "nice", "awesome", "excellent", "okay",
]);

const buildRatingDistribution = (feedbackRows) => {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  feedbackRows.forEach((item) => {
    const score = Number(item.rating);
    if (distribution[score] !== undefined) {
      distribution[score] += 1;
    }
  });

  return distribution;
};

const extractTopIssues = (feedbackRows, topN = 8) => {
  const counts = new Map();

  feedbackRows.forEach((item) => {
    const comment = String(item.comment || "").toLowerCase();
    const words = comment
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 4 && !ISSUE_STOP_WORDS.has(word));

    const uniqueWords = new Set(words);
    uniqueWords.forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([term, count]) => ({ term, count }));
};

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

  // Feedback is allowed only after event completion and within 30 days of event end.
  if (event.endDate) {
    const now = new Date();
    const eventEndDate = new Date(event.endDate);
    if (now < eventEndDate) {
      return next(new AppError("Feedback can only be submitted after the event ends", 400));
    }

    const feedbackWindowEnd = new Date(eventEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (now > feedbackWindowEnd) {
      return next(new AppError("Feedback submission window has closed (30 days after event end)", 400));
    }
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

  const [
    totalEvents,
    totalRegistrations,
    totalFeedback,
    totalAttended,
    platformAverage,
    lowestRatedEvents,
  ] = await Promise.all([
    Event.countDocuments({ isActive: true }),
    Registration.countDocuments({}),
    Feedback.countDocuments({}),
    Registration.countDocuments({ status: "attended" }),
    Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]),
    Feedback.aggregate([
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
          _id: "$eventId",
          eventTitle: { $first: "$event.title" },
          collegeId: { $first: "$event.college" },
          avgRating: { $avg: "$rating" },
          feedbackCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "college",
        },
      },
      {
        $unwind: {
          path: "$college",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          eventId: "$_id",
          eventTitle: 1,
          avgRating: { $round: ["$avgRating", 2] },
          feedbackCount: 1,
          collegeName: { $ifNull: ["$college.name", "Unknown College"] },
        },
      },
      { $sort: { avgRating: 1, feedbackCount: -1, eventTitle: 1 } },
      { $limit: 5 },
    ]),
  ]);

  const platformAverageRating = platformAverage.length
    ? Number(platformAverage[0].avgRating.toFixed(2))
    : 0;
  const responseRate = totalAttended > 0
    ? Number(((totalFeedback / totalAttended) * 100).toFixed(2))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalEvents,
        totalRegistrations,
        totalFeedback,
        totalAttended,
        platformAverageRating,
        responseRate,
      },
      perCollege: analytics,
      lowestRatedEvents,
    },
  });
});

export const getCollegeAdminFeedback = catchAsync(async (req, res, next) => {
  if (req.userRole !== "college_admin") {
    return next(new AppError("Only college admins can access this endpoint", 403));
  }

  const collegeEventIds = await Event.find({
    college: req.user.college,
    isActive: true,
  }).distinct("_id");

  if (!collegeEventIds.length) {
    return res.status(200).json({
      success: true,
      data: {
        feedback: [],
        eventSummaries: [],
        analytics: {
          responseRate: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          topIssues: [],
        },
      },
    });
  }

  const feedback = await Feedback.find({ eventId: { $in: collegeEventIds } })
    .sort({ createdAt: -1 })
    .populate({
      path: "eventId",
      select: "title college",
      populate: { path: "college", select: "name code" },
    })
    .populate("userId", "firstName lastName email");

  const attendedCounts = await Registration.aggregate([
    {
      $match: {
        event: { $in: collegeEventIds },
        status: "attended",
      },
    },
    {
      $group: {
        _id: "$event",
        attendedCount: { $sum: 1 },
      },
    },
  ]);

  const attendedMap = attendedCounts.reduce((acc, row) => {
    acc[String(row._id)] = row.attendedCount;
    return acc;
  }, {});

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
    attendedCount: attendedMap[String(item.eventId)] || 0,
    responseRate: (() => {
      const attended = attendedMap[String(item.eventId)] || 0;
      return attended > 0 ? Number(((item.count / attended) * 100).toFixed(2)) : 0;
    })(),
  }));

  const totalAttended = attendedCounts.reduce((sum, row) => sum + Number(row.attendedCount || 0), 0);
  const responseRate = totalAttended > 0
    ? Number(((filtered.length / totalAttended) * 100).toFixed(2))
    : 0;
  const ratingDistribution = buildRatingDistribution(filtered);
  const topIssues = extractTopIssues(filtered);

  res.status(200).json({
    success: true,
    data: {
      feedback: filtered,
      eventSummaries,
      analytics: {
        responseRate,
        ratingDistribution,
        topIssues,
      },
    },
  });
});
