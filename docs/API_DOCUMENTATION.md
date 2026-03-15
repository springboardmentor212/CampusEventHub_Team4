# API Documentation

Base URL: `http://localhost:5000/api`

Auth: JWT token accepted as `Authorization: Bearer [token]` header
or as an HttpOnly cookie named `token` set by the login endpoint.

## Standard Response Shape

Success:
```json
{ "success": true, "message": "optional", "data": {} }
```

Error:
```json
{ "success": false, "message": "error details" }
```

---

## Auth Routes `/api/auth`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| POST | `/auth/register` | No | Anyone | `username, email, password, firstName, lastName, role, college (id or name), phone?, officialId?, academicClass?, section?` | Creates user with `pending_verification` status; sends verification email |
| POST | `/auth/login` | No | Anyone | `email, password` | Returns user object; sets JWT in cookie |
| GET | `/auth/logout` | No | Anyone | — | Clears auth cookie |
| GET | `/auth/verify-email/:token` | No | Anyone | — | Marks email verified; advances `accountStatus` |
| GET | `/auth/delete-account/:token` | No | Anyone | — | Deletes account via tokenized link |
| POST | `/auth/not-me` | No | Anyone | `email` | Reports unrecognized verification email; increments notMeCount |
| POST | `/auth/resend-verification` | No | Anyone | `email` | Re-sends verification email |
| POST | `/auth/request-password-reset` | No | Anyone | `email` | Sends password reset email |
| POST | `/auth/reset-password` | No | Anyone | `token, password` | Resets password with token from email |
| GET | `/auth/profile` | Yes | Any authenticated | — | Returns current user's profile |
| PUT | `/auth/profile` | Yes | Any authenticated | `firstName?, lastName?, phone?, avatar?, officialId?, academicClass?, section?` | Updates profile |
| PATCH | `/auth/profile` | Yes | Any authenticated | Same as PUT | Partial profile update |
| POST | `/auth/change-password` | Yes | Student or Superadmin | `currentPassword, newPassword` | Changes password |
| GET | `/auth/admin/pending-users` | Yes | Superadmin | — | Lists users with `pending_approval` status |
| GET | `/auth/admin/all-users` | Yes | Superadmin | — | Lists all platform users |
| GET | `/auth/admin/all-colleges` | Yes | Superadmin | — | Lists all colleges |
| GET | `/auth/college/pending-students` | Yes | Approved college_admin | — | Lists pending students from own college |
| POST | `/auth/admin/create-student` | Yes | Superadmin or approved college_admin | `username, email, password, firstName, lastName, college, officialId?, academicClass?, section?` | Manually creates a student account |
| PATCH | `/auth/admin/approve-user/:id` | Yes | Superadmin or approved college_admin | `reason?` | Approves a pending user; sends approval email |
| DELETE | `/auth/admin/reject-user/:id` | Yes | Superadmin or approved college_admin | `reason` | Rejects and removes user; sends rejection email |

---

## Event Routes `/api/events`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| GET | `/events` | Optional | Anyone | — | Lists visible events; scoped by college for authenticated users when applicable |
| GET | `/events/:id` | No | Anyone | — | Returns single event by ID |
| POST | `/events/:id/register` | Yes | Student | — | Registers student for event; places on waitlist if full |
| POST | `/events/create` | Yes | Approved college_admin | `title, description, category, location, startDate, endDate, maxParticipants?, participationMode?, isTeamEvent?, audience?, registrationDeadline?, requirements?, dosAndDonts?, bannerImage?` | Creates event; sets `pending_approval` status |
| GET | `/events/my/events` | Yes | Approved college_admin | — | Lists events created by the current admin |
| PATCH | `/events/:id` | Yes | Approved college_admin | Any editable event fields | If event is live, stores changes in `pendingUpdate`; if not yet approved, updates directly |
| PATCH | `/events/:id/cancel` | Yes | Approved college_admin | `reason?` | Cancels event; notifies all registered students |
| PATCH | `/events/:id/pause` | Yes | Approved college_admin | `reason?` | Pauses registration for event |
| PATCH | `/events/:id/resume` | Yes | Approved college_admin | — | Resumes registration for paused event |
| DELETE | `/events/:id` | Yes | Approved college_admin | — | Deletes event; notifies all registered students |
| GET | `/events/admin/pending-events` | Yes | Superadmin | — | Lists events awaiting approval or with pending updates |
| PATCH | `/events/:id/approve` | Yes | Superadmin | — | Approves event or pending update; sets visible to students |
| DELETE | `/events/:id/reject` | Yes | Superadmin | `reason` | Rejects event; notifies college admin with reason |

