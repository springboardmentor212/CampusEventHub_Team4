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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { background-color: #f9fafb; padding: 48px 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { padding: 40px 40px 20px; text-align: left; border-bottom: 1px solid #f3f4f6; }
    .header h1 { color: #111827; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; text-transform: uppercase; }
    .header p { color: #6b7280; margin: 4px 0 0; font-size: 12px; font-weight: 500; }
    .body { padding: 40px; color: #374151; }
    .body h2 { font-size: 16px; color: #111827; margin: 0 0 16px; font-weight: 600; }
    .body p { line-height: 1.6; font-size: 14px; color: #4b5563; margin-bottom: 16px; }
    .action-row { margin-top: 32px; display: flex; gap: 12px; }
    .btn { display: inline-block; padding: 10px 24px; background: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; transition: background 0.2s ease; }
    .btn-secondary { background: #ffffff; color: #374151 !important; border: 1px solid #d1d5db; }
    .btn-danger { background: #ef4444; color: #ffffff !important; border: none; }
    .footer { text-align: left; padding: 32px 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; background-color: #f9fafb; }
    .footer p { margin: 4px 0; }
    .divider { height: 1px; background-color: #f3f4f6; margin: 32px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>CampusEventHub</h1>
        <p>Institutional Event Management Infrastructure</p>
      </div>
      <div class="body">
        <h2>${title}</h2>
        ${body}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} CampusEventHub Infrastructure</p>
        <p>This is a system-generated transmission. Please contact institutional support for inquiries.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export const EmailTemplates = {
  welcome: (firstName) => ({
    subject: "Account Verified - CampusEventHub",
    html: baseTemplate(
      "Verification Successful",
      `<p>Hello ${firstName}, your account has been successfully verified. You now have full access to discover and participate in institutional events.</p>
       <p>We recommend updating your profile to ensure seamless communication with event organizers.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/login" class="btn">Access Dashboard</a>
       </div>`
    ),
  }),

  registrationReceived: (firstName, eventTitle) => ({
    subject: `Application Received: ${eventTitle}`,
    html: baseTemplate(
      "Application Under Review",
      `<p>Hello ${firstName}, your application for <strong>${eventTitle}</strong> has been logged in our system.</p>
       <p>The event coordinator is currently reviewing your eligibility. You will be notified of the decision shortly.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">Track Application</a>
       </div>`
    ),
  }),

  registrationApproved: (firstName, eventTitle, eventDate) => ({
    subject: `Application Approved: ${eventTitle}`,
    html: baseTemplate(
      "Admission Confirmed",
      `<p>Hello ${firstName}, your application for <strong>${eventTitle}</strong> has been approved.</p>
       <div class="divider"></div>
       <p><strong>Scheduled Date:</strong> ${new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
       <p>Please ensure you have your institutional credentials available for attendance verification.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">View Event Access</a>
       </div>`
    ),
  }),

  registrationRejected: (firstName, eventTitle, reason) => ({
    subject: `Application Decision: ${eventTitle}`,
    html: baseTemplate(
      "Application Status Update",
      `<p>Hello ${firstName}, we have completed the review of your application for <strong>${eventTitle}</strong>.</p>
       <p>Unfortunately, your application was not accepted at this time.</p>
       ${reason ? `<p><strong>Decision Detail:</strong> ${reason}</p>` : ""}
       <div class="divider"></div>
       <p>You may continue to browse other available institutional activities.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">Browse Other Events</a>
       </div>`
    ),
  }),

  eventApproved: (adminName, eventTitle) => ({
    subject: `Event Publication: ${eventTitle}`,
    html: baseTemplate(
      "Publication Status: Live",
      `<p>Hello ${adminName}, your event project <strong>${eventTitle}</strong> has been authorized by the SuperAdmin.</p>
       <p>The project is now live and visible to all eligible participants across the institutional network.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/manage-events" class="btn">Manage Broadcast</a>
       </div>`
    ),
  }),

  onboarding: (firstName, verifyUrl, deleteUrl) => ({
    subject: "Action Required: Verify Your Identity",
    html: baseTemplate(
      "Identity Verification",
      `<p>Hello ${firstName}, an account has been initiated on CampusEventHub using this email address.</p>
       <p>To confirm your identity and complete the registration sequence, please use the verification bridge below.</p>
       <div class="action-row">
         <a href="${verifyUrl}" class="btn">Verify Identity</a>
         <a href="${deleteUrl}" class="btn btn-secondary btn-danger">I Did Not Do This</a>
       </div>
       <p style="margin-top:24px; font-size:12px; color:#9ca3af;">This link expires in 24 hours.</p>`
    ),
  }),

  resendVerification: (firstName, verifyUrl) => ({
    subject: "Security: New Verification Bridge Generated",
    html: baseTemplate(
      "Identity Verification Reset",
      `<p>Hello ${firstName}, a new authentication bridge has been generated for your account.</p>
       <div class="action-row">
         <a href="${verifyUrl}" class="btn">Verify Identity</a>
       </div>
       <p style="margin-top:24px; font-size:12px; color:#9ca3af;">This bridge expires in 24 hours.</p>`
    ),
  }),

  passwordReset: (resetUrl) => ({
    subject: "Security: Password Recovery Sequence",
    html: baseTemplate(
      "Recovery Sequence Initiated",
      `<p>An authentication recovery sequence was initiated for your account.</p>
       <p>Click the secure link below to establish new credentials. This link is operational for 60 minutes.</p>
       <div class="action-row">
         <a href="${resetUrl}" class="btn">Reset Credentials</a>
       </div>`
    ),
  }),

  newCollegeAdminPending: (adminName, collegeName) => ({
    subject: "Action Required: New Administrative Applicant",
    html: baseTemplate(
      "Institutional Admin Request",
      `<p>A new Administrative Applicant, <strong>${adminName}</strong> from <strong>${collegeName}</strong>, has completed identity verification.</p>
       <p>The applicant is now awaiting your final authorization to manage institutional event infrastructure.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/superadmin" class="btn">Authorize Applicant</a>
       </div>`
    ),
  }),

  collegeAdminApproved: (adminName) => ({
    subject: "Authorization Level: Institutional Admin",
    html: baseTemplate(
      "Administrative Privileges Granted",
      `<p>Hello ${adminName}, your application for Administrative access has been authorized by the SuperAdmin.</p>
       <p>You may now proceed to configure institutional event protocols and manage participant applications.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/login" class="btn">Access Terminal</a>
       </div>`
    ),
  }),

  collegeAdminRejected: (adminName, reason) => ({
    subject: "Application Status: Administrative Level",
    html: baseTemplate(
      "Institutional Admin Application",
      `<p>Hello ${adminName}, we have concluded the review of your request for administrative privileges.</p>
       <p>The request has been declined at this time.</p>
       ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ""}
       <p>Your associated account data will be purged from the security protocols.</p>`
    ),
  }),

  newEventPending: (eventTitle, collegeName) => ({
    subject: "Action Required: New Event Publication Request",
    html: baseTemplate(
      "Broadcast Authorization",
      `<p>A new event project, <strong>${eventTitle}</strong>, has been submitted for authorization by <strong>${collegeName}</strong>.</p>
       <p>Review the project specifications to ensure compliance with institutional standards.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/superadmin" class="btn">Review Project</a>
       </div>`
    ),
  }),

  eventRejected: (adminName, eventTitle, reason) => ({
    subject: "Publication Status: Action Required",
    html: baseTemplate(
      "Broadcast Authorization Declined",
      `<p>Hello ${adminName}, the publication request for <strong>${eventTitle}</strong> has been declined.</p>
       ${reason ? `<p><strong>Reviewer Notes:</strong> ${reason}</p>` : ""}
       <div class="divider"></div>
       <p>Please revise the project according to institutional standards and resubmit for review.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/manage-events" class="btn">Revise Project</a>
       </div>`
    ),
  }),

  eventModified: (title, originalTitle) => ({
    subject: `Update: Modifications to ${originalTitle}`,
    html: baseTemplate(
      "Event Configuration Update",
      `<p>There have been critical updates to the configuration of <strong>${originalTitle}</strong> (now: ${title}).</p>
       <p>Please review the updated details and schedule to ensure alignment with your participation.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">Review Changes</a>
       </div>`
    ),
  }),

  eventCancelled: (title) => ({
    subject: `Notice: Cancellation of ${title}`,
    html: baseTemplate(
      "Event Broadcast Terminated",
      `<p>Please be advised that <strong>${title}</strong> has been cancelled by the institutional administration.</p>
       <p>Your participation record has been updated. We apologize for the disruption.</p>
       <div class="action-row">
         <a href="${getBaseUrl()}/student" class="btn">Browse Other Events</a>
       </div>`
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
