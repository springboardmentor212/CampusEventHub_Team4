import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // Null for system notifications
    },
    type: {
        type: String,
        enum: [
            "EVENT_INVITATION",
            "REGISTRATION_STATUS",
            "EVENT_UPDATE",
            "EVENT_REMINDER",
            "ADMIN_ANNOUNCEMENT",
            "ACCOUNT_UPDATE",
            "EVENT_CREATE",
            "EVENT_APPROVE",
            "EVENT_REJECT",
            "ADMIN_APPROVE",
            "ADMIN_REJECT",
            "STUDENT_APPROVE",
            "STUDENT_REJECT",
            "COLLEGE_CREATE",
            "REGISTRATION_APPROVE",
            "REGISTRATION_REJECT",
            "USER_SIGNUP"
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // UI link to redirect user
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
