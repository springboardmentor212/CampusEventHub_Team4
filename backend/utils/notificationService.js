import { Notification } from "../models/Notification.js";
import sendEmail from "./emailService.js";

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
        // 1. Create In-App Notification
        await Notification.create({
            recipient: recipientId,
            type,
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