---

## Registration Routes `/api/registrations`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| GET | `/registrations/my` | Yes | Student | — | Returns current student's registrations |
| GET | `/registrations/my-registrations` | Yes | Student | — | Alias for `/my` |
| POST | `/registrations/register` | Yes | Student | `eventId, customRequirements?` | Registers for an event |
| POST | `/registrations/register/:eventId` | Yes | Student | `customRequirements?` | Registers for an event (eventId in URL) |
| GET | `/registrations/:id` | Yes | Any authenticated | — | Returns single registration by ID |
| DELETE | `/registrations/:id` | Yes | Student | — | Cancels registration |
| DELETE | `/registrations/:id/cancel` | Yes | Student | — | Alias cancel endpoint |
| PATCH | `/registrations/:id/confirm-waitlist` | Yes | Student | — | Confirms waitlist spot within 24h window |
| GET | `/registrations/event/:eventId` | Yes | canManageEvents | — | Lists all registrations for an event |
| GET | `/registrations/event/:eventId/export` | Yes | canManageEvents | — | Exports registrations as downloadable data |
| GET | `/registrations/event/:eventId/waitlist` | Yes | canManageEvents | — | Lists waitlisted registrations for an event |
| GET | `/registrations/stats/:eventId` | Yes | canManageEvents | — | Returns registration statistics for an event |
| PATCH | `/registrations/:id/approve` | Yes | canManageEvents | — | Approves a registration; notifies student |
| PATCH | `/registrations/:id/reject` | Yes | canManageEvents | `reason` | Rejects a registration; notifies student |
| PATCH | `/registrations/:id/attendance` | Yes | canManageEvents | `attended: Boolean` | Marks attendance for a registration |
| GET | `/registrations` | Yes | Superadmin | — | Lists all registrations platform-wide |

`canManageEvents` = Superadmin or approved college_admin who owns the event's college.

---

## College Routes `/api/colleges`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| GET | `/colleges` | No | Anyone | — | Lists active colleges; supports `page`, `limit`, `search` query params |
| GET | `/colleges/:id` | No | Anyone | — | Returns single college by ID |
| GET | `/colleges/:id/has-active-admin` | No | Anyone | — | Returns `{ hasAdmin: Boolean }` |
| POST | `/colleges` | Yes | Superadmin | `name, code, email, phone?, address?, website?, description?, type?, establishedYear?` | Creates a new college |
| PUT | `/colleges/:id` | Yes | Superadmin | `name?, email?, phone?, address?, website?, description?, type?, establishedYear?, isActive?, isVerified?` | Updates college details |

---

## Feedback Routes `/api/feedback`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| POST | `/feedback` | Yes | Student | `eventId, registrationId, rating (1-5), comment` | Submits feedback; one per event per student |
| GET | `/feedback/event/:eventId` | No | Anyone | — | Returns all feedback for an event |
| GET | `/feedback/my` | Yes | Student | — | Returns current student's submitted feedback |
| GET | `/feedback/admin/analytics` | Yes | Superadmin | — | Returns platform-wide feedback analytics |
| GET | `/feedback/college/mine` | Yes | Approved college_admin | — | Returns feedback for the admin's college events |

---

## Comment Routes `/api/comments`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| POST | `/comments` | Yes | Any authenticated | `eventId, message` | Posts a comment on an event |
| GET | `/comments/event/:eventId` | No | Anyone | — | Returns all comments for an event |
| DELETE | `/comments/:id` | Yes | Any authenticated | — | Deletes a comment (own comment only) |

---

## Notification Routes `/api/notifications`

| Method | Path | Auth | Who | Body | Notes |
|--------|------|------|-----|------|-------|
| GET | `/notifications` | Yes | Any authenticated | — | Returns notifications for the current user |
| PATCH | `/notifications/read` | Yes | Any authenticated | `ids?: ObjectId[]` | Marks notifications as read; omit `ids` to mark all |

---

## Dashboard Routes `/api/dashboards`

| Method | Path | Auth | Who | Notes |
|--------|------|------|-----|-------|
| GET | `/dashboards/super-admin` | Yes | Superadmin | Platform-wide stats: total users, events, registrations, colleges |
| GET | `/dashboards/college-admin` | Yes | Approved college_admin | Own college stats: events, registrations, students |
| GET | `/dashboards/student` | Yes | Student | Personal stats: registrations, attended events, feedback |
| GET | `/dashboards/analytics` | Yes | Superadmin or approved college_admin | Analytics data with charts; superadmin sees all, college_admin sees own college |

