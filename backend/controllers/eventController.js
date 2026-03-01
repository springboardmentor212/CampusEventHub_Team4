import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Create a new event (College Admin only)
export const createEvent = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    category,
    location,
    startDate,
    endDate,
    maxParticipants,
    registrationDeadline,
    requirements,
    imageUrl,
  } = req.body;

  // Check if user is college admin - REMOVED: Managed by middleware

  // Get user's college
  const user = req.user;

  // Create event
  const event = await Event.create({
    ...req.body,
    college: user.college,
    createdBy: req.userId,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
  });

  // Populate event details for response
  await event.populate([
    { path: "college", select: "name code" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: {
      event,
    },
  });
});

// Register for an event (Student only Authority)
export const registerForEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if event is full
  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    return next(new AppError("Event is at maximum capacity", 400));
  }

  // Check if already registered
  const user = await User.findById(req.userId);
  if (user.registeredEvents.includes(id)) {
    return next(new AppError("You are already registered for this event", 400));
  }

  // Register
  user.registeredEvents.push(id);
  event.participants.push(req.userId);
  event.currentParticipants += 1;

  await user.save();
  await event.save();

  res.status(200).json({
    success: true,
    message: "Successfully registered for event",
    data: {
      event,
    },
  });
});

// Get all events with filtering options
export const getEvents = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    college,
    startDate,
    endDate,
    status = "upcoming",
    search,
  } = req.query;

  // Build filter object
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (college) {
    filter.college = college;
  }

  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) {
      filter.startDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.startDate.$lte = new Date(endDate);
    }
  }

  // Search filter (title and description)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get events
  const events = await Event.find(filter)
    .populate("college", "name code")
    .populate("createdBy", "firstName lastName")
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Event.countDocuments(filter);

  res.status(200).json({
    success: true,
    results: events.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: {
      events,
    },
  });
});

// Get single event by ID
export const getEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("college", "name code email website")
    .populate("createdBy", "firstName lastName email");

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      event,
    },
  });
});

// Update event (College Admin who created it or System Admin)
export const updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check permissions (Middleware manages role, we check ownership)
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("You can only manage your own events.", 403));
  }

  // Update event
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate([
    { path: "college", select: "name code" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: {
      event: updatedEvent,
    },
  });
});

// Delete event (College Admin who created it or System Admin)
export const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check permissions
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("You can only delete your own events.", 403));
  }

  // Soft delete by setting isActive to false
  await Event.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

// Get events created by the current user (College Admin)
export const getMyEvents = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
  } = req.query;

  // Build filter object
  const filter = {
    createdBy: req.userId,
    isActive: true
  };

  if (status) {
    filter.status = status;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get events
  const events = await Event.find(filter)
    .populate("college", "name code")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const total = await Event.countDocuments(filter);

  res.status(200).json({
    success: true,
    results: events.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: {
      events,
    },
  });
});
