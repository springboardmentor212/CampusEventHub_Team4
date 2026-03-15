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
  customCategory: {
    type: String,
    default: "",
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
  participationMode: {
    type: String,
    enum: ["solo", "duo", "trio", "quad"],
    default: "solo",
  },
  isTeamEvent: {
    type: Boolean,
    default: false,
  },
  minTeamSize: {
    type: Number,
    default: 1,
  },
  maxTeamSize: {
    type: Number,
    default: 1,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending_approval", "approved", "rejected", "update_pending", "cancelled", "paused"],
    default: "pending_approval",
  },
  bannerImage: {
    type: String, // Cloudinary URL
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  registrationDeadline: {
    type: Date,
  },
  registrationClosesAt: {
    type: Date,
  },
  requirements: {
    type: [String],
    default: [],
  },
  dosAndDonts: {
    type: [String],
    default: [],
  },
  participationRequirements: [
    {
      label: String,
      fieldType: {
        type: String,
        enum: ["text", "file", "number", "email"],
        default: "text",
      },
      isRequired: {
        type: Boolean,
        default: true,
      },
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  hasPendingUpdate: {
    type: Boolean,
    default: false,
  },
  pendingUpdate: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  lastApprovedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  reminderSent24h: {
    type: Boolean,
    default: false,
  },
  reminderSent1h: {
    type: Boolean,
    default: false,
  },
  pauseReason: {
    type: String,
    default: null,
  },
  audience: {
    type: String,
    enum: ["my_college", "all_colleges"],
    default: "all_colleges",
  },
  isApproved: {
    type: Boolean,
    default: false,
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

// Actions to perform before saving the event
eventSchema.pre("save", async function () {
  this.updatedAt = Date.now();

  // Validation to ensure endDate is after startDate
  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
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
