import crypto from "crypto";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendToken from "../utils/sendToken.js";

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Register a new user
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, collegeId, firstName, lastName, phone, department, officialId, role } = req.body;
  console.log(`[Registration] Request for ${email} with role: ${role}`);

  // Validate college exists
  const college = await College.findById(collegeId);
  if (!college) return next(new AppError("College not found", 400));

  // Restrict email domains to institutional emails (.edu or .ac.*) - now allowing gmail for testing
  const isInstitutionalEmail = /\.(edu([a-z\.]+)?|ac\.[a-z]{2,})$/i.test(email) || email.toLowerCase().endsWith("@gmail.com");
  if (!isInstitutionalEmail) {
    return next(new AppError("Only institutional emails (.edu, .ac.in, etc.) or @gmail.com (for testing) are allowed.", 403));
  }

  // Prevent duplicate registrations
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    // Give a specific message if the account is already pending verification
    if (existingUser.accountStatus === "pending") {
      return next(new AppError(
        "An account with this email is pending verification. Please check your inbox or request a new verification link.",
        400
      ));
    }
    return next(new AppError("User with this email or username already exists", 400));
  }

  // Role safety: public registration only allows student or college_admin
  const assignedRole = role === "college_admin" ? "college_admin" : "student";

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user in PENDING state
  const newUser = new User({
    username,
    email,
    password,
    role: assignedRole,
    college: collegeId,
    firstName,
    lastName,
    phone,
    department,
    officialId,
    isEmailVerified: false,
    isApproved: false,
    isActive: false,
    accountStatus: "pending",
    emailVerificationToken: token,
    emailVerificationExpires: tokenExpiry,
  });

  await newUser.save();

  // Build verification URLs
  const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify-email/${token}`;
  const deleteUrl = `${baseUrl}/delete-account/${token}`;

  // Send onboarding email
  try {
    const tpl = EmailTemplates.onboarding(firstName, verifyUrl, deleteUrl);
    await sendEmail({ email: newUser.email, ...tpl });
  } catch (e) {
    // If email fails, delete the user so they can retry
    await User.findByIdAndDelete(newUser._id);
    console.error("Onboarding email failed:", e.message);
    return next(new AppError("Could not send verification email. Please try again later.", 500));
  }

  res.status(201).json({
    success: true,
    message: "Account created! Please check your email to verify your account.",
    data: { email: newUser.email },
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const sanitizedEmail = email?.trim().toLowerCase();

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email: sanitizedEmail }).populate("college", "name code");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Block unverified / pending accounts
  if (user.accountStatus === "pending") {
    return next(new AppError(
      "Your email is not verified yet. Please check your inbox and click the verification link. Need a new link? Use \"Resend Verification\" on the login page.",
      403
    ));
  }

  // Block deleted accounts
  if (user.accountStatus === "deleted") {
    return next(new AppError("This account has been removed.", 403));
  }

  // Block unapproved college admins with a specific pending approval message
  if (user.role === "college_admin" && !user.isApproved) {
    return next(new AppError(
      "Your account is pending Super Admin approval. You will receive an email once it is verified.",
      403
    ));
  }

  // Block deactivated accounts
  if (!user.isActive) {
    return next(new AppError("Account deactivated. Contact support.", 401));
  }

  user.lastLogin = new Date();
  await user.save();

  sendToken(user, 200, res);
});

// Logout user
export const logout = (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Verify email — activates account
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    // Check if token exists but is just expired
    const expiredUser = await User.findOne({ emailVerificationToken: token });
    if (expiredUser) {
      return next(new AppError("Verification link has expired. Please request a new one.", 400));
    }
    return next(new AppError("Invalid verification link. It may have already been used.", 400));
  }

  if (user.accountStatus === "active") {
    return next(new AppError("Account is already verified. You can log in.", 400));
  }

  // Activate the account
  user.isEmailVerified = true;
  user.isApproved = user.role === "student"; // Students auto-approved; college_admin waits for SuperAdmin
  user.isActive = user.role === "student";
  user.accountStatus = "active";
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // If new college admin, notify all super admins
  if (user.role === "college_admin") {
    try {
      const fullUser = await User.findById(user._id).populate("college", "name");
      const superAdmins = await User.find({ role: "admin" }).select("email");

      const emailPromises = superAdmins.map(admin => {
        const tpl = EmailTemplates.newCollegeAdminPending(fullUser.firstName, fullUser.college.name);
        return sendEmail({ email: admin.email, ...tpl });
      });
      await Promise.allSettled(emailPromises);
    } catch (err) {
      console.error("Failed to notify super admins about new college admin:", err);
    }
  }

  // Send welcome email to students immediately after verification
  if (user.role === 'student') {
    try {
      const tpl = EmailTemplates.welcome(user.firstName);
      await sendEmail({ email: user.email, ...tpl });
    } catch (err) {
      console.error("Welcome email failed after verification:", err);
    }
  }

  res.status(200).json({
    success: true,
    message: user.role === "student"
      ? "Identity confirmed. Your account is now active. Please proceed to login."
      : "Identity confirmed. Your application has been transmitted to the SuperAdmin for final authorization. You will be notified once activated.",
  });
});

// Delete account via token (clicked \"I Didn't Sign Up\")
export const deleteAccountByToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return next(new AppError("Invalid or already used link.", 400));
  }

  if (user.accountStatus === "active") {
    return next(new AppError(
      "This account is already active. If someone is using your email without permission, please contact support.",
      400
    ));
  }

  // If it was a college admin, notify super admins of the purge
  if (user.role === 'college_admin' && !user.isApproved) {
    const superAdmins = await User.find({ role: "admin" }).select("email");
    superAdmins.forEach(async (admin) => {
      await sendEmail({
        email: admin.email,
        subject: "Security Alert: Admin Application Purged",
        message: `The application for ${user.firstName} (${user.email}) from ${user.college} was deleted by the user via the security bridge.`,
        html: baseTemplate("Application Purged", `<p>The administrative application for <strong>${user.firstName}</strong> has been removed by the user using the 'I Didn't Sign Up' security link.</p>`)
      }).catch(e => console.error("Purge notice failed", e));
    });
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: "Identity record purged. Your email has been removed from our registration protocols.",
  });
});

