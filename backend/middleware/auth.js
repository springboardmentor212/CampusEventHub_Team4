import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Middleware to authenticate user
export const authenticate = catchAsync(async (req, res, next) => {
  // Cookie-only auth path.
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // 2) Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // 4) Check if user is active
    if (!user.isActive) {
      return next(new AppError("Account deactivated. Please contact support.", 401));
    }

    // 5) Check if user is approved — students must wait for college admin approval
    const isProfileRoute = req.originalUrl.endsWith("/profile");
    if (user.role === "student" && !user.isApproved && !isProfileRoute) {
      return next(new AppError("Your account is awaiting approval by the College Administrator.", 403));
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token.", 401));
  }
});

// Middleware to authorize based on role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

// Role specific middlewares with strict authority
export const isStudent = (req, res, next) => {
  if (req.userRole !== "student") {
    return next(new AppError("Authority Denied: Only students can register for events.", 403));
  }
  next();
};

export const isApprovedCollegeAdmin = (req, res, next) => {
  if (req.userRole !== "college_admin") {
    return next(new AppError("Authority Denied: College Admin role required.", 403));
  }
  if (!req.user || !req.user.isApproved) {
    return next(new AppError("Authority Denied: Your College Admin account is not yet approved.", 403));
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return next(new AppError("Authority Denied: Only the SuperAdmin can perform this action.", 403));
  }
  next();
};

export const isSuperAdminOrCollegeAdmin = (req, res, next) => {
  if (req.userRole === 'admin') return next();
  if (req.userRole === 'college_admin' && req.user?.isApproved) return next();
  return res.status(403).json({ success: false, message: 'Access denied' });
};

// Soft auth: populates req.user if a valid token is present, but does not block unauthenticated requests.
export const optionalAuthenticate = async (req, res, next) => {
  let token;
  if (req.header("Authorization")?.startsWith("Bearer")) {
    token = req.header("Authorization").split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user && user.isActive) {
      req.userId = user._id;
      req.userRole = user.role;
      req.user = user;
    }
  } catch (err) {
    // Invalid/expired token — proceed without auth
  }
  next();
};

export const canManageEvents = (req, res, next) => {
  if (req.userRole === "college_admin" && req.user.isApproved) {
    return next();
  }
  return next(new AppError("Authority Denied: Approved College Admin permissions required.", 403));
};

// Middleware to check if user owns the resource or is admin
export const isOwnerOrAdmin = (resourceUserIdField = "userId") => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (req.userId.toString() === resourceUserId || ["college_admin", "admin"].includes(req.userRole)) {
      return next();
    }

    return next(new AppError("Access denied. You can only access your own resources or need admin privileges.", 403));
  };
};

// Middleware to check if user belongs to the same college (for college admins)
export const sameCollegeOrAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
    return next();
  }

  if (req.userRole === "college_admin") {
    // Supports the canonical :collegeId param and tolerates legacy :id consumers.
    const targetCollegeId = req.params.collegeId || req.params.id || req.body.collegeId;

    if (req.user.college && req.user.college.toString() === targetCollegeId) {
      return next();
    }

    return next(new AppError("Access denied. You can only access resources from your own college.", 403));
  }

  return next(new AppError("Access denied. Admin privileges required.", 403));
};
