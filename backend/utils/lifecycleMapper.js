/**
 * Lifecycle Normalization Layer
 *
 * Maps the current internal status enum to a normalized UI-facing lifecycle state.
 * This is a non-destructive translation layer — the database enum is NOT changed.
 *
 * Current internal enum (DB):
 *   pending_approval | approved | rejected | update_pending | paused | cancelled
 *
 * Target normalized lifecycle (UI/API surface):
 *   pending | approved | active | completed | cancelled | archived
 *
 * Derivation rules:
 *   - "active" is derived from approved + (startDate <= now <= endDate)
 *   - "completed" is derived from approved + (endDate < now)
 *   - "archived" maps to paused or explicitly archived events from the past
 *   - update_pending surfaces as "approved" with an `hasPendingUpdate` flag
 */

const STATUS_MAP = {
  pending_approval: "pending",
  approved: "approved",
  rejected: "rejected",
  update_pending: "approved", // update_pending is an edit-in-review overlay on an approved event
  paused: "archived",
  cancelled: "cancelled",
};

/**
 * Derives the normalized UI lifecycle state for a single event.
 *
 * @param {object} event - Mongoose event document or plain object with status, startDate, endDate
 * @returns {{ uiStatus: string, hasPendingUpdate: boolean, lifecycleLabel: string }}
 */
export function deriveLifecycleState(event) {
  const now = new Date();
  const rawStatus = event.status || "pending_approval";
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;

  let uiStatus = STATUS_MAP[rawStatus] || "pending";
  const hasPendingUpdate = rawStatus === "update_pending";

  // Derive temporal sub-states for approved events
  if (uiStatus === "approved" && start && end) {
    if (end < now) {
      uiStatus = "completed";
    } else if (start <= now && now <= end) {
      uiStatus = "active";
    }
    // start > now → remains "approved" (upcoming)
  }

  const LIFECYCLE_LABELS = {
    pending: "Pending Approval",
    approved: "Approved & Upcoming",
    active: "Live / Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    archived: "Archived",
    rejected: "Rejected",
  };

  return {
    uiStatus,
    hasPendingUpdate,
    lifecycleLabel: LIFECYCLE_LABELS[uiStatus] || uiStatus,
  };
}

/**
 * Enriches a plain event object (or lean Mongoose doc) with derived lifecycle fields.
 * Safe to call on any event — adds fields without mutating the DB document.
 *
 * @param {object} event
 * @returns {object} event with { uiStatus, hasPendingUpdate, lifecycleLabel } appended
 */
export function enrichEventWithLifecycle(event) {
  const lifecycle = deriveLifecycleState(event);
  return {
    ...event,
    ...lifecycle,
  };
}

/**
 * Enriches an array of events with lifecycle state.
 *
 * @param {object[]} events
 * @returns {object[]}
 */
export function enrichEventsWithLifecycle(events) {
  return events.map((event) => {
    const raw = typeof event.toObject === "function" ? event.toObject() : event;
    return enrichEventWithLifecycle(raw);
  });
}
