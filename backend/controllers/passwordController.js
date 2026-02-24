import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import sendEmail from "../utils/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Request password reset
export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // We don't want to leak if an email exists, but for CEH we stick to current UX which tells the user
    return next(new AppError("No account found with this email address", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpiry;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Forgot your password? Reset it here: ${resetUrl}. If you didn't, please ignore.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - CampusEventHub",
      message,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new AppError("Error sending email. Try again later.", 500));
  }
});

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

// Change password (authenticated user)
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 400));
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
