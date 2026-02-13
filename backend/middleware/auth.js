import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Middleware to authenticate user
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated. Please contact support.",
      });
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// Middleware to authorize based on role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

// Middleware to check if user is student
export const isStudent = (req, res, next) => {
  if (req.userRole !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This endpoint is for students only.",
    });
  }
  next();
};

// Middleware to check if user is college admin
export const isCollegeAdmin = (req, res, next) => {
  if (req.userRole !== "college_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This endpoint is for college admins only.",
    });
  }
  next();
};

// Middleware to check if user is system admin
export const isSystemAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This endpoint is for system admins only.",
    });
  }
  next();
};

// Middleware to check if user is admin (college admin or system admin)
export const isAdmin = (req, res, next) => {
  if (!["college_admin", "admin"].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. This endpoint is for admins only.",
    });
  }
  next();
};

// Middleware to check if user owns the resource or is admin
export const isOwnerOrAdmin = (resourceUserIdField = "userId") => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Check if user owns the resource or is admin
    if (req.userId.toString() === resourceUserId || ["college_admin", "admin"].includes(req.userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own resources or need admin privileges.",
    });
  };
};

// Middleware to check if user belongs to the same college (for college admins)
export const sameCollegeOrAdmin = (req, res, next) => {
  // System admins can access everything
  if (req.userRole === "admin") {
    return next();
  }

  // College admins can only access resources from their own college
  if (req.userRole === "college_admin") {
    const targetCollegeId = req.params.collegeId || req.body.collegeId;
    
    if (req.user.college.toString() === targetCollegeId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access resources from your own college.",
    });
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
};
