import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            "EVENT_CREATE",
            "EVENT_UPDATE",
            "EVENT_DELETE",
            "EVENT_APPROVE",
            "REGISTRATION_APPROVE",
            "REGISTRATION_REJECT",
            "USER_ACTIVATE",
            "USER_DEACTIVATE",
            "COLLEGE_CREATE",
            "COLLEGE_UPDATE",
            "SYSTEM_ANNOUNCEMENT"
        ],
    },
    perfomedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Could be any of the models
    },
    targetType: {
        type: String,
        enum: ["User", "Event", "College", "Registration"],
        required: false,
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Stores changes or extra info
    },
    ipAddress: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
