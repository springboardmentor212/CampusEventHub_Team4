import cron from "node-cron";
import { Event } from "../models/Event.js";
import { Registration } from "../models/Registration.js";
import sendEmail, { EmailTemplates } from "../utils/emailService.js";
import { notifyUser } from "../utils/notificationService.js";
import { promoteNextWaitlistedRegistration } from "../controllers/registrationController.js";

/**
 * Job 1: Cleanup expired waitlist confirmations
 * Runs every 30 minutes.
 */
export const cleanupExpiredWaitlistConfirmations = async () => {
  const now = new Date();
  
  // Find registrations that are waitlisted and have an expired confirmation deadline
  const expired = await Registration.find({
    status: "waitlisted",
    confirmationDeadline: { $lt: now }
  });

  for (const reg of expired) {
    const eventId = reg.event;
    // Remove the expired registration
    await Registration.findByIdAndDelete(reg._id);
    // Promote the next person
    await promoteNextWaitlistedRegistration(eventId);
    
    console.log(`[JOB] Cleaned up expired waitlist confirmation for User ${reg.user} on Event ${eventId}`);
  }
};

/**
 * Job 2: Send event reminders (24h and 1h)
 * Runs every hour.
 */
export const sendEventReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const next1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);

  // 1. 24h Reminders
  const events24h = await Event.find({
    startDate: { $lte: next24h, $gt: now },
    reminderSent24h: false,
    status: "approved"
  });

  for (const event of events24h) {
    const registrations = await Registration.find({ event: event._id, status: "approved" }).populate("user", "email firstName");
    
    for (const reg of registrations) {
      if (!reg.user) continue;
      const tpl = EmailTemplates.eventReminder(reg.user.firstName, event.title, "24 hours", event.startDate, event.location);
      await sendEmail({ email: reg.user.email, ...tpl }).catch(e => console.error(e));
      
      await notifyUser({
        recipientId: reg.user._id,
        type: "EVENT_ALERT",
        title: "Event Reminder",
        message: `"${event.title}" starts in 24 hours!`,
        link: `/events/${event._id}`
      });
    }
    
    event.reminderSent24h = true;
    await event.save();
  }

  // 2. 1h Reminders
  const events1h = await Event.find({
    startDate: { $lte: next1h, $gt: now },
    reminderSent1h: false,
    status: "approved"
  });

  for (const event of events1h) {
    const registrations = await Registration.find({ event: event._id, status: "approved" }).populate("user", "email firstName");
    
    for (const reg of registrations) {
      if (!reg.user) continue;
      const tpl = EmailTemplates.eventReminder(reg.user.firstName, event.title, "1 hour", event.startDate, event.location);
      await sendEmail({ email: reg.user.email, ...tpl }).catch(e => console.error(e));
      
      await notifyUser({
        recipientId: reg.user._id,
        type: "EVENT_ALERT",
        title: "Event Reminder",
        message: `"${event.title}" starts in 1 hour! Get ready!`,
        link: `/events/${event._id}`
      });
    }
    
    event.reminderSent1h = true;
    await event.save();
  }
};

/**
 * Job 3: Process No-Shows
 * Runs every day at midnight or periodically.
 * Marks "approved" registrations as "no_show" if the event has ended and attendance wasn't marked.
 */
export const processNoShows = async () => {
  const now = new Date();
  
  // Find events that ended in the past and haven't had no-shows processed
  const endedEvents = await Event.find({
    endDate: { $lt: now },
    noShowProcessed: false,
    status: "approved"
  });

  for (const event of endedEvents) {
    // Update all 'approved' (but not 'attended') registrations to 'no_show'
    const result = await Registration.updateMany(
      { event: event._id, status: "approved" },
      { $set: { status: "no_show" } }
    );
    
    event.noShowProcessed = true;
    await event.save();
    
    console.log(`[JOB] Processed ${result.modifiedCount} no-shows for Event ${event.title}`);
  }
};

// Initialize Cron Jobs
export const initJobs = () => {
  // Every 30 minutes: Clean waitlist
  cron.schedule("*/30 * * * *", () => {
    console.log("[CRON] Running Waitlist Cleanup...");
    cleanupExpiredWaitlistConfirmations();
  });

  // Every hour: Send reminders
  cron.schedule("0 * * * *", () => {
    console.log("[CRON] Running Event Reminders...");
    sendEventReminders();
  });

  // Every day at 01:00 AM: Process No-Shows
  cron.schedule("0 1 * * *", () => {
    console.log("[CRON] Running No-Show Processing...");
    processNoShows();
  });

  console.log("Event Cron Jobs Initialized.");
};
