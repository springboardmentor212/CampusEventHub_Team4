import { Notification } from "../models/Notification.js";
import { AdminLog } from "../models/AdminLog.js";
import catchAsync from "../utils/catchAsync.js";

const buildMessage = (type, details) => {
    const map = {
        EVENT_APPROVE: `Event "${details?.title}" was approved`,
        EVENT_CREATE: `New event "${details?.title}" was submitted`,
        EVENT_REJECT: `Event "${details?.title}" was declined`,
        ADMIN_APPROVE: `College Admin "${details?.name}" was approved`,
        ADMIN_REJECT: `College Admin "${details?.name}" was rejected`,
        STUDENT_APPROVE: `Student "${details?.name}" was verified`,
        STUDENT_REJECT: `Student "${details?.name}" was rejected`,
        COLLEGE_CREATE: `Institution "${details?.name}" was onboarded`,
        REGISTRATION_APPROVE: `Registration for "${details?.eventTitle}" was approved`,
        NEW_USER: `User "${details?.name}" signed up`,
    };
    return map[type] || 'Platform activity recorded';
};

export const getMyNotifications = catchAsync(async (req, res) => {
    // If superadmin requesting activity feed
    if (req.query.role === 'admin' && req.user.role === 'admin') {
        const allowedTypes = [
            "EVENT_CREATE", "EVENT_APPROVE", "EVENT_REJECT",
            "EVENT_UPDATE", "ADMIN_APPROVE", "ADMIN_REJECT",
            "STUDENT_APPROVE", "STUDENT_REJECT",
            "COLLEGE_CREATE", "REGISTRATION_APPROVE",
            "REGISTRATION_REJECT"
        ];

        const notifications = await Notification.find({
            $or: [
                { type: { $in: allowedTypes } },
                { recipient: req.userId }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10);

        const messageMap = {
            EVENT_CREATE: "New event submitted for review",
            EVENT_APPROVE: "An event was approved and is now live",
            EVENT_REJECT: "An event was rejected",
            EVENT_UPDATE: "An event update is pending review",
            ADMIN_APPROVE: "A college admin was approved",
            ADMIN_REJECT: "A college admin application was rejected",
            STUDENT_APPROVE: "A student account was approved",
            STUDENT_REJECT: "A student application was rejected",
            COLLEGE_CREATE: "A new college was added",
            REGISTRATION_APPROVE: "A student registration was approved",
            REGISTRATION_REJECT: "A student registration was rejected",
        };

        const mappedNotifications = notifications.map(n => {
            const type = n.type;
            let displayMessage = messageMap[type] || n.message || "Platform activity";

            let icon = "*";
            if (type.includes("APPROVE")) icon = "OK";
            else if (type.includes("REJECT")) icon = "X";
            else if (type.includes("CREATE")) icon = "+";
            else if (type.includes("UPDATE")) icon = "~";
            else if (type.includes("COLLEGE")) icon = "C";

            return {
                _id: n._id,
                type: n.type,
                displayMessage,
                icon,
                createdAt: n.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            data: { notifications: mappedNotifications }
        });
    }

    const notifications = await Notification.find({ recipient: req.userId })
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        data: { notifications }
    });
});

export const markAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: "All notifications marked as read"
    });
});
