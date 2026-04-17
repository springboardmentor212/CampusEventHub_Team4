import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const getBaseUrl = () => process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";

const baseTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif; background: #f5f5f5; margin: 0; padding: 0; color: #1f2937; }
    .wrapper { padding: 24px 12px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #d1d5db; }
    .header { padding: 18px 20px; border-bottom: 1px solid #e5e7eb; }
    .header h1 { color: #111827; margin: 0; font-size: 14px; font-weight: 600; }
    .header p { color: #6b7280; margin: 2px 0 0; font-size: 12px; }
    .body { padding: 20px; color: #374151; }
    .body h2 { font-size: 16px; color: #111827; margin: 0 0 14px; font-weight: 600; }
    .body p { line-height: 1.5; font-size: 14px; color: #374151; margin: 0 0 12px; }
    .action-row { margin-top: 16px; display: block; }
    .btn { display: inline-block; padding: 8px 14px; background: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; border: 1px solid #111827; }
    .btn-secondary { background: #ffffff; color: #111827 !important; border: 1px solid #d1d5db; margin-left: 8px; }
    .btn-danger { background: #991b1b; color: #ffffff !important; border: 1px solid #991b1b; }
    .footer { text-align: left; padding: 14px 20px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; background-color: #fafafa; }
    .footer p { margin: 4px 0; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 14px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>CampusEventHub</h1>
        <p>Inter-college Event Management Platform</p>
      </div>
      <div class="body">
        <h2>${title}</h2>
        ${body}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} CampusEventHub</p>
        <p>This is an automated email. Please do not reply directly to this message.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export const EmailTemplates = {
  welcome: (firstName) => ({
    subject: "Welcome to CampusEventHub!",
    html: baseTemplate(
      "Account verified",
      `<p>Hi ${firstName}, your account has been successfully verified. You can now explore and register for events happening at your college and beyond.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/login" class="btn">Go to Dashboard</a>
       </div>`
    ),
  }),

  registrationReceived: (firstName, eventTitle) => ({
    subject: `Registration Received: ${eventTitle}`,
    html: baseTemplate(
      "Registration Under Review",
      `<p>Hi ${firstName}, your registration for <strong>${eventTitle}</strong> has been received.</p>
       <p>The event organizer is currently reviewing your request. You'll hear from us soon.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">View My Registrations</a>
       </div>`
    ),
  }),

  registrationApproved: (firstName, eventTitle, eventDate) => ({
    subject: `Registration Approved: ${eventTitle}`,
    html: baseTemplate(
      "Registration Confirmed",
      `<p>Hi ${firstName}, your registration for <strong>${eventTitle}</strong> has been approved!</p>
       <div class="divider"></div>
       <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
       <p>We look forward to seeing you there.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">View Event Details</a>
       </div>`
    ),
  }),

  registrationRejected: (firstName, eventTitle, reason) => ({
    subject: `Application Update: ${eventTitle}`,
    html: baseTemplate(
      "Registration Status Update",
      `<p>Hi ${firstName}, thank you for your interest in <strong>${eventTitle}</strong>.</p>
       <p>Unfortunately, your application was not accepted at this time.</p>
       ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
       <div class="divider"></div>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">Browse More Events</a>
       </div>`
    ),
  }),

  onboarding: (firstName, verifyUrl, reportLink) => ({
    subject: "Confirm your email — CampusEventHub",
    html: baseTemplate(
      "Confirm Your Email",
      `<p>Hi ${firstName},</p>
       <p>Thanks for signing up for CampusEventHub.</p>
       <p>Please confirm your email address by clicking the button below. After confirmation, your account will be reviewed by an admin before you can log in.</p>
       <div class="action-row">
         <a href="${verifyUrl}" class="btn">Confirm Email</a>
         <a href="${reportLink}" class="btn btn-secondary">This wasn't me</a>
       </div>
       <p style="margin-top:24px; font-size:12px; color:#9ca3af;">This link expires in 24 hours.</p>`
    )
  }),

  studentPendingAdminReady: (firstName) => ({
    subject: "You're on the list - CampusEventHub",
    html: baseTemplate(
      "You're on the list",
      `<p>Hi ${firstName},</p>
       <p>Your account has been created and we'll keep your place in line.</p>
       <p>We'll let you know when your college admin is ready to approve student accounts.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/register" class="btn">Open CampusEventHub</a>
       </div>`
    ),
  }),

  resendVerification: (firstName, verifyUrl) => ({
    subject: "Confirm your email — CampusEventHub",
    html: baseTemplate(
      "Verification Required",
      `<p>Hi ${firstName}, please confirm your email address to continue.</p>
       <div class="action-row">
         <a href="${verifyUrl}" class="btn">Confirm Email</a>
       </div>
       <p style="margin-top:24px; font-size:12px; color:#9ca3af;">This link expires in 24 hours.</p>`
    ),
  }),

  passwordReset: (resetUrl) => ({
    subject: "Password Reset Request",
    html: baseTemplate(
      "Reset your password",
      `<p>We received a request to reset the password for your CampusEventHub account.</p>
       <p>Click the link below to set a new password. This link expires in 60 minutes.</p>
       <div class="action-row">
         <a href="${resetUrl}" class="btn">Reset Password</a>
       </div>`
    ),
  }),

  adminApproved: (firstName, collegeName) => ({
    subject: "Approved: You can now log in",
    html: baseTemplate(
      "Application Approved",
      `<p>Hi ${firstName},</p>
       <p>Your application for <strong>${collegeName}</strong> has been approved. You can now log in to access your dashboard.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/login" class="btn">Login Now</a>
       </div>`
    ),
  }),

  adminRejected: (firstName, reason) => ({
    subject: "Application Update",
    html: baseTemplate(
      "Application Not Approved",
      `<p>Hi ${firstName},</p>
       <p>Thank you for your interest in CampusEventHub.</p>
       <p>Unfortunately, your application was not approved at this time.</p>
       <p><strong>Reason:</strong> ${reason}</p>
       <p>You may apply again after resolving the issue mentioned above.</p>`
    ),
  }),

  registrationCancelled: (firstName) => ({
    subject: "Registration Cancelled",
    html: baseTemplate(
      "Registration Cancelled",
      `<p>Hi ${firstName},</p>
       <p>We've received your report, and your registration attempt has been cancelled. Your data has been removed from our system.</p>`
    ),
  }),

  newEventPending: (eventTitle, collegeName) => ({
    subject: `New Event Approval Required: ${eventTitle}`,
    html: baseTemplate(
      "New Event Pending Approval",
      `<p>A new event "<strong>${eventTitle}</strong>" has been created by ${collegeName}.</p>
       <p>Please review the details and approve/reject the event to make it live.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/admin" class="btn">Go to Admin Dashboard</a>
       </div>`
    ),
  }),

  eventApproved: (firstName, eventTitle) => ({
    subject: `Event Approved: ${eventTitle}`,
    html: baseTemplate(
      "Event Approved",
      `<p>Hi ${firstName},</p>
       <p>Good news! Your event "<strong>${eventTitle}</strong>" has been approved and is now live on the platform.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/manage-events" class="btn">Manage Event</a>
       </div>`
    ),
  }),

  eventRejected: (firstName, eventTitle, reason) => ({
    subject: `Event Rejection Notice: ${eventTitle}`,
    html: baseTemplate(
      "Event Not Approved",
      `<p>Hi ${firstName},</p>
       <p>Your event application for "<strong>${eventTitle}</strong>" was not approved.</p>
       <p><strong>Reason:</strong> ${reason}</p>
       <div class="divider"></div>
       <p>You can revise the event details and submit again.</p>`
    ),
  }),

  waitlistAdded: (firstName, eventTitle, position) => ({
    subject: `Waitlist Notification: ${eventTitle}`,
    html: baseTemplate(
      "Added to Waitlist",
      `<p>Hi ${firstName},</p>
       <p>The event "<strong>${eventTitle}</strong>" is currently at full capacity. You've been added to the waitlist.</p>
       <p><strong>Waitlist Position:</strong> #${position}</p>
       <p>We'll notify you immediately if a spot opens up.</p>`
    ),
  }),

  eventReminder: (firstName, eventTitle, timeLabel, eventDate, location) => ({
    subject: `Reminder: ${eventTitle} starts in ${timeLabel}`,
    html: baseTemplate(
      "Event Reminder",
      `<p>Hi ${firstName}, this is a reminder that the event <strong>${eventTitle}</strong> is starting soon.</p>
       <div class="divider"></div>
       <p><strong>Time:</strong> ${timeLabel === "1 hour" ? "In 1 hour" : "Tomorrow"} at ${new Date(eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
       <p><strong>Location:</strong> ${location}</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/events" class="btn">View Details</a>
       </div>`
    ),
  }),
};

const sendEmail = async ({ email, subject, message, html }) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `CampusEventHub <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    text: message || subject,
    html,
  });
};

export default sendEmail;
