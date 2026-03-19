# API Documentation

Base URL (local): `http://localhost:5555/api`

CampusEventHub exposes a REST API for authentication, colleges, events, registrations, comments, feedback, and dashboards. The frontend uses Axios and targets cookie-based authentication as the primary auth flow.

## Authentication

Protected routes require an authenticated user session.

- Primary auth mechanism: JWT in HttpOnly cookie
- Frontend base URL env: `VITE_API_URL`
- Content type: `application/json`

## Response Pattern

Most endpoints follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Error responses typically follow this structure:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

## Authentication Routes

Base path: `/api/auth`

### Public

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

### Authenticated

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Fetch current user profile |
| `PUT` | `/profile` | Update profile |
| `PATCH` | `/profile` | Partial profile update |
| `POST` | `/change-password` | Change password for signed-in user |

### Admin Approval and Management

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/pending-users` | Get pending users for superadmin review |
| `GET` | `/admin/all-users` | Get all users |
| `GET` | `/admin/all-colleges` | Get all colleges |
| `GET` | `/college/pending-students` | Get pending students for a college admin |
| `POST` | `/admin/create-student` | Create a student account as admin |
| `PATCH` | `/admin/approve-user/:id` | Approve a pending user |
| `DELETE` | `/admin/reject-user/:id` | Reject a pending user |

## College Routes

Base path: `/api/colleges`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | List colleges |
| `GET` | `/:id` | Get one college |
| `GET` | `/:id/has-active-admin` | Check whether a college currently has an active admin |
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

## Event Routes

Base path: `/api/events`

### Public and Authenticated Reads

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | List events |
| `GET` | `/:id` | Get full event details |

### College Admin Event Management

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/create` | Create event |
| `GET` | `/my/events` | Get current admin's events |
| `PATCH` | `/:id` | Update event |
| `PATCH` | `/:id/cancel` | Cancel event |
| `PATCH` | `/:id/pause` | Pause event |
| `PATCH` | `/:id/resume` | Resume paused event |
| `DELETE` | `/:id` | Delete event |

### Superadmin Event Review

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/pending-events` | List events awaiting review |
| `PATCH` | `/:id/approve` | Approve event |
| `DELETE` | `/:id/reject` | Reject event |

## Registration Routes

Base path: `/api/registrations`

Canonical registration endpoint:

- `POST /api/registrations/register/:eventId`

### Student

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register/:eventId` | Register for an event or join waitlist |
| `GET` | `/my` | Get current user's registrations |
| `GET` | `/:id` | Get a specific registration |
| `PATCH` | `/:id/confirm-waitlist` | Confirm a promoted waitlist spot |
| `DELETE` | `/:id` | Cancel or remove registration |

### Admin and Superadmin

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

## Comment Routes

Base path: `/api/comments`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/` | Create comment |
| `GET` | `/event/:eventId` | Get comments for event |
| `GET` | `/admin/moderation` | Moderation queue |
| `PATCH` | `/:id/like` | Like or unlike a comment |
| `PATCH` | `/:id/pin` | Pin or unpin a comment |
| `POST` | `/:id/official-reply` | Add official reply |
| `DELETE` | `/:id` | Delete comment |

## Feedback Routes

Base path: `/api/feedback`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/` | Submit event feedback |
| `GET` | `/event/:eventId` | Get feedback for one event |
| `GET` | `/my` | Get current user's feedback |
| `GET` | `/admin/analytics` | Platform feedback analytics |
| `GET` | `/college/mine` | College admin feedback view |

## Dashboard Routes

Base path: `/api/dashboards`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/student` | Student dashboard data |
| `GET` | `/college-admin` | College admin dashboard data |
| `GET` | `/super-admin` | Superadmin dashboard data |
| `GET` | `/analytics` | Shared analytics view |
| `GET` | `/signals` | Platform signal summary |

## Notes

- Student signup remains possible even when a college has no active admin. In that case, the account stays pending until a college admin is available.
- Waitlist promotion is automatic.
- Feedback is limited by attendance and submission rules enforced in the backend.
- Event edits use a staged approval flow rather than applying changes live immediately.

---
Last updated: 2026-03-19
Maintained by: @udaycodespace
---
