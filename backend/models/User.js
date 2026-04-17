import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "admin", "college_admin"],
    default: "student",
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: function () {
      return this.role !== "admin" && !this.pendingCollegeName;
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  pendingCollegeName: {
    type: String,
    trim: true,
    default: null,
  },
  officialId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  academicClass: {
    type: String,
    trim: true,
  },
  section: {
    type: String,
    trim: true,
  },
  notMeCount: {
    type: Number,
    default: 0,
  },
  notMeCoolingUntil: {
    type: Date,
    default: null,
  },
  avatar: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  accountStatus: {
    type: String,
    enum: ["pending_verification", "pending_approval", "active", "blocked", "rejected", "deleted"],
    default: "pending_verification",
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  registeredEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field and ensure admin status before saving
// Hash password before saving
userSchema.pre("save", async function () {
  this.updatedAt = Date.now();

  // Handle role-based defaults only on creation
  if (this.isNew) {
    if (this.role === "admin") {
      this.isApproved = true;
      this.isActive = true;
      this.isVerified = true;
      this.accountStatus = "active";
    } else {
      this.isApproved = false;
      this.isActive = false;
      this.isVerified = false;
      this.accountStatus = "pending_verification";
    }
  }

  // Only hash password if it's new or modified
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Method to check if user is college admin
userSchema.methods.isCollegeAdmin = function () {
  return this.role === "college_admin";
};

// Method to check if user is system admin
userSchema.methods.isSystemAdmin = function () {
  return this.role === "admin";
};

// Method to check if user is student
userSchema.methods.isStudent = function () {
  return this.role === "student";
};

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
