import { Notification } from "../models/Notification.js";
import catchAsync from "../utils/catchAsync.js";

export const getMyNotifications = catchAsync(async (req, res) => {
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
