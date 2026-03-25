# CampusEventHub

CampusEventHub is a MERN stack inter-college event management platform for publishing, approving, discovering, and managing campus events across multiple colleges.

## What It Does

- Helps students discover events, register for them, and track their participation from one dashboard.
- Gives college admins a structured way to create events, manage registrations, and review student activity for their own college.
- Gives superadmins platform-level control over approvals, colleges, admins, and overall event operations.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT-based auth with HttpOnly cookies |
| Infra / Tooling | Nodemailer, Cloudinary |

## Roles

- **Student**: Discovers events, registers, tracks status, and submits feedback after attending.
- **College Admin**: Creates and manages events for a college, reviews students, and monitors participation.
- **Superadmin**: Oversees the full platform, including college approvals, admin approvals, and event governance.

## Local Setup

### Prerequisites

Make sure you have the following installed:

- Node.js 20 or later
- npm
- MongoDB (local instance or hosted connection string)
- Git

### Clone The Repository

```bash
git clone https://github.com/springboardmentor212/CampusEventHub_Team4
cd CampusEventHub
```

### Environment Setup

Create local environment files based on the example values below:

- `backend/.env`
- `frontend/.env`

### Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Run The Backend

From the `backend` folder:

```bash
npm run dev
```

### Run The Frontend

From the `frontend` folder:

```bash
npm run dev
```

By default, the frontend runs on Vite and the backend runs on the configured Node/Express port from your backend environment file.

## Environment Variables

### Backend

Create `backend/.env` with placeholder values like these:

```env
MONGO_URI=mongodb://localhost:27017/campuseventhub
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_secure_secret
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@example.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
APP_NAME=CampusEventHub
APP_VERSION=1.0.0
```

### Frontend

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5555/api
```

## API Overview

Base URL (local): `http://localhost:5555/api`

CampusEventHub provides a REST API for authentication, colleges, events, registrations, comments, feedback, and dashboards.

### Authentication and Request Basics

- Primary auth mechanism: JWT in HttpOnly cookie
- Frontend API environment variable: `VITE_API_URL`
- Content type: `application/json`

Most successful responses follow:

```json
{
	"success": true,
	"message": "Optional message",
	"data": {}
}
```

Most error responses follow:

```json
{
	"success": false,
	"message": "Something went wrong"
}
```

### Auth APIs (`/api/auth`)

Public endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Register a new student or college admin account |
| `POST` | `/login` | Sign in and establish auth session |
| `GET` | `/logout` | Clear current session |
| `GET` | `/verify-email/:token` | Verify account email |
| `GET` | `/delete-account/:token` | Confirm delete-account flow |
| `POST` | `/not-me` | Report an email verification as unauthorized |
| `POST` | `/resend-verification` | Send a fresh verification email |
| `POST` | `/request-password-reset` | Send password reset email |
| `POST` | `/reset-password` | Reset password using token flow |

Authenticated endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Fetch current user profile |
| `PUT` | `/profile` | Update profile |
| `PATCH` | `/profile` | Partial profile update |
| `POST` | `/change-password` | Change password for signed-in user |

Admin approval and management:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/pending-users` | Get pending users for superadmin review |
| `GET` | `/admin/all-users` | Get all users |
| `GET` | `/admin/all-colleges` | Get all colleges |
| `GET` | `/college/pending-students` | Get pending students for a college admin |
| `POST` | `/admin/create-student` | Create a student account as admin |
| `PATCH` | `/admin/approve-user/:id` | Approve a pending user |
| `DELETE` | `/admin/reject-user/:id` | Reject a pending user |

### College APIs (`/api/colleges`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | List colleges |
| `GET` | `/:id` | Get one college |
| `GET` | `/:id/has-active-admin` | Check whether a college has an active admin |
| `POST` | `/` | Create a college |
| `PUT` | `/:id` | Update a college |
| `DELETE` | `/:id` | Delete a college |
| `GET` | `/:collegeId/users` | List users for a college |

Example `has-active-admin` response:

```json
{
	"success": true,
	"hasAdmin": false
}
```

### Event APIs (`/api/events`)

Public and authenticated reads:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | List events |
| `GET` | `/:id` | Get full event details |

College admin event management:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/create` | Create event |
| `GET` | `/my/events` | Get current admin's events |
| `PATCH` | `/:id` | Update event |
| `PATCH` | `/:id/cancel` | Cancel event |
| `PATCH` | `/:id/pause` | Pause event |
| `PATCH` | `/:id/resume` | Resume paused event |
| `DELETE` | `/:id` | Delete event |

