import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejected_at: {
      type: Date,
      default: null,
    },
    rejected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejection_reason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for better performance
registrationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
registrationSchema.index({ event_id: 1, status: 1 });
registrationSchema.index({ user_id: 1, status: 1 });

// Virtual for registration status display
registrationSchema.virtual("status_display").get(function () {
  const statusMap = {
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
  };
  return statusMap[this.status] || this.status;
});

// Method to approve registration
registrationSchema.methods.approve = function (adminId) {
  this.status = "approved";
  this.approved_at = new Date();
  this.approved_by = adminId;
  return this.save();
};

// Method to reject registration
registrationSchema.methods.reject = function (adminId, reason = null) {
  this.status = "rejected";
  this.rejected_at = new Date();
  this.rejected_by = adminId;
  this.rejection_reason = reason;
  return this.save();
};

// Method to check if registration can be modified
registrationSchema.methods.isModifiable = function () {
  return this.status === "pending";
};

// Pre-save middleware to validate registration constraints
registrationSchema.pre("save", async function (next) {
  // Check if event exists and is accepting registrations
  if (this.isNew) {
    try {
      const Event = mongoose.model("Event");
      const event = await Event.findById(this.event_id);
      
      if (!event) {
        return next(new Error("Event not found"));
      }

      // Check if registration period is valid
      const now = new Date();
      if (now < event.registration_start_date || now > event.registration_end_date) {
        return next(new Error("Registration period is not active"));
      }

      // Check if event has capacity limit
      if (event.max_participants > 0) {
        const approvedCount = await mongoose.model("Registration").countDocuments({
          event_id: this.event_id,
          status: "approved",
        });
        
        if (approvedCount >= event.max_participants) {
          return next(new Error("Event has reached maximum capacity"));
        }
      }

    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get registration statistics
registrationSchema.statics.getStats = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event_id: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
