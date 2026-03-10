import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// @desc    Register for an event
// @route   POST /api/registrations/register
// @access  Private (students only)
export const registerForEvent = catchAsync(async (req, res, next) => {
  const { event_id, notes } = req.body;
  const user_id = req.user._id;

  // Check if user is a student
  if (req.user.role !== "student") {
    return next(new AppError("Only students can register for events", 403));
  }

  // Check if event exists
  const event = await Event.findById(event_id);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if user is from the same college or event is open to all
  if (event.college.toString() !== req.user.college.toString() && !event.is_open_to_all) {
    return next(new AppError("This event is not available for your college", 403));
  }

  // Check if already registered
  const existingRegistration = await Registration.findOne({
    event_id,
    user_id,
  });

  if (existingRegistration) {
    return next(new AppError("You have already registered for this event", 400));
  }

  // Check registration period
  const now = new Date();
  if (now < event.registration_start_date || now > event.registration_end_date) {
    return next(new AppError("Registration period is not active", 400));
  }

  // Check capacity
  if (event.max_participants > 0) {
    const approvedCount = await Registration.countDocuments({
      event_id,
      status: "approved",
    });

    if (approvedCount >= event.max_participants) {
      return next(new AppError("Event has reached maximum capacity", 400));
    }
  }

  // Create registration
  const registration = await Registration.create({
    event_id,
    user_id,
    notes,
  });

  // Populate registration details
  await registration.populate([
    { path: "event_id", select: "title description category start_date end_date location" },
    { path: "user_id", select: "username email" },
  ]);

  res.status(201).json({
    success: true,
    message: "Registration submitted successfully",
    data: {
      registration,
    },
  });
});

// @desc    Get user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
export const getMyRegistrations = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const user_id = req.user._id;

  // Build filter
  const filter = { user_id };
  if (status) {
    filter.status = status;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const registrations = await Registration.find(filter)
    .populate({
      path: "event_id",
      select: "title description category start_date end_date location college",
      populate: {
        path: "college",
        select: "name code",
      },
    })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Registration.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
      },
    },
  });
});

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
export const cancelRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const user_id = req.user._id;

  const registration = await Registration.findById(registrationId);

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  // Check ownership or admin rights
  if (registration.user_id.toString() !== user_id.toString() && req.user.role !== "admin") {
    return next(new AppError("Not authorized to cancel this registration", 403));
  }

  // Check if registration can be cancelled
  if (!registration.isModifiable()) {
    return next(new AppError("Cannot cancel approved or rejected registration", 400));
  }

  await Registration.findByIdAndDelete(registrationId);

  res.status(200).json({
    success: true,
    message: "Registration cancelled successfully",
  });
});

// @desc    Get registrations for an event (public view)
// @route   GET /api/registrations/event/:eventId
// @access  Public
export const getEventRegistrations = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Build filter
  const filter = { event_id: eventId };
  if (status) {
    filter.status = status;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const registrations = await Registration.find(filter)
    .populate({
      path: "user_id",
      select: "username email fullName",
    })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Registration.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
      },
    },
  });
});

// @desc    Get registration statistics for an event
// @route   GET /api/registrations/stats/:eventId
// @access  Private (event admin or college admin)
export const getRegistrationStats = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const user_id = req.user._id;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check authorization
  if (req.user.role === "college_admin" && event.college.toString() !== req.user.college.toString()) {
    return next(new AppError("Not authorized to view stats for this event", 403));
  }

  const stats = await Registration.getStats(eventId);

  res.status(200).json({
    success: true,
    data: {
      eventId,
      stats,
    },
  });
});

// @desc    Get all registrations (admin only)
// @route   GET /api/registrations
// @access  Private (admin only)
export const getAllRegistrations = catchAsync(async (req, res, next) => {
  const { status, event_id, user_id, page = 1, limit = 20 } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (event_id) filter.event_id = event_id;
  if (user_id) filter.user_id = user_id;

  // Pagination
  const skip = (page - 1) * limit;

  const registrations = await Registration.find(filter)
    .populate([
      {
        path: "event_id",
        select: "title description category start_date end_date location",
        populate: {
          path: "college",
          select: "name code",
        },
      },
      {
        path: "user_id",
        select: "username email fullName",
      },
      {
        path: "approved_by",
        select: "username email",
      },
      {
        path: "rejected_by",
        select: "username email",
      },
    ])
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Registration.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
      },
    },
  });
});

// @desc    Approve registration
// @route   PATCH /api/registrations/:id/approve
// @access  Private (college admin or admin only)
export const approveRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const adminId = req.user._id;

  const registration = await Registration.findById(registrationId)
    .populate("event_id")
    .populate("user_id");

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  // Check authorization
  if (req.user.role === "college_admin" && 
      registration.event_id.college.toString() !== req.user.college.toString()) {
    return next(new AppError("Not authorized to approve this registration", 403));
  }

  // Check if registration can be approved
  if (!registration.isModifiable()) {
    return next(new AppError("Registration cannot be approved", 400));
  }

  // Check capacity
  const event = registration.event_id;
  if (event.max_participants > 0) {
    const approvedCount = await Registration.countDocuments({
      event_id: registration.event_id._id,
      status: "approved",
    });

    if (approvedCount >= event.max_participants) {
      return next(new AppError("Event has reached maximum capacity", 400));
    }
  }

  await registration.approve(adminId);

  res.status(200).json({
    success: true,
    message: "Registration approved successfully",
    data: {
      registration,
    },
  });
});

// @desc    Reject registration
// @route   PATCH /api/registrations/:id/reject
// @access  Private (college admin or admin only)
export const rejectRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const { rejection_reason } = req.body;
  const adminId = req.user._id;

  const registration = await Registration.findById(registrationId)
    .populate("event_id")
    .populate("user_id");

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  // Check authorization
  if (req.user.role === "college_admin" && 
      registration.event_id.college.toString() !== req.user.college.toString()) {
    return next(new AppError("Not authorized to reject this registration", 403));
  }

  // Check if registration can be rejected
  if (!registration.isModifiable()) {
    return next(new AppError("Registration cannot be rejected", 400));
  }

  await registration.reject(adminId, rejection_reason);

  res.status(200).json({
    success: true,
    message: "Registration rejected successfully",
    data: {
      registration,
    },
  });
});

// @desc    Get registration by ID
// @route   GET /api/registrations/:id
// @access  Private
export const getRegistrationById = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const user_id = req.user._id;

  const registration = await Registration.findById(registrationId)
    .populate([
      {
        path: "event_id",
        select: "title description category start_date end_date location",
        populate: {
          path: "college",
          select: "name code",
        },
      },
      {
        path: "user_id",
        select: "username email fullName",
      },
      {
        path: "approved_by",
        select: "username email",
      },
      {
        path: "rejected_by",
        select: "username email",
      },
    ]);

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  // Check authorization
  if (registration.user_id._id.toString() !== user_id.toString() && 
      req.user.role !== "admin" &&
      (req.user.role !== "college_admin" || 
       registration.event_id.college.toString() !== req.user.college.toString())) {
    return next(new AppError("Not authorized to view this registration", 403));
  }

  res.status(200).json({
    success: true,
    data: {
      registration,
    },
  });
});
