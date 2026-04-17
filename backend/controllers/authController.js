// Get all students for a college (for college admin)
export const getAllStudentsForCollege = catchAsync(async (req, res, next) => {
    // Only for college_admins
    if (!req.user || req.user.role !== "college_admin" || !req.user.college) {
        return next(new AppError("Unauthorized", 403));
    }
    const users = await User.find({
        role: "student",
        college: req.user.college
    }).select("firstName lastName email isApproved isVerified accountStatus rejectionReason officialId phone createdAt");
    res.status(200).json({ success: true, data: { users } });
});
import crypto from "crypto";
import { User } from "../models/User.js";
import { College } from "../models/College.js";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import { Notification } from "../models/Notification.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendToken from "../utils/sendToken.js";

const logAuth = (level, message, meta = {}) => {
    const payload = {
        timestamp: new Date().toISOString(),
        module: "authController",
        level,
        message,
        ...meta,
    };
    const writer = level === "error" ? console.error : console.info;
    writer(JSON.stringify(payload));
};

// Helper function to send in-app notification
const sendInAppNotification = async (userId, title, message, type = "info") => {
    try {
        await Notification.create({
            recipient: userId,
            type,
            title,
            message
        });
    } catch (err) {
        logAuth("error", "Failed to send in-app notification", {
            userId: String(userId),
            type,
            error: err.message,
        });
    }
};

// Register a new user
export const register = catchAsync(async (req, res, next) => {
    const { email, password, collegeId, customCollegeName, firstName, lastName, phone, officialId, role, username } = req.body;

    const assignedRole = role === "college_admin" ? "college_admin" : "student";

    // 1. Uniqueness checks
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already registered" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ success: false, message: "Phone already registered" });

    const existingStaffId = await User.findOne({ officialId });
    if (existingStaffId) return res.status(400).json({ success: false, message: "Staff ID already registered" });

    // 2. Cooling period check
    const blockedUser = await User.findOne({
        email: email.toLowerCase(),
        notMeCoolingUntil: { $gt: Date.now() }
    });
    if (blockedUser) return res.status(400).json({ success: false, message: "Try again after 24 hours" });

    // 3. Student-specific validation
    let resolvedCollegeId = collegeId;
    if (assignedRole === "student") {
        if (!collegeId && !customCollegeName?.trim()) {
            return next(new AppError("Ask your college admin to sign up as an admin first, or enter your college name if not listed.", 400));
        }
    }

    // 4. Create User
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
        username: username || email.split("@")[0] + Math.floor(Math.random() * 1000),
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        college: resolvedCollegeId,
        pendingCollegeName: customCollegeName?.trim() || null,
        firstName,
        lastName,
        phone,
        officialId,
        isVerified: false,
        isApproved: false,
        accountStatus: "pending_verification",
        emailVerificationToken: token,
        emailVerificationExpires: tokenExpiry,
        isActive: false
    });

    await newUser.save();

    // 5. Email logic: Waitlist scenario (student, custom college)
    const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
    const verifyUrl = `${baseUrl}/verify-email/${token}`;
    const reportLink = `${baseUrl}/not-me?email=${encodeURIComponent(newUser.email)}`;

    if (assignedRole === "student" && (!collegeId && customCollegeName?.trim())) {
        // Waitlist: do NOT send verification email, send waitlist info mail instead
        try {
            const tpl = {
                subject: "You're on the waitlist — CampusEventHub",
                html: EmailTemplates.studentPendingAdminReady(firstName).html
            };
            await sendEmail({ email: newUser.email, ...tpl });
        } catch (e) {
            logAuth("error", "Waitlist email failed", {
                email: newUser.email,
                error: e.message,
            });
        }
        return res.status(201).json({
            success: true,
            message: "You are on the waitlist. Ask a college official to sign up as an admin for your college."
        });
    }

    // Default: send verification email
    try {
        const tpl = EmailTemplates.onboarding(firstName, verifyUrl, reportLink);
        await sendEmail({ email: newUser.email, ...tpl });
    } catch (e) {
        logAuth("error", "Registration email failed", {
            email: newUser.email,
            error: e.message,
        });
    }

    if (assignedRole === "student" && collegeId) {
        const activeAdmin = await User.findOne({
            role: "college_admin",
            college: collegeId,
            isApproved: true,
            isActive: true,
            accountStatus: "active"
        });

        if (!activeAdmin) {
            try {
                const tpl = EmailTemplates.studentPendingAdminReady(firstName);
                await sendEmail({ email: newUser.email, ...tpl });
            } catch (e) {
                logAuth("error", "Pending-admin email failed", {
                    email: newUser.email,
                    error: e.message,
                });
            }
        }
    }

    res.status(201).json({
        success: true,
        message: "Check your email inbox to confirm it's you. SuperAdmin will review your application after that."
    });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const sanitizedEmail = email?.trim().toLowerCase();

    if (!email || !password) return next(new AppError("Please provide email and password", 400));

    const user = await User.findOne({ email: sanitizedEmail }).populate("college", "name code");
    if (!user) return next(new AppError("Invalid email or password", 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError("Invalid email or password", 401));

    // Enforce verification chain
    if (!user.isVerified) {
        return res.status(401).json({
            success: false,
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email first. Check your inbox for the confirmation link."
        });
    }

    if (user.accountStatus === "blocked") {
        return res.status(403).json({
            success: false,
            code: "ACCOUNT_BLOCKED",
            message: "This account has been suspended. Contact support for assistance."
        });
    }

    if (user.accountStatus === "rejected") {
        return res.status(401).json({
            success: false,
            code: "ACCOUNT_REJECTED",
            message: `Your account application was rejected. Reason: ${user.rejectionReason || 'Contact support'}`
        });
    }

    if (!user.isApproved) {
        return res.status(401).json({
            success: false,
            code: "PENDING_APPROVAL",
            message: "Your account is under review. You'll get an email once a decision is made."
        });
    }

    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            code: "ACCOUNT_INACTIVE",
            message: "Your account is inactive. Contact support."
        });
    }

    user.lastLogin = new Date();
    await user.save();

    sendToken(user, 200, res);
});

