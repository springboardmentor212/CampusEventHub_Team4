import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { logAdminAction } from "../utils/logger.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import { notifyUser } from "../utils/notificationService.js";

// MILESTONE 3 FEATURE START
// Register for event via registration module endpoint.
export const registerForEvent = catchAsync(async (req, res, next) => {
  const { event_id, notes, customRequirements } = req.body;

  if (!event_id) {
    return next(new AppError("event_id is required", 400));
  }

  if (req.userRole !== "student") {
    return next(new AppError("Only students can register for events", 403));
  }

  const event = await Event.findById(event_id).select(
    "_id title college status isActive registrationDeadline maxParticipants"
  );

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  if (!event.isActive || event.status === "cancelled") {
    return next(new AppError("Registration is not available for this event", 400));
  }

  if (event.college.toString() !== req.user.college.toString()) {
    return next(new AppError("This event is not available for your college", 403));
  }

  const now = new Date();
  if (event.registrationDeadline && now > event.registrationDeadline) {
    return next(new AppError("Registration deadline has passed", 400));
  }

  const capacityFilter =
    event.maxParticipants !== null && event.maxParticipants !== undefined
      ? { currentParticipants: { $lt: event.maxParticipants } }
      : {};

  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: event._id,
      isActive: true,
      status: { $ne: "cancelled" },
      ...(event.registrationDeadline ? { registrationDeadline: { $gte: now } } : {}),
      ...capacityFilter,
    },
    { $inc: { currentParticipants: 1 } },
    { new: true }
  );

  if (!updatedEvent) {
    return next(new AppError("Event reached capacity or registration is closed", 400));
  }

  let registration;
  try {
    registration = await Registration.create({
      event: updatedEvent._id,
      user: req.userId,
      college: req.user.college,
      status: "pending",
      notes: notes || null,
      customRequirements: customRequirements || {},
    });
  } catch (err) {
    await Event.findByIdAndUpdate(updatedEvent._id, { $inc: { currentParticipants: -1 } });
    if (err.code === 11000) {
      return next(new AppError("You have already registered for this event", 400));
    }
    throw err;
  }

  await User.findByIdAndUpdate(req.userId, { $addToSet: { registeredEvents: updatedEvent._id } });

  await registration.populate([
    {
      path: "event",
      select: "title description category startDate endDate location",
    },
    {
      path: "user",
      select: "username email firstName lastName",
    },
  ]);

  res.status(201).json({
    success: true,
    message: "Registration submitted successfully",
    data: { registration },
  });
});
// MILESTONE 3 FEATURE END

// Get registrations for an event (College Admin who owns it OR SuperAdmin)
export const getEventRegistrations = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError("Event not found", 404));

  // Permission check
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied. You can only view registrations for your own events.", 403));
  }

  const registrations = await Registration.find({ event: eventId })
    .populate("user", "firstName lastName email college username")
    .populate("college", "name code")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: registrations.length,
    data: { registrations },
  });
});

// Get my registrations (Student)
export const getMyRegistrations = catchAsync(async (req, res, next) => {
  const registrations = await Registration.find({ user: req.userId })
    .populate({
      path: "event",
      select: "title category startDate endDate location status college bannerImage",
      populate: { path: "college", select: "name code" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: registrations.length,
    data: { registrations },
  });
});

// Approve a single registration (College Admin or SuperAdmin)
export const approveRegistration = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const registration = await Registration.findById(id)
    .populate("user", "firstName lastName email")
    .populate("event", "title createdBy");

  if (!registration) return next(new AppError("Registration not found", 404));

  // Permission check
  const event = await Event.findById(registration.event._id);
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  registration.status = "approved";
  registration.approvalDate = new Date();
  registration.approvedBy = req.userId;
  await registration.save();

  // Log action
  await logAdminAction({
    action: "REGISTRATION_APPROVE",
    performedBy: req.userId,
    targetId: registration._id,
    targetType: "Registration",
    details: { eventTitle: registration.event.title, student: registration.user.email },
    ipAddress: req.ip,
  });

  // Notify student via in-app + branded email
  await notifyUser({
    recipientId: registration.user._id,
    type: "REGISTRATION_STATUS",
    title: "Registration Approved! 🎉",
    message: `Your registration for "${registration.event.title}" has been approved. See you there!`,
    link: "/student",
  });
  try {
    const approvedEvent = await Event.findById(registration.event._id).select("startDate");
    const tpl = EmailTemplates.registrationApproved(
      registration.user.firstName,
      registration.event.title,
      approvedEvent?.startDate
    );
    await sendEmail({ email: registration.user.email, ...tpl });
  } catch (e) {
    console.error("Approval email failed:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Registration approved",
    data: { registration },
  });
});

