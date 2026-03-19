import crypto from "crypto";
import { User } from "../models/User.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Request password reset
export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Security Best Practice: Don't leak registered emails
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link will be sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpiry;
  await user.save();

  const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
  const message = `Forgot your password? Reset it here: ${resetUrl}. If you didn't, please ignore.`;

  try {
    const tpl = EmailTemplates.passwordReset(resetUrl);
    await sendEmail({ email: user.email, ...tpl });
    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link will be sent.",
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

  user.password = newPassword;
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
  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError("Current password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
