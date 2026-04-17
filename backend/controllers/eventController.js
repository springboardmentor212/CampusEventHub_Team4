import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { promoteNextWaitlistedRegistration } from "./registrationController.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import { logAdminAction } from "../utils/logger.js";
import { notifyUser } from "../utils/notificationService.js";
import { enrichEventWithLifecycle, enrichEventsWithLifecycle } from "../utils/lifecycleMapper.js";

// Create a new event (College Admin only)
export const createEvent = catchAsync(async (req, res, next) => {
  const user = req.user;
  const collegeId = (req.userRole === "admin" && req.body.college) ? req.body.college : user.college;

  // SECURITY: Whitelist allowed fields — prevent injection of isApproved, currentParticipants etc.
  const { title, description, category, location, startDate, endDate, maxParticipants,
    registrationDeadline, requirements, dosAndDonts, participationRequirements, imageUrl, bannerImage,
    isTeamEvent, minTeamSize, maxTeamSize, participationMode, customCategory, audience } = req.body;

  // Validate: Start date must be in the future
  if (new Date(startDate) <= new Date()) {
    return next(new AppError("Event start date must be in the future.", 400));
  }

  // Validate: Registration deadline must be before start date (if provided)
  if (registrationDeadline && new Date(registrationDeadline) >= new Date(startDate)) {
    return next(new AppError("Registration deadline must be before the event start date.", 400));
  }

  if (maxParticipants !== null && maxParticipants !== undefined && Number(maxParticipants) <= 0) {
    return next(new AppError("maxParticipants must be greater than 0 when provided.", 400));
  }

  // Duplicate check
  const duplicate = await Event.findOne({
    title,
    location,
    startDate: new Date(startDate),
    isActive: true
  });

  const event = await Event.create({
    title, description, category, location, startDate, endDate, maxParticipants,
    registrationDeadline,
    registrationClosesAt: req.body.registrationClosesAt || registrationDeadline,
    requirements, dosAndDonts, participationRequirements, imageUrl, bannerImage,
    isTeamEvent, minTeamSize, maxTeamSize, participationMode: participationMode || "solo",
    audience: audience || "all_colleges",
    customCategory: category === "other" ? (customCategory || "") : "",
    college: collegeId,
    createdBy: req.userId,
    isApproved: false, // Always require superadmin approval
    status: "pending_approval", // Always pending until approved
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
    message: "Event submitted for approval.",
    isDuplicate: !!duplicate,
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

  if (event.hasPendingUpdate) {
    // Handling pending update approval
    const updatedFields = event.pendingUpdate;
    const oldMaxParticipants = event.maxParticipants;
    const newMaxParticipants = updatedFields.maxParticipants;

    // Compare and apply
    for (const key in updatedFields) {
      if (event[key] !== undefined) {
        event[key] = updatedFields[key];
      }
    }

    event.hasPendingUpdate = false;
    event.pendingUpdate = null;
    event.pauseReason = null;
    event.status = "approved";
    event.lastApprovedData = event.toObject();
    await event.save();

    // If capacity was increased, check if there are waitlisted students
    if (newMaxParticipants > oldMaxParticipants) {
      const waitlistedCount = await Registration.countDocuments({ event: id, status: "waitlisted" });
      if (waitlistedCount > 0) {
        // Find how many new spots were created
        const newSpots = newMaxParticipants - oldMaxParticipants;
        // Promote up to newSpots people
        for (let i = 0; i < newSpots; i++) {
          await promoteNextWaitlistedRegistration(event._id);
        }
      }
    }

    // Notify Admin
    await notifyUser({
      recipientId: event.createdBy._id,
      type: "REGISTRATION_STATUS",
      title: "Update Approved",
      message: `Your update for "${event.title}" has been approved.`,
      link: "/manage-events"
    });

    return res.status(200).json({
      success: true,
      message: "Event update approved and applied.",
      data: { event }
    });
  }

  // Initial approval logic
  event.isApproved = true;
  event.isVisible = true;
  event.isActive = true;
  event.status = "approved";
  event.lastApprovedData = event.toObject();
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
    type: "EVENT_APPROVE",
    title: "Event Approved",
    message: `Your event "${event.title}" has been approved and is now live!`,
    link: `/manage-events`,
  });

  // Notify creator via email
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

  if (event.hasPendingUpdate) {
    // Rejecting a pending update
    event.hasPendingUpdate = false;
    event.pendingUpdate = null;
    event.pauseReason = null;
    event.status = "approved"; // Keep enum-compatible live status
    await event.save();

    // Notify creator
    await notifyUser({
      recipientId: event.createdBy._id,
      type: "EVENT_UPDATE",
      title: "Update Rejected",
      message: `Your update for "${event.title}" was rejected. Reason: ${reason || "Does not meet requirements."}`,
      link: "/manage-events"
    });

    try {
      const message = `Hello ${event.createdBy.firstName}, unfortunately your requested update for "${event.title}" was rejected by the administrator.\n\nReason: ${reason || "Not specified."}`;
      await sendEmail({
        email: event.createdBy.email,
        subject: "Event Update Rejected",
        message,
        html: `<h1>Update Rejected</h1><p>Hi ${event.createdBy.firstName},</p><p>Your update for event <strong>"${event.title}"</strong> was rejected.</p><p><strong>Reason:</strong> ${reason || "Not specified."}</p>`
      });
    } catch (e) { console.error("Rejection email failed", e); }

    return res.status(200).json({
      success: true,
      message: "Event update rejected. Live version preserved."
    });
  }

  // Initial rejection logic
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

  // Notify creator via email and in-app
  await notifyUser({
    recipientId: event.createdBy._id,
    type: "EVENT_REJECT",
    title: "Event Rejected",
    message: `Your event "${event.title}" was rejected. Reason: ${reason || "Documentation requirements not met."}`,
    link: "/manage-events"
  });

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
  if (event.maxParticipants === 0) {
    return next(new AppError("Registration is disabled for this event", 400));
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
  const existingReg = await Registration.findOne({
    event: id,
    user: req.userId,
    status: { $in: ["approved", "waitlisted", "attended", "no_show"] },
  });
  if (existingReg) {
    return next(new AppError("You are already registered for this event", 400));
  }

  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    const waitlistPosition = await Registration.countDocuments({ event: id, status: "waitlisted" }) + 1;
    const registration = await Registration.create({
      event: id,
      user: req.userId,
      college: event.college,
      status: "waitlisted",
      waitlistPosition,
      customRequirements: req.body.customResponses,
    });

    await notifyUser({
      recipientId: req.userId,
      type: "REGISTRATION_STATUS",
      title: "Added to Waitlist",
      message: `"${event.title}" is full. You are now waitlisted at position ${waitlistPosition}.`,
      link: `/event/${id}`,
      email: req.user.email,
      shouldSendEmail: true,
    });

    return res.status(200).json({
      success: true,
      message: `Event is full. You are waitlisted at position ${waitlistPosition}.`,
      data: { registration, waitlistPosition },
    });
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
      status: "approved",
      approvalDate: new Date(),
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
    title: "Registration Confirmed",
    message: `You are confirmed for "${updatedEvent.title}".`,
    link: `/student/dashboard`,
    email: req.user.email,
    shouldSendEmail: true,
  });

  res.status(200).json({
    success: true,
    message: "Registration confirmed.",
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
      type: "EVENT_UPDATE",
      title: "Event Cancelled",
      message: `The event "${event.title}" has been cancelled. Reason: ${reason || 'Not specified'}.`,
      link: "/student/dashboard",
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
    availability,
    sort,
  } = req.query;

  // Build filter object
  const { scope } = req.query;
  // Remove any user-specific creation date logic: all students see all live events regardless of when they or the event were created
  const filter = { isActive: true, isApproved: true, isVisible: true };

  if (req.user && req.userRole === "admin") {
    // SuperAdmin can see everything for management
    delete filter.isVisible;
    delete filter.isApproved;
    delete filter.isActive;
  } else if (!req.user) {
    // Public/Unauthenticated: Only "all_colleges" events
    filter.audience = "all_colleges";
  } else if (req.userRole === "student") {
    // Student: See all live events for their college and all_colleges, regardless of when the event or user was created
    const userCollegeId = req.user.college;
    if (scope === "my_college") {
      filter.college = userCollegeId;
    } else if (scope === "other_colleges") {
      filter.college = { $ne: userCollegeId };
      filter.audience = "all_colleges";
    } else {
      filter.$or = [
        { audience: "all_colleges" },
        { audience: "my_college", college: userCollegeId }
      ];
    }
  } else if (req.userRole === "college_admin") {
    filter.college = req.user.college;
  }

  // rest of existing filter logic continues below unchanged
  if (category) {
    filter.category = category;
  }

  if (college) {
    filter.college = college;
  }

  if (status && status !== "all") {
    filter.status = status;
  } else if (!status && req.userRole !== "admin") {
    // Default feed behavior for non-admins: show events that have not ended yet.
    filter.endDate = { $gte: new Date() };
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

  // Availability filter (Task 17)
  if (availability === "open") {
    // Show events with spots OR open events (maxParticipants is null or 0)
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { maxParticipants: null },
        { maxParticipants: 0 },
        { $expr: { $lt: ["$currentParticipants", "$maxParticipants"] } }
      ]
    });
  } else if (availability === "full") {
    filter.$and = filter.$and || [];
    filter.$and.push({
      maxParticipants: { $gt: 0 },
      $expr: { $gte: ["$currentParticipants", "$maxParticipants"] }
    });
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

  // Sort logic (Task 18)
  let sortObj = { startDate: 1 };
  if (sort === "newest") sortObj = { createdAt: -1 };
  else if (sort === "oldest") sortObj = { createdAt: 1 };
  else if (sort === "popularity") sortObj = { currentParticipants: -1 };
  else if (sort === "startDate") sortObj = { startDate: 1 };

  // Get events
  const events = await Event.find(filter)
    .populate("college", "name code")
    .populate("createdBy", "firstName lastName")
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Event.countDocuments(filter);

  const enrichedEvents = enrichEventsWithLifecycle(events.map(e => e.toObject()));

  res.status(200).json({
    success: true,
    results: enrichedEvents.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: {
      events: enrichedEvents,
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

  const enrichedEvent = enrichEventWithLifecycle(event.toObject());

  res.status(200).json({
    success: true,
    data: {
      event: enrichedEvent,
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
  const allowedFields = ["title", "description", "category", "customCategory", "location", "audience", "startDate", "endDate", "maxParticipants",
    "registrationDeadline", "requirements", "dosAndDonts", "participationRequirements", "bannerImage", "isTeamEvent",
    "minTeamSize", "maxTeamSize", "participationMode"];

  const sanitizedUpdate = { updatedAt: Date.now() };
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) sanitizedUpdate[key] = req.body[key];
  }

  // If the event is already live (approved), we buffer the update
  if (event.isApproved) {
    event.pendingUpdate = sanitizedUpdate;
    event.hasPendingUpdate = true;
    event.status = "paused";
    event.pauseReason = "This event is paused while an update is under review.";
    await event.save();

    // Notify SuperAdmin
    const superAdmins = await User.find({ role: "admin" });
    for (const admin of superAdmins) {
      await notifyUser({
        recipientId: admin._id,
        type: "EVENT_UPDATE",
        title: "Event Update Pending",
        message: `Event "${event.title}" was updated and is now pending review.`,
        link: "/superadmin?tab=approvals"
      });
    }

    // Log action
    await logAdminAction({
      action: "EVENT_UPDATE_REQUEST",
      performedBy: req.userId,
      targetId: id,
      targetType: "Event",
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Update submitted for review. The event is now paused.",
      data: { event }
    });
  }

  // If draft, apply directly
  event = await Event.findByIdAndUpdate(
    id,
    sanitizedUpdate,
    { new: true, runValidators: true }
  ).populate([
    { path: "college", select: "name code" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

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

export const pauseEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return next(new AppError("Event not found", 404));

  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied. You can only pause your own events.", 403));
  }

  if (event.status === "paused") {
    return next(new AppError("Event is already paused.", 400));
  }

  event.status = "paused";
  event.isActive = false;
  await event.save();

  await logAdminAction({
    action: "EVENT_UPDATE",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { change: "PAUSED" },
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: "Event paused.", data: { event } });
});

export const resumeEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return next(new AppError("Event not found", 404));

  if (req.userRole !== "admin" && event.createdBy.toString() !== req.userId.toString()) {
    return next(new AppError("Access denied. You can only resume your own events.", 403));
  }

  if (event.status !== "paused") {
    return next(new AppError("Event is not paused.", 400));
  }

  // Keep status enum-safe and let UI derive temporal state from dates.
  event.status = "approved";

  event.isActive = true;
  await event.save();

  await logAdminAction({
    action: "EVENT_UPDATE",
    performedBy: req.userId,
    targetId: event._id,
    targetType: "Event",
    details: { change: "RESUMED" },
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: "Event resumed.", data: { event } });
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