// Reject a registration (College Admin or SuperAdmin)
export const rejectRegistration = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const registration = await Registration.findById(id)
    .populate("user", "firstName lastName email")
    .populate("event", "title createdBy");

  if (!registration) return next(new AppError("Registration not found", 404));

  const event = await Event.findById(registration.event._id);
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  registration.status = "rejected";
  registration.rejectionReason = reason || "No reason provided.";
  registration.rejectedAt = new Date();
  registration.rejectedBy = req.userId;
  await registration.save();

  // Decrement participant count
  await Event.findByIdAndUpdate(registration.event._id, { $inc: { currentParticipants: -1 } });

  // Log
  await logAdminAction({
    action: "REGISTRATION_REJECT",
    performedBy: req.userId,
    targetId: registration._id,
    targetType: "Registration",
    details: { eventTitle: registration.event.title, reason },
    ipAddress: req.ip,
  });

  // Notify student via in-app + branded email
  await notifyUser({
    recipientId: registration.user._id,
    type: "REGISTRATION_STATUS",
    title: "Registration Update",
    message: `Your registration for "${registration.event.title}" was not approved.`,
    link: "/student",
  });
  try {
    const tpl = EmailTemplates.registrationRejected(
      registration.user.firstName,
      registration.event.title,
      reason
    );
    await sendEmail({ email: registration.user.email, ...tpl });
  } catch (e) {
    console.error("Rejection email failed:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Registration rejected",
    data: { registration },
  });
});

// Mark Attendance (College Admin or SuperAdmin)
export const markAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'attended' or 'no-show' or 'approved' (to undo)

  if (!["attended", "no-show", "approved"].includes(status)) {
    return next(new AppError("Invalid attendance status.", 400));
  }

  const registration = await Registration.findById(id).populate("event", "createdBy title");
  if (!registration) return next(new AppError("Registration not found", 404));

  // Permission check
  if (req.userRole !== "admin" && registration.event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  registration.status = status;
  await registration.save();

  res.status(200).json({
    success: true,
    message: `Attendance marked as ${status}`,
    data: { registration },
  });
});

// Export Registrations to CSV (College Admin or SuperAdmin)
export const exportRegistrations = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError("Event not found", 404));

  // Permission check
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  const registrations = await Registration.find({ event: eventId, status: { $ne: "rejected" } })
    .populate("user", "firstName lastName email phone officialId college")
    .populate("college", "name");

  // Generate CSV string
  let csv = "First Name,Last Name,Email,Phone,ID,College,Status,Registration Date\n";
  registrations.forEach((reg) => {
    csv += `"${reg.user.firstName}","${reg.user.lastName}","${reg.user.email}","${reg.user.phone || ""}","${reg.user.officialId || ""}","${reg.college?.name || reg.user.college?.name || ""}","${reg.status}","${reg.registrationDate.toISOString()}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=registrations-${event.title.replace(/\s+/g, "_")}.csv`);
  res.status(200).send(csv);
});

// Cancel own registration (Student only — pending anytime, approved only if event not started)
export const cancelRegistration = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const registration = await Registration.findById(id).populate("event", "title currentParticipants startDate");
  if (!registration) return next(new AppError("Registration not found", 404));

  if (registration.user.toString() !== req.userId.toString()) {
    return next(new AppError("You can only cancel your own registrations.", 403));
  }

  // Prevent cancellation of rejected/attended registrations
  if (["rejected", "attended", "no-show"].includes(registration.status)) {
    return next(new AppError("This registration cannot be cancelled.", 400));
  }

  // For approved registrations, only allow if event hasn't started
  if (registration.status === "approved" && new Date() >= new Date(registration.event.startDate)) {
    return next(new AppError("Cannot cancel - this event has already started.", 400));
  }

  await Registration.findByIdAndDelete(id);

  // Decrement participant count
  await Event.findByIdAndUpdate(registration.event._id, { $inc: { currentParticipants: -1 } });

  // Remove from user's registered events
  await User.findByIdAndUpdate(req.userId, { $pull: { registeredEvents: registration.event._id } });

  res.status(200).json({
    success: true,
    message: "Registration cancelled successfully.",
  });
});

// MILESTONE 3 FEATURE START
// Registration analytics for event owner/admin.
export const getRegistrationStats = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied. You can only view stats for your own events.", 403));
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

// Super admin listing for all registrations.
export const getAllRegistrations = catchAsync(async (req, res, next) => {
  const { status, event_id, user_id, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (event_id) filter.event = event_id;
  if (user_id) filter.user = user_id;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const registrations = await Registration.find(filter)
    .populate([
      {
        path: "event",
        select: "title description category startDate endDate location",
        populate: {
          path: "college",
          select: "name code",
        },
      },
      {
        path: "user",
        select: "username email firstName lastName",
      },
      {
        path: "approvedBy",
        select: "username email",
      },
      {
        path: "rejectedBy",
        select: "username email",
      },
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Registration.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      registrations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRegistrations: total,
      },
    },
  });
});

// Single registration details with ownership/role checks.
export const getRegistrationById = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;

  const registration = await Registration.findById(registrationId).populate([
    {
      path: "event",
      select: "title description category startDate endDate location",
      populate: {
        path: "college",
        select: "name code",
      },
    },
    {
      path: "user",
      select: "username email firstName lastName",
    },
    {
      path: "approvedBy",
      select: "username email",
    },
    {
      path: "rejectedBy",
      select: "username email",
    },
  ]);

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  const canViewAsOwner = registration.user?._id?.toString() === req.userId.toString();

  if (!canViewAsOwner && req.userRole !== "admin") {
    const event = await Event.findById(registration.event?._id).select("createdBy");
    if (!event || event.createdBy.toString() !== req.userId.toString()) {
      return next(new AppError("Not authorized to view this registration", 403));
    }
  }

  res.status(200).json({
    success: true,
    data: { registration },
  });
});
// MILESTONE 3 FEATURE END
