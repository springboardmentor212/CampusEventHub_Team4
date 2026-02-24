import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Middleware to authenticate user
export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token from Header or Cookie
  if (req.header("Authorization")?.startsWith("Bearer")) {
    token = req.header("Authorization").split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

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

// Role specific middlewares
export const isStudent = (req, res, next) => {
  if (req.userRole !== "student") return next(new AppError("Requires student role", 403));
  next();
};

export const isCollegeAdmin = (req, res, next) => {
  if (req.userRole !== "college_admin") return next(new AppError("Requires college admin role", 403));
  next();
};

export const isSystemAdmin = (req, res, next) => {
  if (req.userRole !== "admin") return next(new AppError("Requires admin role", 403));
  next();
};

export const isAdmin = (req, res, next) => {
  if (!["college_admin", "admin"].includes(req.userRole)) return next(new AppError("Requires admin privileges", 403));
  next();
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
    const targetCollegeId = req.params.collegeId || req.body.collegeId;

    if (req.user.college && req.user.college.toString() === targetCollegeId) {
      return next();
    }

    return next(new AppError("Access denied. You can only access resources from your own college.", 403));
  }

  return next(new AppError("Access denied. Admin privileges required.", 403));
};
