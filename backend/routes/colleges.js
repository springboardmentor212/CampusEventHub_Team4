import express from "express";
import { College } from "../models/College.js";
import { User } from "../models/User.js";
import { authenticate, isSuperAdmin, sameCollegeOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all colleges (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const colleges = await College.find(query)
      .select("name code email website description type logo phone")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await College.countDocuments(query);
    console.log(`[DEBUG] Fetched ${colleges.length} colleges (Total: ${total})`);

    res.status(200).json({
      success: true,
      data: {
        colleges,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalColleges: total,
        },
      },
    });
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get college by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college || !college.isActive) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        college,
      },
    });
  } catch (error) {
    console.error("Get college error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Check if a college has an active admin
router.get("/:id/has-active-admin", async (req, res) => {
  try {
    const adminExists = await User.exists({
      college: req.params.id,
      role: "college_admin",
      isApproved: true,
      isActive: true,
      accountStatus: "active"
    });

    res.status(200).json({
      success: true,
      hasAdmin: !!adminExists
    });
  } catch (error) {
    console.error("Error checking active admin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create new college (SuperAdmin authority)
router.post("/", authenticate, isSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      phone,
      address,
      website,
      description,
      type,
      establishedYear,
    } = req.body;

    // Validate required fields
    if (!name || !code || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, code, and email",
      });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({
      $or: [{ email }, { code }],
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: "College with this email or code already exists",
      });
    }

    const newCollege = new College({
      name,
      code: code.toUpperCase(),
      email,
      phone,
      address,
      website,
      description,
      type,
      establishedYear,
    });

    await newCollege.save();

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: {
        college: newCollege,
      },
    });
  } catch (error) {
    console.error("Create college error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update college (Management authority)
router.put("/:id", authenticate, isSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      website,
      description,
      type,
      establishedYear,
      isActive,
      isVerified,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (website) updateData.website = website;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (establishedYear) updateData.establishedYear = establishedYear;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const college = await College.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: {
        college,
      },
    });
  } catch (error) {
    console.error("Update college error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete college (SuperAdmin authority)
router.delete("/:id", authenticate, isSuperAdmin, async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Optionally, you might want to deactivate users associated with this college
    await User.updateMany(
      { college: req.params.id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    console.error("Delete college error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get users by college (college admin or system admin)
router.get("/:collegeId/users", authenticate, sameCollegeOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = { college: req.params.collegeId };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -emailVerificationToken -passwordResetToken")
      .populate("college", "name code")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
        },
      },
    });
  } catch (error) {
    console.error("Get college users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
