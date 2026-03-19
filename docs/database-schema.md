# Database Schema

CampusEventHub uses MongoDB with Mongoose models to support a multi-tenant event and community management workflow. The schema is centered around users, colleges, events, registrations, feedback, comments, and admin activity.

## Core Collections

## 1. User

Represents students, college admins, and superadmins.

Key responsibilities:

- authentication and account status
- tenant association through college
- approval workflow
- profile and role metadata

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | unique username |
| `email` | String | unique email, used for login and verification |
| `password` | String | hashed password |
| `firstName` | String | user first name |
| `lastName` | String | user last name |
| `phone` | String | optional contact number |
| `role` | String | `student`, `college_admin`, or `admin` |
| `college` | ObjectId | reference to `College` |
| `officialId` | String | student or staff identifier |
| `academicClass` | String | student-only class metadata |
| `section` | String | student-only section metadata |
| `isVerified` | Boolean | email verification status |
| `isApproved` | Boolean | admin approval status |
| `isActive` | Boolean | active/inactive account state |
| `isBlocked` | Boolean | moderation block flag |
| `resetPasswordToken` | String | password reset flow |
| `resetPasswordExpires` | Date | password reset expiry |
| `emailVerificationToken` | String | email verification flow |
| `deleteAccountToken` | String | delete-account flow |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

## 2. College

Represents one tenant in the system, such as a college, department, or club community.

Key responsibilities:

- tenant boundary for users and events
- admin eligibility checks
- organizer identity for dashboards and approvals

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | college or community name |
| `code` | String | short identifier where applicable |
| `description` | String | optional tenant description |
| `location` | String | campus or city details |
| `website` | String | optional public URL |
| `isActive` | Boolean | active/inactive tenant |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

## 3. Event

Represents an event created by a college admin and reviewed before public visibility.

Key responsibilities:

- event publishing and staged updates
- capacity and waitlist behavior
- status management for approval, pause, cancel, and completion flows

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | event title |
| `description` | String | main event description |
| `category` | String | event category |
| `location` | String | venue or online location |
| `startDate` | Date | event start |
| `endDate` | Date | event end |
| `registrationDeadline` | Date | optional close date |
| `maxParticipants` | Number | event capacity |
| `currentParticipants` | Number | current count |
| `college` | ObjectId | reference to `College` |
| `createdBy` | ObjectId | reference to `User` |
| `status` | String | lifecycle state such as pending, approved, paused, cancelled |
| `pendingUpdate` | Mixed/Object | staged update payload awaiting review |
| `pauseReason` | String | pause explanation when applicable |
| `bannerImage` | String | Cloudinary or local asset path |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

## 4. Registration

Represents a student's relationship to an event.

Key responsibilities:

- registration and waitlist state
- attendance tracking
- cancellation and promotion flow

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | reference to `Event` |
| `student` | ObjectId | reference to `User` |
| `status` | String | `approved`, `waitlisted`, `cancelled`, `attended`, `no_show`, etc. |
| `registrationDate` | Date | registration timestamp |
| `approvedAt` | Date | approval time when used |
| `attendanceMarkedAt` | Date | attendance update timestamp |
| `waitlistPosition` | Number | queue position when applicable |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

Indexes typically matter here for:

- `event + student`
- `event + status`
- `student + createdAt`

## 5. Feedback

Represents a student's post-event rating and written feedback.

Key responsibilities:

- event quality measurement
- admin review and analytics
- student voice after attendance

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | reference to `Event` |
| `student` | ObjectId | reference to `User` |
| `rating` | Number | numeric rating |
| `comment` | String | written feedback |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

## 6. Comment

Represents discussion under an event.

Key responsibilities:

- event conversation
- replies and official replies
- lightweight moderation and engagement

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `event` | ObjectId | reference to `Event` |
| `author` | ObjectId | reference to `User` |
| `content` | String | comment body |
| `parentComment` | ObjectId | self-reference for replies |
| `isPinned` | Boolean | highlighted discussion |
| `likesCount` | Number | reaction count |
| `likedBy` | Array<ObjectId> | user references for likes |
| `officialReply` | Mixed/Object | admin reply metadata where applicable |
| `createdAt` | Date | timestamps |
| `updatedAt` | Date | timestamps |

## 7. Admin Log

Tracks important system actions performed by administrators.

Key responsibilities:

- moderation traceability
- approval auditing
- platform governance history

Typical fields:

| Field | Type | Notes |
| --- | --- | --- |
| `admin` | ObjectId | reference to `User` |
| `action` | String | action performed |
| `targetType` | String | entity type |
| `targetId` | ObjectId/String | entity identifier |
| `details` | Mixed/Object | structured context |
| `createdAt` | Date | action timestamp |

## Relationships Overview

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

## Operational Notes

- The system is multi-tenant through the `College` relationship.
- Student accounts can exist in pending state before approval.
- Events are not always published immediately; staged edits can wait in `pendingUpdate`.
- Waitlist movement and attendance status are operationally important to downstream feedback and dashboard behavior.

---
Last updated: 2026-03-19
Maintained by: @udaycodespace
---
