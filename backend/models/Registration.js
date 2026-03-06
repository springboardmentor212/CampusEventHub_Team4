import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
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
        enum: ["pending", "approved", "rejected", "attended", "no-show"],
        default: "pending",
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
    customRequirements: {
        type: Map,
        of: String,
        default: {},
    },
}, { timestamps: true });

// Ensure unique registration (user can't register for the same event twice)
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);