Superadmin event review:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/pending-events` | List events awaiting review |
| `PATCH` | `/:id/approve` | Approve event |
| `DELETE` | `/:id/reject` | Reject event |

### Registration APIs (`/api/registrations`)

Canonical registration endpoint: `POST /api/registrations/register/:eventId`

Student endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register/:eventId` | Register for an event or join waitlist |
| `GET` | `/my` | Get current user's registrations |
| `GET` | `/:id` | Get a specific registration |
| `PATCH` | `/:id/confirm-waitlist` | Confirm a promoted waitlist spot |
| `DELETE` | `/:id` | Cancel or remove registration |

Admin and superadmin endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/event/:eventId` | List registrations for an event |
| `GET` | `/event/:eventId/export` | Export registrations |
| `PATCH` | `/:id/approve` | Approve registration |
| `PATCH` | `/:id/reject` | Reject registration |
| `PATCH` | `/:id/attendance` | Mark attendance |
| `GET` | `/event/:eventId/waitlist` | Get waitlist for event |
| `GET` | `/stats/:eventId` | Registration stats for one event |
| `GET` | `/` | Global registration view for superadmin |

### Comment APIs (`/api/comments`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/` | Create comment |
| `GET` | `/event/:eventId` | Get comments for event |
| `GET` | `/admin/moderation` | Moderation queue |
| `PATCH` | `/:id/like` | Like or unlike a comment |
| `PATCH` | `/:id/pin` | Pin or unpin a comment |
| `POST` | `/:id/official-reply` | Add official reply |
| `DELETE` | `/:id` | Delete comment |

### Feedback APIs (`/api/feedback`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/` | Submit event feedback |
| `GET` | `/event/:eventId` | Get feedback for one event |
| `GET` | `/my` | Get current user's feedback |
| `GET` | `/admin/analytics` | Platform feedback analytics |
| `GET` | `/college/mine` | College admin feedback view |

### Dashboard APIs (`/api/dashboards`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/student` | Student dashboard data |
| `GET` | `/college-admin` | College admin dashboard data |
| `GET` | `/super-admin` | Superadmin dashboard data |
| `GET` | `/analytics` | Shared analytics view |
| `GET` | `/signals` | Platform signal summary |

### API Notes

- Student signup can happen even when a college has no active admin; those accounts stay pending until review.
- Waitlist promotion is automatic.
- Feedback submission is constrained by attendance and duplicate-submission rules.
- Event edits follow a staged approval flow rather than applying immediately.

## Database Schema

CampusEventHub uses MongoDB with Mongoose models for multi-tenant event and community workflows.

### 1. Users Collection

Purpose:

- Authentication and account status
- Role and college association
- Approval and verification workflows

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Unique username |
| `email` | String | Unique email used for login and verification |
| `password` | String | Hashed password |
| `firstName` | String | User first name |
| `lastName` | String | User last name |
| `phone` | String | Optional contact number |
| `role` | String | `student`, `college_admin`, or `admin` |
| `college` | ObjectId | Reference to `College` |
| `officialId` | String | Student/staff identifier |
| `academicClass` | String | Student metadata |
| `section` | String | Student metadata |
| `isVerified` | Boolean | Email verification status |
| `isApproved` | Boolean | Admin approval status |
| `isActive` | Boolean | Active/inactive account state |
| `isBlocked` | Boolean | Moderation block flag |
| `resetPasswordToken` | String | Password reset flow |
| `resetPasswordExpires` | Date | Password reset expiry |
| `emailVerificationToken` | String | Email verification flow |
| `deleteAccountToken` | String | Delete-account flow |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### 2. Colleges Collection

