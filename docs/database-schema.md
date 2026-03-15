# 🗄 Database Schema – CampusEventHub

## Users

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `username` | String | Unique, 3–30 chars |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed |
| `role` | String | `student` \| `college_admin` \| `admin` (superadmin) |
| `college` | ObjectId → College | Required |
| `firstName` | String | Required |
| `lastName` | String | |
| `phone` | String | |
| `officialId` | String | Student/staff ID |
| `academicClass` | String | e.g. "3rd Year" |
| `section` | String | |
| `avatar` | String | URL |
| `isEmailVerified` | Boolean | Default: false |
| `isApproved` | Boolean | College admins require superadmin approval |
| `emailVerificationToken` | String | Temporary token |
| `emailVerificationExpires` | Date | |
| `passwordResetToken` | String | |
| `passwordResetExpires` | Date | |
| `createdAt` | Date | Auto |

---

## Colleges

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, unique |
| `code` | String | Short identifier |
| `email` | String | Official contact |
| `website` | String | |
| `isActive` | Boolean | Default: true |
| `createdAt` | Date | Auto |

---

## Events

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required, max 200 chars |
| `description` | String | Required |
| `category` | String | `sports` \| `hackathon` \| `cultural` \| `workshop` \| `seminar` \| `technical` \| `other` |
| `customCategory` | String | Used when category is `other` |
| `location` | String | Required |
| `visibilityScope` | String | `college_only` (default) \| `all_colleges` |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `college` | ObjectId → College | Required |
| `createdBy` | ObjectId → User | Required |
| `maxParticipants` | Number | null = unlimited |
| `currentParticipants` | Number | Default: 0 |
| `participationMode` | String | `solo` \| `duo` \| `trio` \| `quad` |
| `isTeamEvent` | Boolean | Default: false |
| `minTeamSize` | Number | Default: 1 |
| `maxTeamSize` | Number | Default: 1 |
| `status` | String | `pending` \| `upcoming` \| `ongoing` \| `completed` \| `cancelled` |
| `registrationDeadline` | Date | |
| `requirements` | String | General participation requirements |
| `rules` | String | Event rules |
| `bannerImage` | String | URL (Cloudinary or local `/uploads/`) |
| `isActive` | Boolean | Default: true (soft delete flag) |
| `createdAt` | Date | Auto |

> **`visibilityScope` controls cross-college registration:** `college_only` restricts to the organizing college's students; `all_colleges` opens registration to any college.

---

## Registrations

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `event` | ObjectId → Event | Required |
| `user` | ObjectId → User | Required |
| `college` | ObjectId → College | Required |
| `status` | String | `pending` \| `approved` \| `rejected` \| `attended` \| `no-show` \| `waitlisted` |
| `waitlistPosition` | Number | null when not waitlisted |
| `registrationDate` | Date | Default: now |
| `approvalDate` | Date | |
| `rejectionReason` | String | Populated on rejection |
| `notes` | String | Student-provided notes at registration |
| `approvedBy` | ObjectId → User | |
| `rejectedBy` | ObjectId → User | |
| `rejectedAt` | Date | |
| `customRequirements` | Map\<String\> | Key-value custom field responses |

> Unique index on `(event, user)` prevents duplicate registrations.

---

## Feedback *(Milestone 4 — not yet active)*

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `event` | ObjectId → Event | Required |
| `user` | ObjectId → User | Required |
| `rating` | Number | 1–5 |
| `comments` | String | |
| `createdAt` | Date | Auto |

> Unique index on `(event, user)` prevents duplicate feedback submissions.

---

## AdminLogs

* id
* action
* user_id
* timestamp