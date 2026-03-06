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
    body { font-family: 'Segoe UI', sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4F46E5, #9333EA); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; color: #374151; }
    .body h2 { font-size: 20px; color: #111827; margin-bottom: 12px; }
    .body p { line-height: 1.7; font-size: 15px; color: #6B7280; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: linear-gradient(135deg, #4F46E5, #9333EA); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 CampusEventHub</h1>
      <p>Inter-College Event Management Platform</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CampusEventHub &bull; This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>`;

export const EmailTemplates = {
  welcome: (firstName) => ({
    subject: "Welcome to CampusEventHub! 🎓",
    html: baseTemplate(
      `Welcome, ${firstName}!`,
      `<p>We're excited to have you on board. CampusEventHub is your gateway to exciting inter-college events — hackathons, workshops, sports, and more.</p>
       <p>Browse events from colleges across your region and start registering today.</p>
       <a href="${getBaseUrl()}/login" class="btn">Explore Events →</a>`
    ),
  }),

  registrationReceived: (firstName, eventTitle) => ({
    subject: `Registration Received: ${eventTitle}`,
    html: baseTemplate(
      "Registration Received!",
      `<p>Hi <strong>${firstName}</strong>, your registration for <strong>"${eventTitle}"</strong> has been received and is currently <strong>pending approval</strong>.</p>
       <p>You'll receive another notification once the organizer reviews your application.</p>
       <a href="${getBaseUrl()}/student" class="btn">View My Registrations →</a>`
    ),
  }),

  registrationApproved: (firstName, eventTitle, eventDate) => ({
    subject: `You're Confirmed: ${eventTitle} 🎉`,
    html: baseTemplate(
      "You're In! 🎉",
      `<p>Hi <strong>${firstName}</strong>! Great news — your registration for <strong>"${eventTitle}"</strong> has been <span style="color:#16a34a;font-weight:600;">APPROVED</span>.</p>
       <p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
       <p>Make sure to arrive on time and carry your college ID card.</p>
       <a href="${getBaseUrl()}/student" class="btn">View Event Details →</a>`
    ),
  }),

  registrationRejected: (firstName, eventTitle, reason) => ({
    subject: `Registration Update: ${eventTitle}`,
    html: baseTemplate(
      "Registration Not Approved",
      `<p>Hi <strong>${firstName}</strong>, unfortunately your registration for <strong>"${eventTitle}"</strong> was not approved.</p>
       ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
       <p>Don't be discouraged! Browse other upcoming events and apply again.</p>
       <a href="${getBaseUrl()}/student" class="btn">Browse Events →</a>`
    ),
  }),

  eventApproved: (adminName, eventTitle) => ({
    subject: `Event Live: ${eventTitle} ✅`,
    html: baseTemplate(
      "Your Event Is Live!",
      `<p>Hi <strong>${adminName}</strong>, your event <strong>"${eventTitle}"</strong> has been approved by the SuperAdmin and is now <span style="color:#16a34a;font-weight:600;">LIVE</span> on the platform.</p>
       <p>Students can now discover and register for your event.</p>
       <a href="${getBaseUrl()}/manage-events" class="btn">Manage Your Events →</a>`
    ),
  }),

  onboarding: (firstName, verifyUrl, deleteUrl) => ({
    subject: "Welcome to CampusEventHub – Verify Your Email ✉️",
    html: baseTemplate(
      `Hi ${firstName}, confirm your email!`,
      `<p>Welcome to <strong>CampusEventHub</strong> — the inter-college event management platform.</p>
       <p>Please confirm your email address to activate your account and start discovering events.</p>
       <div style="text-align:center; margin: 28px 0; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
         <a href="${verifyUrl}" style="display:inline-block; padding:12px 28px; background:linear-gradient(135deg,#4F46E5,#9333EA); color:white; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
           ✅ Verify Account
         </a>
         <a href="${deleteUrl}" style="display:inline-block; padding:12px 28px; background:#EF4444; color:white; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
           🗑️ I Didn't Sign Up
         </a>
       </div>
       <p style="font-size:13px; color:#9CA3AF;">⏳ This link will expire in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.</p>
       <p style="font-size:13px; color:#9CA3AF;">If you created this account, click <strong>"Verify Account"</strong>. If someone signed up using your email without your permission, click <strong>"I Didn't Sign Up"</strong> to remove the account.</p>`
    ),
  }),

  resendVerification: (firstName, verifyUrl) => ({
    subject: "New Verification Link – CampusEventHub",
    html: baseTemplate(
      `New verification link, ${firstName}`,
      `<p>Here is your new email verification link. The previous one may have expired.</p>
       <a href="${verifyUrl}" class="btn">✅ Verify Account →</a>
       <p style="font-size:13px; color:#9CA3AF; margin-top:16px;">⏳ This link expires in <strong>24 hours</strong>.</p>`
    ),
  }),

  passwordReset: (resetUrl) => ({
    subject: "Password Reset Request – CampusEventHub",
    html: baseTemplate(
      "Reset Your Password",
      `<p>We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
       <p>If you did not make this request, please ignore this email.</p>
       <a href="${resetUrl}" class="btn">Reset Password →</a>`
    ),
  }),

  // --- Admin Action Templates ---
  newCollegeAdminPending: (adminName, collegeName) => ({
    subject: `Pending Approval: New College Admin (${collegeName}) 🚨`,
    html: baseTemplate(
      "New College Admin Request",
      `<p>A new College Admin (<strong>${adminName}</strong>) from <strong>${collegeName}</strong> has verified their email and is awaiting your approval to access the platform.</p>
       <p>Please review and approve or reject this request.</p>
       <a href="${getBaseUrl()}/admin" class="btn">View Pending Requests →</a>`
    ),
  }),

  collegeAdminApproved: (adminName) => ({
    subject: `Account Approved! Welcome to CampusEventHub ✅`,
    html: baseTemplate(
      "Account Approved!",
      `<p>Hi <strong>${adminName}</strong>,</p>
       <p>Great news! The SuperAdmin has <span style="color:#16a34a;font-weight:600;">APPROVED</span> your College Admin account.</p>
       <p>You can now log in and start creating events for your college.</p>
       <a href="${getBaseUrl()}/login" class="btn">Log In Now →</a>`
    ),
  }),

  collegeAdminRejected: (adminName) => ({
    subject: `Account Approval Update ❌`,
    html: baseTemplate(
      "Account Update",
      `<p>Hi <strong>${adminName}</strong>,</p>
       <p>Your request for a College Admin account has unfortunately been <span style="color:#EF4444;font-weight:600;">rejected</span> by the SuperAdmin.</p>
       <p>If you believe this was a mistake, please contact support or your college administration.</p>`
    ),
  }),

  newEventPending: (eventTitle, collegeName) => ({
    subject: `Pending Approval: New Event (${eventTitle}) 🗓️`,
    html: baseTemplate(
      "New Event Awaiting Approval",
      `<p>A new event <strong>"${eventTitle}"</strong> has been created by <strong>${collegeName}</strong> and is pending your approval.</p>
       <p>Review the event details and approve it to make it live for students.</p>
       <a href="${getBaseUrl()}/admin" class="btn">Review Event →</a>`
    ),
  }),

  eventRejected: (adminName, eventTitle) => ({
    subject: `Event Update: ${eventTitle} ❌`,
    html: baseTemplate(
      "Event Not Approved",
      `<p>Hi <strong>${adminName}</strong>,</p>
       <p>Your event <strong>"${eventTitle}"</strong> was <span style="color:#EF4444;font-weight:600;">not approved</span> by the SuperAdmin.</p>
       <p>Please review your event details or contact the SuperAdmin for more information.</p>
       <a href="${getBaseUrl()}/manage-events" class="btn">View My Events →</a>`
    ),
  }),
};

const sendEmail = async ({ email, subject, message, html }) => {
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
