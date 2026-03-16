import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { logAdminAction } from "../utils/logger.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import { notifyUser } from "../utils/notificationService.js";

const resequenceWaitlist = async (eventId) => {
  const waitlisted = await Registration.find({ event: eventId, status: "waitlisted" })
    .sort({ waitlistPosition: 1, createdAt: 1 });

  await Promise.all(waitlisted.map((registration, index) => {
    registration.waitlistPosition = index + 1;
    return registration.save();
  }));
};

export const promoteNextWaitlistedRegistration = async (eventId) => {
  const nextRegistration = await Registration.findOne({ event: eventId, status: "waitlisted" })
    .sort({ createdAt: 1 })
    .populate("user", "firstName email")
    .populate("event", "title");

  if (!nextRegistration) {
    return null;
  }

  // Auto-promote to confirmed registration when a seat opens.
  nextRegistration.status = "approved";
  nextRegistration.waitlistPosition = null;
  nextRegistration.confirmationDeadline = null;
  nextRegistration.approvalDate = new Date();
  await nextRegistration.save();

  await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });
  await resequenceWaitlist(eventId);

  await notifyUser({
    recipientId: nextRegistration.user._id,
    type: "REGISTRATION_STATUS",
    title: "You Are Now Confirmed",
    message: `A seat opened up for "${nextRegistration.event.title}" and you were automatically moved from waitlist to confirmed.`,
    link: `/event/${eventId}`,
  });

  try {
    await sendEmail({
      email: nextRegistration.user.email,
      subject: `You are confirmed for ${nextRegistration.event.title}`,
      message: `Hi ${nextRegistration.user.firstName},\n\nA spot opened for "${nextRegistration.event.title}" and your registration has been automatically confirmed.`,
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif; background: #f5f5f5; padding: 16px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #d1d5db;">
          <div style="padding: 16px 18px; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; color: #111827; font-weight: 600;">CampusEventHub</p>
          </div>
          <div style="padding: 18px; color: #374151; font-size: 14px; line-height: 1.5;">
            <p style="margin: 0 0 10px;">Hi <strong>${nextRegistration.user.firstName}</strong>,</p>
            <p style="margin: 0 0 10px;">A seat opened up and your registration for <strong>${nextRegistration.event.title}</strong> is now confirmed.</p>
            <p style="margin: 0 0 14px;">Check event details in your dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/event/${eventId}" style="display: inline-block; padding: 8px 14px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; border: 1px solid #111827; font-size: 13px; font-weight: 600;">View event</a>
          </div>
        </div>
      </div>`
    });
  } catch (err) {
    console.error("Waitlist promotion email failed:", err.message);
  }

  return nextRegistration;
};

const decrementParticipantsSafe = async (eventId, amount = 1) => {
  const event = await Event.findById(eventId);
  if (!event) return;
  event.currentParticipants = Math.max(0, (event.currentParticipants || 0) - amount);
  await event.save();
};

// MILESTONE 3 FEATURE START
// Register for event via registration module endpoint.
export const registerForEvent = catchAsync(async (req, res, next) => {
  const eventId = req.params.eventId || req.body.event_id;
  const { notes, customRequirements, customResponses } = req.body || {};

  if (!eventId) {
    return next(new AppError("eventId is required", 400));
  }

  if (req.userRole !== "student") {
    return next(new AppError("Only students can register for events", 403));
  }

  const event = await Event.findById(eventId).select(
    "_id title college audience status isActive registrationDeadline maxParticipants currentParticipants startDate"
  );

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  if (!event.isActive || event.status === "cancelled") {
    return next(new AppError("Registration is not available for this event", 400));
  }

  if (event.maxParticipants === 0) {
    return next(new AppError("Registration is disabled for this event", 400));
  }

  const now = new Date();
  if (event.registrationDeadline && now > event.registrationDeadline) {
    return next(new AppError("Registration deadline has passed", 400));
  }

  if (event.startDate && now >= new Date(event.startDate)) {
    return next(new AppError("This event has already started", 400));
  }

  const existingRegistration = await Registration.findOne({
    event: eventId,
    user: req.userId,
    status: { $in: ["approved", "waitlisted", "attended", "no_show"] },
  });
  if (existingRegistration) {
    return next(new AppError("You already have an active registration for this event", 400));
  }

  const customPayload = customResponses || customRequirements || {};

  if (event.maxParticipants !== null && event.maxParticipants !== undefined && event.currentParticipants >= event.maxParticipants) {
    const waitlistPosition = await Registration.countDocuments({ event: eventId, status: "waitlisted" }) + 1;
    const registration = await Registration.create({
      event: event._id,
      user: req.userId,
      college: req.user.college,
      status: "waitlisted",
      waitlistPosition,
      notes: notes || null,
      customRequirements: customPayload,
    });

    await registration.populate([
      { path: "event", select: "title description category startDate endDate location customCategory" },
      { path: "user", select: "username email firstName lastName" },
    ]);

    await notifyUser({
      recipientId: req.userId,
      type: "REGISTRATION_STATUS",
      title: "Added to Waitlist",
      message: `"${event.title}" is full. You have been added to the waitlist at position ${waitlistPosition}.`,
      link: "/student/dashboard",
    });

    try {
      const tpl = EmailTemplates.waitlistAdded(req.user.firstName, event.title, waitlistPosition);
      await sendEmail({ email: req.user.email, ...tpl });
    } catch (err) {
      console.error("Waitlist email failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: `Event is full. You have been added to the waitlist at position ${waitlistPosition}.`,
      data: { registration, waitlistPosition },
    });
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
      status: "approved",
      approvalDate: new Date(),
      notes: notes || null,
      customRequirements: customPayload,
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
      select: "title description category customCategory startDate endDate location",
    },
    {
      path: "user",
      select: "username email firstName lastName",
    },
  ]);

  // Notify student via in-app + branded email
  await notifyUser({
    recipientId: req.userId,
    type: "REGISTRATION_STATUS",
    title: registration.status === "waitlisted" ? "Added to Waitlist" : "Registration Confirmed",
    message: registration.status === "waitlisted"
      ? `The event "${registration.event.title}" is full. You've been added to the waitlist.`
      : `You're confirmed for "${registration.event.title}".`,
    link: "/student/dashboard",
  });

  try {
    let tpl;
    if (registration.status === "waitlisted") {
      const position = await Registration.countDocuments({ event: registration.event._id, status: "waitlisted", createdAt: { $lte: registration.createdAt } });
      tpl = EmailTemplates.waitlistAdded(registration.user.firstName, registration.event.title, position);
    } else {
      tpl = EmailTemplates.registrationApproved(
        registration.user.firstName,
        registration.event.title,
        registration.event.startDate
      );
    }
    await sendEmail({ email: registration.user.email, ...tpl });
  } catch (e) {
    console.error("Registration receipt email failed:", e.message);
  }

  res.status(201).json({
    success: true,
    message: registration.status === "waitlisted"
      ? `Event is full. You have been added to the waitlist.`
      : "Registration confirmed successfully",
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

  if (registration.status !== "pending") {
    return next(new AppError("Only legacy pending registrations can be approved.", 400));
  }

  if (event.endDate && new Date() > new Date(event.endDate)) {
    return next(new AppError("Cannot approve registrations after the event has ended.", 400));
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
    title: "Registration Approved",
    message: `Your registration for "${registration.event.title}" has been approved. See you there!`,
    link: "/student/dashboard",
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

  if (registration.status !== "pending") {
    return next(new AppError("Only legacy pending registrations can be rejected. Students manage their own registrations now.", 400));
  }

  const previousStatus = registration.status;
  registration.status = "rejected";
  registration.rejectionReason = reason || "No reason provided.";
  registration.rejectedAt = new Date();
  registration.rejectedBy = req.userId;
  await registration.save();

  // Decrement participant count
  if (previousStatus !== "waitlisted") {
    await decrementParticipantsSafe(registration.event._id, 1);
    await promoteNextWaitlistedRegistration(registration.event._id);
  } else {
    await resequenceWaitlist(registration.event._id);
  }

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
    link: "/student/dashboard",
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
  const { status } = req.body; // 'attended' or 'no_show' or 'approved' (to undo)

  if (!["attended", "no_show", "approved"].includes(status)) {
    return next(new AppError("Invalid attendance status.", 400));
  }

  const registration = await Registration.findById(id).populate("event", "createdBy title");
  if (!registration) return next(new AppError("Registration not found", 404));

  // Permission check
  if (req.userRole !== "admin" && registration.event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  if (!["approved", "attended", "no_show"].includes(registration.status)) {
    return next(new AppError("Attendance can only be marked for approved registrations.", 400));
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
  const { format = "json" } = req.query;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError("Event not found", 404));

  // Permission check
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied.", 403));
  }

  const registrations = await Registration.find({ event: eventId, status: { $ne: "rejected" } })
    .populate("user", "firstName lastName email phone officialId college")
    .populate("college", "name");

  const rows = registrations.map((reg) => ({
    registrationId: reg._id,
    firstName: reg.user?.firstName || "",
    lastName: reg.user?.lastName || "",
    email: reg.user?.email || "",
    phone: reg.user?.phone || "",
    officialId: reg.user?.officialId || "",
    college: reg.college?.name || reg.user?.college?.name || "",
    status: reg.status,
    registrationDate: reg.registrationDate,
  }));

  if (String(format).toLowerCase() !== "csv") {
    return res.status(200).json({
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        registrations: rows,
      },
    });
  }

  // Generate CSV string
  let csv = "First Name,Last Name,Email,Phone,ID,College,Status,Registration Date\n";
  rows.forEach((row) => {
    csv += `"${row.firstName}","${row.lastName}","${row.email}","${row.phone}","${row.officialId}","${row.college}","${row.status}","${new Date(row.registrationDate).toISOString()}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=registrations-${event.title.replace(/\s+/g, "_")}.csv`);
  res.status(200).send(csv);
});

// Cancel own registration (Student only - pending anytime, approved only if event not started)
export const cancelRegistration = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Populate event if not already populated
  const registration = await Registration.findById(req.params.id)
    .populate('event');

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Block cancellation after event has started
  if (Date.now() >= new Date(registration.event.startDate).getTime()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot unregister after the event has started.'
    });
  }

  const isWaitlisted = registration.status === "waitlisted";
  const startMs = new Date(registration.event.startDate).getTime();
  const cutoffMs = startMs - (24 * 60 * 60 * 1000);

  if (!isWaitlisted && Date.now() > cutoffMs) {
    return res.status(400).json({
      success: false,
      message: 'Cancellation is allowed only until 24 hours before the event starts.'
    });
  }

  // Block cancellation if attendance already marked
  if (['attended', 'no_show'].includes(registration.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel after attendance has been marked.'
    });
  }

  const wasWaitlisted = registration.status === "waitlisted";

  await Registration.findByIdAndDelete(id);

  if (wasWaitlisted) {
    await resequenceWaitlist(registration.event._id);
  } else {
    // Decrement participant count and restore slot availability.
    await decrementParticipantsSafe(registration.event._id, 1);
    await promoteNextWaitlistedRegistration(registration.event._id);
  }

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
      select: "title description category customCategory startDate endDate location",
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
// Confirm spot from waitlist
export const confirmWaitlist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const registration = await Registration.findById(id).populate("event", "title currentParticipants maxParticipants");
  if (!registration) return next(new AppError("Registration not found", 404));

  if (registration.user.toString() !== req.userId.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  if (registration.status !== "waitlisted") {
    return next(new AppError("This registration is not on the waitlist.", 400));
  }

  return next(new AppError("Waitlist confirmations are automatic. You will be notified when promoted.", 400));
});

// GET /registrations/event/:eventId/waitlist
export const getWaitlistByEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);

  if (!event) return next(new AppError("Event not found", 404));
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Unauthorized.", 403));
  }

  const waitlist = await Registration.find({ event: eventId, status: "waitlisted" })
    .populate("user", "firstName lastName email officialId college")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    results: waitlist.length,
    data: { waitlist }
  });
});
