import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "attended", "no_show", "waitlisted", "cancelled"],
      default: "pending",
    },
    waitlistPosition: {
      type: Number,
      default: null,
    },
    confirmationDeadline: {
      type: Date,
      default: null,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    noShowReason: {
      type: String,
      default: null,
    },
    customRequirements: {
      type: Map,
      of: String,
      default: {},
    },
    // MILESTONE 3 FEATURE START
    notes: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    // MILESTONE 3 FEATURE END
  },
  { timestamps: true }
);

// Ensure unique registration (user can't register for the same event twice)
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// MILESTONE 3 FEATURE START
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ user: 1, status: 1 });

registrationSchema.methods.approve = function (adminId) {
  this.status = "approved";
  this.approvalDate = new Date();
  this.approvedBy = adminId || this.approvedBy;
  return this.save();
};

registrationSchema.methods.reject = function (adminId, reason = null) {
  this.status = "rejected";
  this.rejectionReason = reason || this.rejectionReason;
  this.rejectedAt = new Date();
  this.rejectedBy = adminId || this.rejectedBy;
  return this.save();
};

registrationSchema.methods.isModifiable = function () {
  return this.status === "pending";
};

registrationSchema.statics.getStats = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
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
    attended: 0,
    no_show: 0,
    waitlisted: 0,
    cancelled: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};
// MILESTONE 3 FEATURE END

export const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
