import { AdminLog } from "../models/AdminLog.js";

/**
 * Logs an administrative action to the database
 * @param {Object} params - Action parameters
 * @param {string} params.action - Enum action name
 * @param {string} params.performedBy - User ID
 * @param {string} params.targetId - Target Object ID (optional)
 * @param {string} params.targetType - Target model name (optional)
 * @param {Object} params.details - Extra data (optional)
 * @param {string} params.ipAddress - Requesting IP (optional)
 */
export const logAdminAction = async ({
    action,
    performedBy,
    targetId,
    targetType,
    details,
    ipAddress
}) => {
    try {
        await AdminLog.create({
            action,
            perfomedBy: performedBy,
            targetId,
            targetType,
            details,
            ipAddress
        });
    } catch (err) {
        console.error("ADMIN_LOG_ERROR:", err.message);
        // Non-blocking error
    }
};
