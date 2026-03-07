import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import { Registration } from "../models/Registration.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import { logAdminAction } from "../utils/logger.js";
import { notifyUser } from "../utils/notificationService.js";

// Create a new event (College Admin only)
export const createEvent = catchAsync(async (req, res, next) => {
  const user = req.user;
  const collegeId = (req.userRole === "admin" && req.body.college) ? req.body.college : user.college;

  // SECURITY: Whitelist allowed fields — prevent injection of isApproved, currentParticipants etc.
  const { title, description, category, location, startDate, endDate, maxParticipants,
    registrationDeadline, requirements, dosAndDonts, participationRequirements, imageUrl, bannerImage,
    isTeamEvent, minTeamSize, maxTeamSize, participationMode } = req.body;

  // Validate: Start date must be in the future
  if (new Date(startDate) <= new Date()) {
    return next(new AppError("Event start date must be in the future.", 400));
  }

  // Validate: Registration deadline must be before start date (if provided)
  if (registrationDeadline && new Date(registrationDeadline) >= new Date(startDate)) {
    return next(new AppError("Registration deadline must be before the event start date.", 400));
  }

  const event = await Event.create({
    title, description, category, location, startDate, endDate, maxParticipants,
    registrationDeadline, requirements, dosAndDonts, participationRequirements, imageUrl, bannerImage,
    isTeamEvent, minTeamSize, maxTeamSize, participationMode: participationMode || "solo",
    college: collegeId,
    createdBy: req.userId,
    isApproved: req.userRole === "admin", // SuperAdmins bypass approval
    currentParticipants: 0, // Always start at 0
  });

  // Log action
  await logAdminAction({
    action: "EVENT_CREATE",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { title: event.title },
    ipAddress: req.ip,
  });

  // If created by College Admin, notify SuperAdmins
  if (req.userRole === "college_admin") {
    // In-app notification to ALL SuperAdmins
    const superAdmins = await User.find({ role: "admin" }).select("email");
    superAdmins.forEach(async (admin) => {
      await notifyUser({
        recipientId: admin._id,
        type: "ADMIN_ANNOUNCEMENT",
        title: "New Event Pending Approval",
        message: `College Admin ${user.firstName} from ${user.college.name} has created a new event: ${event.title}`,
        link: `/admin`,
      });
    });

    // Send email using branded template
    try {
      const emailPromises = superAdmins.map(admin => {
        const tpl = EmailTemplates.newEventPending(event.title, user.college.name);
        return sendEmail({ email: admin.email, ...tpl });
      });
      Promise.allSettled(emailPromises);
    } catch (err) {
      console.error("Failed to send event pending emails:", err);
    }
  }

  await event.populate([
    { path: "college", select: "name code" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

  res.status(201).json({
    success: true,
    message: event.isApproved ? "Event created and live!" : "Event submitted for approval.",
    data: { event },
  });
});

// Approve an event (SuperAdmin only)
export const approveEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id).populate("createdBy", "firstName lastName email");

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  event.isApproved = true;
  await event.save();

  // Log action
  await logAdminAction({
    action: "EVENT_APPROVE",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { title: event.title },
    ipAddress: req.ip,
  });

  // Notify creator in-app
  await notifyUser({
    recipientId: event.createdBy._id,
    type: "REGISTRATION_STATUS",
    title: "Event Approved",
    message: `Your event "${event.title}" has been approved and is now live!`,
    link: `/manage-events`,
  });

  // Notify creator via email non-blocking
  try {
    const tpl = EmailTemplates.eventApproved(event.createdBy.firstName, event.title);
    sendEmail({ email: event.createdBy.email, ...tpl }).catch(err => console.error(err));
  } catch (err) {
    console.error("Event approval email setup failed:", err);
  }

  res.status(200).json({
    success: true,
    message: "Event approved and live",
    data: { event },
  });
});

// Reject an event (SuperAdmin only)
export const rejectEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const event = await Event.findById(id).populate("createdBy", "firstName lastName email");

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Soft delete or completely remove the unapproved event
  await Event.findByIdAndDelete(id);

  // Log action
  await logAdminAction({
    action: "EVENT_REJECT",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { title: event.title, reason },
    ipAddress: req.ip,
  });

  // Notify creator via email non-blocking
  try {
    const tpl = EmailTemplates.eventRejected(event.createdBy.firstName, event.title, reason || "Documentation requirements not met.");
    sendEmail({ email: event.createdBy.email, ...tpl }).catch(err => console.error(err));
  } catch (err) {
    console.error("Event rejection email setup failed:", err);
  }

  res.status(200).json({
    success: true,
    message: "Event rejected and removed",
  });
});

