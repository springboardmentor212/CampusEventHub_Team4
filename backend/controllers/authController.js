import crypto from "crypto";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import sendEmail from "../utils/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendToken from "../utils/sendToken.js";

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Register a new user
export const register = catchAsync(async (req, res, next) => {
  const {
    username,
    email,
    password,
    collegeId,
    firstName,
    lastName,
    phone,
    officialId,
    role,
  } = req.body;

  // Check if college exists
  const college = await College.findById(collegeId);
  if (!college) {
    return next(new AppError("College not found", 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new AppError("User with this email or username already exists", 400));
  }

  // SECURITY: Require approval for college_admin but allow students to login directly
  let assignedRole = role === "college_admin" ? "college_admin" : "student";
  let approvedStatus = assignedRole === "student"; // Students auto-approved

  // Generate email verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create new user
  const newUser = new User({
    username,
    email,
    password, // Will be hashed by model pre-save hook
    role: assignedRole,
    college: collegeId,
    firstName,
    lastName,
    phone,
    officialId,
    isApproved: approvedStatus,
    isEmailVerified: true, // Auto-verify for now to simplify flow
    emailVerificationToken: undefined,
    emailVerificationExpires: undefined,
  });

  await newUser.save();

  res.status(201).json({
    success: true,
    message: assignedRole === "admin" ? "User created successfully" : (assignedRole === "student" ? "Successfully registered!" : "Registration pending approval"),
    data: {
      user: newUser,
    },
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const sanitizedEmail = email?.trim().toLowerCase();

  console.log(`[LOGIN_DEBUG] Attempting login for: ${sanitizedEmail}`);

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email: sanitizedEmail }).populate("college", "name code");

  if (!user) {
    console.log(`[LOGIN_DEBUG] User NOT found in DB: ${sanitizedEmail}`);
    return next(new AppError("Invalid email or password", 401));
  }

  console.log(`[LOGIN_DEBUG] User found. Hashed password in DB: ${user.password.substring(0, 10)}...`);

  const isMatch = await user.comparePassword(password);
  console.log(`[LOGIN_DEBUG] Password match result: ${isMatch}`);

  if (!isMatch) {
    return next(new AppError("Invalid email or password", 401));
  }

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

// Verify email
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired verification token", 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

// Get current user profile
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId)
    .populate("college", "name code email website");

  if (!user) {
    return next(new AppError("User not found", 404));
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

  const user = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  );

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
  const users = await User.find({ isApproved: false, role: "college_admin" })
    .populate("college", "name code");

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

  // Permission check: College Admin can only approve students from their college
  if (req.userRole === "college_admin") {
    if (user.role !== "student" || user.college.toString() !== req.user.college.toString()) {
      return next(new AppError("You only have permission to approve students from your own college.", 403));
    }
  }

  user.isApproved = true;
  await user.save();

  // Send approval email
  const message = `Congratulations, ${user.firstName}! Your account on CampusEventHub has been approved. You can now log in and access all features.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Account Approved - CampusEventHub",
      message,
      html: `<h1>Account Approved!</h1><p>Congratulations, <strong>${user.firstName}</strong>!</p><p>Your account on CampusEventHub has been approved by the administrator. You can now log in and participate in campus activities.</p><p><a href="${process.env.FRONTEND_URL}/login">Login Now</a></p>`,
    });
  } catch (err) {
    console.error("Approval email failed:", err);
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

  // Send rejection email before deleting
  const message = `Hello ${user.firstName}, we regret to inform you that your registration request on CampusEventHub has been rejected. Please contact your college administrator for details.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Registration Update - CampusEventHub",
      message,
      html: `<h1>Registration Update</h1><p>Hello ${user.firstName},</p><p>We regret to inform you that your registration request on <strong>CampusEventHub</strong> has been rejected by the administrator.</p><p>If you believe this is a mistake, please contact your college office.</p>`,
    });
  } catch (err) {
    console.error("Rejection email failed:", err);
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