// Logout
export const logout = (req, res) => {
    res.cookie("token", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Verify Email
export const verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        const expiredUser = await User.findOne({ emailVerificationToken: token });
        if (expiredUser) return res.status(400).json({ success: false, message: "expired" });
        return res.status(400).json({ success: false, message: "already_verified" });
    }

    user.isVerified = true;
    user.accountStatus = "pending_approval";
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Notify Admins
    if (user.role === "college_admin") {
        // Notify SuperAdmin
        const superAdmins = await User.find({ role: "admin" });
        for (const sa of superAdmins) {
            await sendInAppNotification(sa._id, "New Admin Signup", `Admin ${user.firstName} from ${user.pendingCollegeName} is waiting for review.`, "USER_SIGNUP");
        }
    } else if (user.role === "student") {
        // Notify College Admin
        const collegeAdmins = await User.find({ role: "college_admin", college: user.college, isApproved: true });
        for (const ca of collegeAdmins) {
            await sendInAppNotification(ca._id, "New Student Signup", `Student ${user.firstName} is waiting for review.`, "USER_SIGNUP");
        }
        // Send pending approval email to student
        try {
            const tpl = EmailTemplates.studentPendingAdminApproval(user.firstName);
            await sendEmail({ email: user.email, ...tpl });
        } catch (e) {
            logAuth("error", "Pending approval email to student failed", {
                email: user.email,
                error: e.message,
            });
        }
    }

    res.status(200).json({
        success: true,
        message: "verified",
        data: { role: user.role }
    });
});

// Report "Not Me"
export const reportNotMe = catchAsync(async (req, res, next) => {
    const { email, reason } = req.body;
    if (!email) return next(new AppError("Email required", 400));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ success: true, message: "cancelled" });

    user.notMeCount = (user.notMeCount || 0) + 1;

    if (user.notMeCount >= 3) {
        user.notMeCoolingUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.accountStatus = "blocked";
        user.isActive = false;
        await user.save();

        const tpl = EmailTemplates.registrationCancelled(user.firstName);
        await sendEmail({ email: user.email, ...tpl });

        return res.status(200).json({ success: true, message: "blocked" });
    } else {
        const firstName = user.firstName;
        const userEmail = user.email;
        await User.findByIdAndDelete(user._id);

        const tpl = EmailTemplates.registrationCancelled(firstName);
        await sendEmail({ email: userEmail, ...tpl });

        return res.status(200).json({ success: true, message: "cancelled" });
    }
});

// Approve User
export const approveUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found", 404));

    if (user.role === "college_admin") {
        if (user.pendingCollegeName && !user.college) {
            const existingCollege = await College.findOne({
                name: { $regex: new RegExp("^" + user.pendingCollegeName.trim() + "$", "i") }
            });

            if (existingCollege) {
                user.college = existingCollege._id;
            } else {
                const uniqueCode = user.pendingCollegeName.split(/\s+/).map(w => w[0]).join('').toUpperCase().substring(0, 4) + Math.floor(1000 + Math.random() * 9000);
                const newCollege = await College.create({
                    name: user.pendingCollegeName.trim(),
                    code: uniqueCode,
                    email: user.email, // Use admin's email as college email for now
                    isActive: true,
                    createdAt: new Date()
                });
                user.college = newCollege._id;
            }
            user.pendingCollegeName = null;
        }
    }

    user.isApproved = true;
    user.isActive = true;
    user.accountStatus = "active";
    await user.save();

    await user.populate("college", "name code");

    // Send Email
    const tpl = EmailTemplates.adminApproved(user.firstName, user.college?.name || "the platform");
    await sendEmail({ email: user.email, ...tpl });

    // In-app Notification
    const notifType = user.role === "college_admin" ? "ADMIN_APPROVE" : "STUDENT_APPROVE";
    await sendInAppNotification(user._id, "Account Approved", "Your account has been approved. You can now log in.", notifType);

    res.status(200).json({ success: true, message: "User approved successfully" });
});