// Register for an event (Student only Authority)
export const registerForEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  if (!event.isApproved || !event.isActive) {
    return next(new AppError("This event is not open for registration", 400));
  }

  // Check capacity
  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    return next(new AppError("Event is at maximum capacity", 400));
  }

  // Check deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return next(new AppError("Registration deadline has passed", 400));
  }

  // Prevent loophole: Check if event has already started
  if (new Date() > new Date(event.startDate)) {
    return next(new AppError("Registration closed. This event has already started.", 400));
  }

  // Check if already registered
  const existingReg = await Registration.findOne({ event: id, user: req.userId });
  if (existingReg) {
    return next(new AppError("You are already registered for this event", 400));
  }

  // Create Registration within a session or using atomic updates
  // Step 1: Atomic increment of currentParticipants IF it's below max
  const updateQuery = { _id: id, isActive: true, isApproved: true };
  if (event.maxParticipants) {
    updateQuery.currentParticipants = { $lt: event.maxParticipants };
  }

  const updatedEvent = await Event.findOneAndUpdate(
    updateQuery,
    { $inc: { currentParticipants: 1 } },
    { new: true }
  );

  if (!updatedEvent) {
    return next(new AppError("Event reached capacity while you were registering. Please try another event.", 400));
  }

  // Step 2: Create Registration
  let registration;
  try {
    registration = await Registration.create({
      event: id,
      user: req.userId,
      college: updatedEvent.college,
      status: "pending", // Default to pending for Milestone-3 approval flow
      customRequirements: req.body.customResponses, // for custom requirements
    });
  } catch (err) {
    // Rollback participant count if registration creation fails (e.g. duplicate)
    await Event.findByIdAndUpdate(id, { $inc: { currentParticipants: -1 } });
    if (err.code === 11000) {
      return next(new AppError("You are already registered for this event", 400));
    }
    throw err;
  }

  // Step 3: Sync to User
  await User.findByIdAndUpdate(req.userId, { $push: { registeredEvents: id } });

  // Notify student
  await notifyUser({
    recipientId: req.userId,
    type: "REGISTRATION_STATUS",
    title: "Registration Received",
    message: `You have successfully applied for "${updatedEvent.title}". Status: Pending Approval.`,
    link: `/student`,
    email: req.user.email,
    shouldSendEmail: true,
  });

  res.status(200).json({
    success: true,
    message: "Registration successful. Pending approval.",
    data: { registration },
  });
});

