import bcrypt from "bcryptjs";
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

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate email verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: "student",
    college: collegeId,
    firstName,
    lastName,
    phone,
    emailVerificationToken,
    emailVerificationExpires,
  });

  await newUser.save();

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;

  const message = `Welcome to CampusEventHub, ${firstName}! \n\n Please verify your email by clicking the link below: \n\n ${verificationUrl}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Welcome to CampusEventHub - Verify your email",
      message,
      html: `<h1>Welcome!</h1><p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });
  } catch (err) {
    console.error("Email failed:", err);
  }

  sendToken(newUser, 201, res);
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("college", "name code");
  if (!user || !(await bcrypt.compare(password, user.password))) {
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