// Reject User
export const rejectUser = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
        return next(new AppError("Please provide a reason for rejection (min 10 characters).", 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    if (user.role === "admin") return next(new AppError("Cannot reject a superadmin account", 403));

    if (user.role === "college_admin") {
        await Event.updateMany(
            { createdBy: user._id },
            { isVisible: false, isApproved: false }
        );
    }

    // Update User Status
    user.accountStatus = "rejected";
    user.isActive = false;
    user.isApproved = false;
    user.rejectionReason = reason.trim();
    await user.save();

    // Send Email
    const tpl = EmailTemplates.adminRejected(user.firstName, reason.trim());
    await sendEmail({ email: user.email, ...tpl });

    // Send Notification
    const notifType = user.role === "college_admin" ? "ADMIN_REJECT" : "STUDENT_REJECT";
    await sendInAppNotification(
        user._id,
        "Application Not Approved",
        "Your application was rejected. Reason: " + reason.trim(),
        notifType
    );

    res.status(200).json({ success: true, message: "User rejected successfully." });
});

// Resend Verification
export const resendVerification = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), isVerified: false });
    if (!user) return res.status(200).json({ success: true, message: "Resent if account exists" });

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const baseUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
    const verifyUrl = `${baseUrl}/verify-email/${token}`;
    const reportLink = `${baseUrl}/not-me?email=${encodeURIComponent(user.email)}`;

    try {
        const tpl = EmailTemplates.onboarding(user.firstName, verifyUrl, reportLink);
        await sendEmail({ email: user.email, ...tpl });
    } catch (e) {
        logAuth("error", "Verification resend email failed", {
            email: user.email,
            error: e.message,
        });
    }

    res.status(200).json({ success: true, message: "Verification link resent." });
});

export const getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.userId).populate("college", "name code email website phone").lean();
    if (!user) return next(new AppError("User not found", 404));

    if (user.role === "student") {
        const registrations = await Registration.find({ user: user._id }).populate("event");
        user.registrations = registrations;
    } else if (user.role === "college_admin") {
        user.createdEvents = await Event.find({ createdBy: user._id });
    }

    res.status(200).json({ success: true, data: { user } });
});

export const updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { firstName, lastName, phone, officialId } = req.body;

    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.officialId = officialId || user.officialId;

    // If sensitive data changed, require re-approval
    if (user.role === "college_admin" && (firstName || lastName || phone || officialId)) {
        user.isApproved = false;
        user.isActive = false;
        user.accountStatus = "pending_approval";
        await Event.updateMany({ createdBy: userId }, { isVisible: false, isApproved: false });
    }

    await user.save();
    res.status(200).json({ success: true, message: "Profile updated", data: { user } });
});

export const getPendingUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({
        role: "college_admin",
        isApproved: false,
        isVerified: true,
        accountStatus: "pending_approval"
    }).populate("college", "name code");
    res.status(200).json({ success: true, data: { users } });
});

export const getPendingStudents = catchAsync(async (req, res, next) => {
    const users = await User.find({
        role: "student",
        college: req.user.college,
        isVerified: true,
        isApproved: false,
        accountStatus: "pending_approval"
    });
    res.status(200).json({ success: true, data: { users } });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({ role: { $ne: "admin" } }).populate("college");
    res.status(200).json({ success: true, data: { users } });
});

export const getAllColleges = catchAsync(async (req, res, next) => {
    const colleges = await College.find();
    res.status(200).json({ success: true, data: { colleges } });
});

/**
 * Create a student directly (Admin/College Admin only)
 */
export const createStudent = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, college: bodyCollegeId, phone, officialId, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError("User with this email already exists", 400));

    let targetCollegeId = bodyCollegeId;
    // If college_admin, force THEIR college
    if (req.userRole === "college_admin") {
        targetCollegeId = req.user.college;
    }

    if (!targetCollegeId && req.userRole !== "admin") {
        return next(new AppError("College ID is required.", 400));
    }

    const newUser = await User.create({
        username: username || email.split("@")[0] + Math.floor(1000 + Math.random() * 9000),
        email: email.toLowerCase(),
        password,
        role: "student",
        college: targetCollegeId,
        firstName,
        lastName,
        phone,
        officialId,
        isVerified: true,
        isApproved: true,
        isActive: true,
        accountStatus: "active"
    });

    res.status(201).json({
        success: true,
        message: "Student account created successfully",
        data: { user: newUser }
    });
});

/**
 * Delete account via verification token (Not Me link)
 */
export const deleteAccountByToken = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
        return res.status(404).json({ success: false, message: "Invalid or expired token" });
    }

    const firstName = user.firstName;
    const email = user.email;

    await User.findByIdAndDelete(user._id);

    try {
        const tpl = EmailTemplates.registrationCancelled(firstName);
        await sendEmail({ email, ...tpl });
    } catch (err) {
        logAuth("error", "Failed to send cancellation email", {
            email,
            error: err.message,
        });
    }

    res.status(200).json({
        success: true,
        message: "Account has been removed as requested."
    });
});
