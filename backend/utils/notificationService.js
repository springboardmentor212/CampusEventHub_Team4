import { Notification } from "../models/Notification.js";
import sendEmail from "./emailService.js";

const ALLOWED_NOTIFICATION_TYPES = new Set(Notification.schema.path("type")?.enumValues || []);
const LEGACY_NOTIFICATION_TYPE_MAP = {
    EVENT_ALERT: "EVENT_UPDATE",
};

const normalizeNotificationType = (type) => {
    if (!type || typeof type !== "string") {
        return "ACCOUNT_UPDATE";
    }

    const mapped = LEGACY_NOTIFICATION_TYPE_MAP[type] || type;
    if (ALLOWED_NOTIFICATION_TYPES.has(mapped)) {
        return mapped;
    }

    return "ACCOUNT_UPDATE";
};

/**
 * Sends a notification to a user (In-app and optionally Email)
 * @param {Object} params
 * @param {string} params.recipientId - Recipient User ID
 * @param {string} params.type - Enum notification type
 * @param {string} params.title - Title
 * @param {string} params.message - Body content
 * @param {string} params.link - UI link
 * @param {boolean} params.sendEmail - Whether to send a matching email
 */
export const notifyUser = async ({
    recipientId,
    type,
    title,
    message,
    link,
    email, // Email address if sending email
    shouldSendEmail = false
}) => {
    try {
        const normalizedType = normalizeNotificationType(type);

        // 1. Create In-App Notification
        await Notification.create({
            recipient: recipientId,
            type: normalizedType,
            title,
            message,
            link,
        });

        // 2. Send Email if requested
        if (shouldSendEmail && email) {
            await sendEmail({
                email,
                subject: title,
                message,
                html: `<div style="font-family: sans-serif;">
                <h2>${title}</h2>
                <p>${message}</p>
                ${link ? `<a href="${process.env.FRONTEND_URL}${link}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
              </div>`
            });
        }
    } catch (err) {
        console.error("NOTIFICATION_ERROR:", err.message);
    }
};