// Cancel an event (College Admin or SuperAdmin)
export const cancelEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const event = await Event.findById(id);
  if (!event) return next(new AppError("Event not found", 404));

  // Permission check
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied. You can only cancel your own events.", 403));
  }

  if (event.status === "cancelled") {
    return next(new AppError("Event is already cancelled.", 400));
  }

  // Update status
  event.status = "cancelled";
  event.isActive = false; // Effectively hides it from browse but keeps record
  await event.save();

  // Find all approved/pending registrants to notify
  const registrations = await Registration.find({ event: id }).populate("user", "email firstName");

  // Log action
  await logAdminAction({
    action: "EVENT_UPDATE",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { title: event.title, change: "CANCELLED", reason },
    ipAddress: req.ip,
  });

  // Bulk Notification
  registrations.forEach(async (reg) => {
    // In-app
    await notifyUser({
      recipientId: reg.user._id,
      type: "EVENT_ALERT",
      title: "Event Cancelled",
      message: `The event "${event.title}" has been cancelled. Reason: ${reason || 'Not specified'}.`,
      link: "/student",
    });

    // Email
    try {
      await sendEmail({
        email: reg.user.email,
        subject: `[Cancelled] ${event.title}`,
        message: `Hi ${reg.user.firstName}, unfortunately the event "${event.title}" has been cancelled.`,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444;">Event Cancelled</h2>
          <p>Hi <strong>${reg.user.firstName}</strong>,</p>
          <p>We regret to inform you that the event <strong>"${event.title}"</strong> has been cancelled by the organizer.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>Check the student dashboard for other upcoming events.</p>
        </div>`
      });
    } catch (e) {
      console.error(`Failed to send cancellation email to ${reg.user.email}`);
    }
  });

  res.status(200).json({
    success: true,
    message: "Event cancelled successfully and registrants notified.",
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
    status,
    search,
  } = req.query;

  // Build filter object
  const filter = { isActive: true, isApproved: true };

  if (category) {
    filter.category = category;
  }

  if (college) {
    filter.college = college;
  }

  if (status && status !== "all") {
    filter.status = status;
  } else if (!status) {
    // Default: Show upcoming and ongoing events for students
    filter.status = { $in: ["upcoming", "ongoing"] };
  }
  // if status is "all", we don't add status filter

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

  let event = await Event.findById(id);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check permissions
  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("You can only manage your own events.", 403));
  }

  // Prevent loophole: Setting maxParticipants lower than current participants
  if (req.body.maxParticipants !== undefined && req.body.maxParticipants < event.currentParticipants) {
    return next(new AppError(`Cannot set max participants lower than current participants (${event.currentParticipants}).`, 400));
  }

  // Detect critical changes to notify students
  const criticalChange =
    (req.body.startDate && new Date(req.body.startDate).getTime() !== new Date(event.startDate).getTime()) ||
    (req.body.location && req.body.location !== event.location) ||
    (req.body.title && req.body.title !== event.title);

  // SECURITY: Whitelist allowed update fields — prevent injecting isApproved, currentParticipants, createdBy etc
  const allowedFields = ["title", "description", "category", "location", "startDate", "endDate", "maxParticipants",
    "registrationDeadline", "requirements", "dosAndDonts", "participationRequirements", "bannerImage", "isTeamEvent",
    "minTeamSize", "maxTeamSize", "participationMode"];
  const sanitizedUpdate = { updatedAt: Date.now() };
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) sanitizedUpdate[key] = req.body[key];
  }

  // Update
  event = await Event.findByIdAndUpdate(
    id,
    sanitizedUpdate,
    { new: true, runValidators: true }
  ).populate([
    { path: "college", select: "name code" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

  // If critical change occurred, notify all registered students
  if (criticalChange) {
    try {
      const registrations = await Registration.find({ event: id, status: "approved" }).populate("user", "email firstName");
      const notificationPromises = registrations.map(async (reg) => {
        await notifyUser({
          recipientId: reg.user._id,
          type: "EVENT_MODIFIED",
          title: "Event Details Updated",
          message: `Important: The details for "${event.title}" have been updated. Please review the updated schedule.`,
          link: "/student"
        });

        try {
          const tpl = EmailTemplates.eventModified(event.title, event.title);
          await sendEmail({ email: reg.user.email, ...tpl });
        } catch (e) { console.error("Update email failed", e); }
      });
      await Promise.allSettled(notificationPromises);
    } catch (err) {
      console.error("Failed to notify students of event update:", err);
    }

    // Also notify SuperAdmin of critical edits if it's not them
    if (req.userRole !== 'admin') {
      const superAdmins = await User.find({ role: "admin" }).select("email");
      superAdmins.forEach(async (admin) => {
        await notifyUser({
          recipientId: admin._id,
          type: "ADMIN_ANNOUNCEMENT",
          title: `Event Edit: ${event.title}`,
          message: `College Admin ${req.user.firstName} modified critical details of event "${event.title}".`,
          link: `/admin`,
        });
      });
    }
  }

  // Log action
  await logAdminAction({
    action: "EVENT_UPDATE",
    performedBy: req.userId,
    targetId: id,
    targetType: "Event",
    ipAddress: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: { event },
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
  await Event.findByIdAndUpdate(id, { isActive: false, status: "cancelled" });

  // Notify registered students
  try {
    const registrations = await Registration.find({ event: id }).populate("user", "email firstName");
    registrations.forEach(async (reg) => {
      const tpl = EmailTemplates.eventCancelled(event.title);
      await sendEmail({ email: reg.user.email, ...tpl });
    });
  } catch (e) { console.error("Deletion notification failed", e); }

  // Notify SuperAdmin
  if (req.userRole !== 'admin') {
    const superAdmins = await User.find({ role: "admin" }).select("email");
    superAdmins.forEach(async (admin) => {
      await notifyUser({
        recipientId: admin._id,
        type: "ADMIN_ANNOUNCEMENT",
        title: "Event Deleted",
        message: `Administrative Notice: Event "${event.title}" has been removed by ${req.user.firstName}.`,
        link: `/superadmin`,
      });
    });
  }

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

// Get all pending events (SuperAdmin only)
export const getPendingEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ isApproved: false, isActive: true })
    .populate("college", "name code")
    .populate("createdBy", "firstName lastName email");

  res.status(200).json({
    success: true,
    results: events.length,
    data: {
      events,
    },
  });
});
