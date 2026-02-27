import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["sports", "hackathon", "cultural", "workshop", "seminar", "technical", "other"],
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: null,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  registrationDeadline: {
    type: Date,
  },
  requirements: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
eventSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Validation to ensure endDate is after startDate
eventSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    const error = new Error("End date must be after start date");
    next(error);
  } else {
    next();
  }
});

// Virtual for event duration in days
eventSchema.virtual("durationDays").get(function () {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if registration is still open
eventSchema.methods.isRegistrationOpen = function () {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
};

// Method to check if event is full
eventSchema.methods.isFull = function () {
  if (this.maxParticipants === null) return false;
  return this.currentParticipants >= this.maxParticipants;
};

export const Event = mongoose.model("Event", eventSchema);