Purpose:

- Tenant boundary for users and events
- Admin eligibility checks
- Organizer identity for dashboards and approvals

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | College or community name |
| `code` | String | Short identifier |
| `description` | String | Optional description |
| `location` | String | Campus/city details |
| `website` | String | Optional public URL |
| `isActive` | Boolean | Active/inactive tenant |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### 3. Events Collection

Purpose:

- Event publishing and staged updates
- Capacity and waitlist handling
- Lifecycle management (pending, approved, paused, cancelled)

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | Event title |
| `description` | String | Event description |
| `category` | String | Event category |
| `location` | String | Venue or online location |
| `startDate` | Date | Event start |
| `endDate` | Date | Event end |
| `registrationDeadline` | Date | Optional close date |
| `maxParticipants` | Number | Capacity |
| `currentParticipants` | Number | Current count |
| `college` | ObjectId | Reference to `College` |
| `createdBy` | ObjectId | Reference to `User` |
| `status` | String | Lifecycle status |
| `pendingUpdate` | Mixed/Object | Staged update payload |
| `pauseReason` | String | Pause explanation |
| `bannerImage` | String | Cloudinary/local asset path |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### 4. Registrations Collection

Purpose:

- Registration and waitlist state tracking
- Attendance status
- Cancellation and promotion flow

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | Reference to `Event` |
| `student` | ObjectId | Reference to `User` |
| `status` | String | `approved`, `waitlisted`, `cancelled`, `attended`, `no_show`, etc. |
| `registrationDate` | Date | Registration timestamp |
| `approvedAt` | Date | Approval time |
| `attendanceMarkedAt` | Date | Attendance update timestamp |
| `waitlistPosition` | Number | Queue position |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Important index patterns:

- `event + student`
- `event + status`
- `student + createdAt`

### 5. Feedback Collection

Purpose:

- Post-event quality measurement
- Analytics and admin review

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | Reference to `Event` |
| `student` | ObjectId | Reference to `User` |
| `rating` | Number | Numeric rating |
| `comment` | String | Written feedback |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### 6. Comments Collection

Purpose:

- Event discussion and replies
- Moderation and engagement

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | Reference to `Event` |
| `author` | ObjectId | Reference to `User` |
| `content` | String | Comment text |
| `parentComment` | ObjectId | Self-reference for replies |
| `isPinned` | Boolean | Highlighted discussion |
| `likesCount` | Number | Reaction count |
| `likedBy` | Array<ObjectId> | User references for likes |
| `officialReply` | Mixed/Object | Admin reply metadata |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

### 7. AdminLogs Collection

Purpose:

- Traceability for approvals and moderation actions
- Governance and audit history

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `admin` | ObjectId | Reference to `User` |
| `action` | String | Action performed |
| `targetType` | String | Entity type |
| `targetId` | ObjectId/String | Entity identifier |
| `details` | Mixed/Object | Structured context |
| `createdAt` | Date | Action timestamp |

### Relationships Overview

```text
College
	├── Users
	└── Events

User
	├── Registrations
	├── Feedback
	├── Comments
	└── AdminLogs

Event
	├── Registrations
	├── Feedback
	└── Comments
```

### Schema Notes

- Multi-tenancy is implemented through the `College` relationship.
- Student accounts can exist in a pending state before approval.
- Events may include staged edits in `pendingUpdate` before becoming live.
- Waitlist movement and attendance states directly affect feedback and dashboard outputs.

## Contributing

This project is part of an internship program. For questions or collaboration reach out to the developers below.

## Developers

- **Uday** ([@udaycodespace](https://github.com/udaycodespace)) — Frontend lead, Backend, Figma design, Architecture
- **Gayatri** ([@Gayatri-3168](https://github.com/Gayatri-3168)) — Backend

## License

This project is licensed under the [MIT License](LICENSE).