// Resend verification email
export const resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please provide your email address.", 400));

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  // Rate-limit: don't leak user existence
  const genericOk = { success: true, message: "If a pending account exists, a new verification email has been sent." };

  if (!user) return res.status(200).json(genericOk);

  if (user.accountStatus === "active") {
    return next(new AppError("This account is already verified. Please log in.", 400));
  }

  if (user.accountStatus === "deleted") return res.status(200).json(genericOk);

  // Generate new token
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify-email/${token}`;

  try {
    const tpl = EmailTemplates.resendVerification(user.firstName, verifyUrl);
    await sendEmail({ email: user.email, ...tpl });
  } catch (e) {
    console.error("Resend verification email failed:", e.message);
  }

  res.status(200).json(genericOk);
});

// Get current user profile with dashboard stats
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId)
    .populate("college", "name code email website phone departments")
    .lean(); // Use lean to easily attach properties

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Attach role-specific stats directly to the profile response
  if (user.role === "student") {
    // Get all registrations for this student
    const registrations = await Registration.find({ user: user._id })
      .populate({
        path: "event",
        select: "title startDate endDate status category location"
      });

    const now = new Date();

    user.participatedEvents = registrations.filter(r =>
      r.status === "approved" && new Date(r.event.endDate) < now
    ).map(r => r.event);

    user.futureEvents = registrations.filter(r =>
      r.status === "approved" && new Date(r.event.startDate) >= now
    ).map(r => r.event);

    user.pendingRegistrations = registrations.filter(r => r.status === "pending").map(r => r.event);

  } else if (user.role === "college_admin") {
    // Get events created by this admin
    const createdEvents = await Event.find({ createdBy: user._id })
      .select("title startDate status isApproved currentParticipants maxParticipants");

    user.createdEvents = createdEvents;
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// Update profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, avatar } = req.body;
  const userId = req.userId;

  // SECURITY: Only allow whitelisted fields to be updated — prevent role/approval escalation
  const allowedUpdates = {};
  if (firstName !== undefined) allowedUpdates.firstName = firstName;
  if (lastName !== undefined) allowedUpdates.lastName = lastName;
  if (phone !== undefined) allowedUpdates.phone = phone;
  if (avatar !== undefined) allowedUpdates.avatar = avatar;
  if (req.body.academicClass !== undefined) allowedUpdates.academicClass = req.body.academicClass;
  if (req.body.section !== undefined) allowedUpdates.section = req.body.section;

  const user = await User.findByIdAndUpdate(
    userId,
    allowedUpdates,
    { new: true, runValidators: true }
  ).populate("college", "name code phone departments");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

// Admin: Get all pending approvals (System Admin Only)
export const getPendingUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    isApproved: false,
    role: "college_admin",
    accountStatus: "active", // Only show email-verified college admins
  }).populate("college", "name code");

  res.status(200).json({
    success: true,
    results: users.length,
    data: {
      users,
    },
  });
});

// Admin: Approve a user (SuperAdmin approves CollegeAdmin, CollegeAdmin approves Student)
export const approveUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent approving SuperAdmin accounts or yourself
  if (user.role === "admin") {
    return next(new AppError("Cannot modify SuperAdmin accounts.", 403));
  }

  // Prevent already-approved users from being approved again
  if (user.isApproved) {
    return next(new AppError("User is already approved.", 400));
  }

  // Permission check: College Admin can only approve students from their college
  if (req.userRole === "college_admin") {
    if (user.role !== "student" || user.college.toString() !== req.user.college.toString()) {
      return next(new AppError("You only have permission to approve students from your own college.", 403));
    }
  }

  user.isApproved = true;
  user.isActive = true;
  await user.save();

  // Send approval email non-blocking
  try {
    if (user.role === "college_admin") {
      const tpl = EmailTemplates.collegeAdminApproved(user.firstName);
      sendEmail({ email: user.email, ...tpl }).catch(err => console.error(err));
    } else {
      const message = `Congratulations, ${user.firstName}! Your account on CampusEventHub has been approved. You can now log in and access all features.`;
      const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
      sendEmail({
        email: user.email,
        subject: "Account Approved - CampusEventHub",
        message,
        html: `<h1>Account Approved!</h1><p>Congratulations, <strong>${user.firstName}</strong>!</p><p>Your account on CampusEventHub has been approved by the administrator. You can now log in and participate in campus activities.</p><p><a href="${baseUrl}/login">Login Now</a></p>`,
      }).catch(err => console.error(err));
    }
  } catch (err) {
    console.error("Approval email setup failed:", err);
  }

  res.status(200).json({
    success: true,
    message: "User approved successfully",
    data: {
      user,
    },
  });
});

// Admin: Reject/Delete a user
export const rejectUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Permission check: College Admin can only reject students from their college
  if (req.userRole === "college_admin") {
    if (user.role !== "student" || user.college.toString() !== req.user.college.toString()) {
      return next(new AppError("You only have permission to reject students from your own college.", 403));
    }
  }

  // Send rejection email non-blocking before deleting
  try {
    if (user.role === "college_admin") {
      const tpl = EmailTemplates.collegeAdminRejected(user.firstName);
      sendEmail({ email: user.email, ...tpl }).catch(err => console.error(err));
    } else {
      const message = `Hello ${user.firstName}, we regret to inform you that your registration request on CampusEventHub has been rejected. Please contact your college administrator for details.`;
      sendEmail({
        email: user.email,
        subject: "Registration Update - CampusEventHub",
        message,
        html: `<h1>Registration Update</h1><p>Hello ${user.firstName},</p><p>We regret to inform you that your registration request on <strong>CampusEventHub</strong> has been rejected by the administrator.</p><p>If you believe this is a mistake, please contact your college office.</p>`,
      }).catch(err => console.error(err));
    }
  } catch (err) {
    console.error("Rejection email setup failed:", err);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User registration rejected and account deleted",
  });
});

// College Admin: Get pending students for their college
export const getPendingStudents = catchAsync(async (req, res, next) => {
  const users = await User.find({
    role: "student",
    isApproved: false,
    college: req.user.college,
  });

  res.status(200).json({
    success: true,
    results: users.length,
    data: {
      users,
    },
  });
});

// Admin: Get all users
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate("college", "name code");
  res.status(200).json({
    success: true,
    results: users.length,
    data: { users }
  });
});

// Admin: Get all colleges
export const getAllColleges = catchAsync(async (req, res, next) => {
  const colleges = await College.find();
  res.status(200).json({
    success: true,
    results: colleges.length,
    data: { colleges }
  });
});

// Admin: Manually create a student account
export const createStudent = catchAsync(async (req, res, next) => {
  const { username, email, password, firstName, lastName, phone, department, officialId, academicClass, section, collegeId } = req.body;

  // Determination of college: SuperAdmin specifies collegeId, CollegeAdmin uses their own
  let targetCollegeId = collegeId;
  if (req.userRole === 'college_admin') {
    targetCollegeId = req.user.college;
  }

  if (!targetCollegeId) return next(new AppError("College ID is required.", 400));

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) return next(new AppError("User already exists.", 400));

  const newUser = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    department,
    officialId,
    academicClass,
    section,
    role: "student",
    college: targetCollegeId,
    isEmailVerified: true, // Manual creation skips email verification
    isApproved: true,
    isActive: true,
    accountStatus: "active"
  });

  await newUser.save();

  // Send welcome email
  try {
    const tpl = EmailTemplates.welcome(firstName);
    await sendEmail({ email, ...tpl });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }

  res.status(201).json({
    success: true,
    message: "Student account created manually.",
    data: { user: newUser }
  });
});
