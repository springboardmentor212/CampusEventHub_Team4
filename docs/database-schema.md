# Database Schema - CampusEventHub

This document reflects the current Mongoose models in `backend/models`.

## Users

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `username` | String | Required, unique, 3-30 chars |
| `email` | String | Required, unique, lowercase |
| `password` | String | Required, bcrypt hashed |
| `role` | String | `student` \| `admin` \| `college_admin` |
| `college` | ObjectId -> College | Required for non-admin users unless `pendingCollegeName` is set |
| `pendingCollegeName` | String \| null | Pending college name before mapping to `College` |
| `firstName` | String | Required |
| `lastName` | String | Optional |
| `phone` | String | Optional, unique + sparse |
| `officialId` | String | Optional, unique + sparse |
| `academicClass` | String | Optional |
| `section` | String | Optional |
| `avatar` | String | Default: empty string |
| `isVerified` | Boolean | Default: false |
| `isApproved` | Boolean | Default: false |
| `accountStatus` | String | `pending_verification` \| `pending_approval` \| `active` \| `blocked` \| `rejected` \| `deleted` |
| `rejectionReason` | String \| null | Default: null |
| `emailVerificationToken` | String | Optional |
| `emailVerificationExpires` | Date | Optional |
| `passwordResetToken` | String | Optional |
| `passwordResetExpires` | Date | Optional |
| `notMeCount` | Number | Default: 0 |
| `notMeCoolingUntil` | Date \| null | Default: null |
| `lastLogin` | Date | Optional |
| `isActive` | Boolean | Default: true |
| `registeredEvents` | ObjectId[] -> Event | List of joined events |
| `createdAt` | Date | Default: now |
| `updatedAt` | Date | Default: now (updated in pre-save hook) |

## Colleges

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required, unique |
| `code` | String | Required, unique, uppercase |
| `email` | String | Required, unique, lowercase |
| `phone` | String | Optional |
| `address.street` | String | Optional |
| `address.city` | String | Optional |
| `address.state` | String | Optional |
| `address.country` | String | Default: `India` |
| `address.pincode` | String | Optional |
| `website` | String | Optional |
| `logo` | String | Default: empty string |
| `description` | String | Optional |
| `isActive` | Boolean | Default: true |
| `isVerified` | Boolean | Default: false |
| `establishedYear` | Number | Optional |
| `type` | String | `engineering` \| `medical` \| `arts` \| `commerce` \| `science` \| `university` \| `other` |
| `maxEventsPerMonth` | Number | Default: 10 |
| `createdAt` | Date | Default: now |
| `updatedAt` | Date | Default: now (updated in pre-save hook) |

## Events

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required, max 200 chars |
| `description` | String | Required |
| `category` | String | `sports` \| `hackathon` \| `cultural` \| `workshop` \| `seminar` \| `technical` \| `other` |
| `customCategory` | String | Optional, default empty string |
| `location` | String | Required |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `college` | ObjectId -> College | Required |
| `createdBy` | ObjectId -> User | Required |
| `maxParticipants` | Number \| null | Default: null (unlimited) |
| `currentParticipants` | Number | Default: 0 |
| `participationMode` | String | `solo` \| `duo` \| `trio` \| `quad` |
| `isTeamEvent` | Boolean | Default: false |
| `minTeamSize` | Number | Default: 1 |
| `maxTeamSize` | Number | Default: 1 |
| `status` | String | `pending_approval` \| `approved` \| `rejected` \| `update_pending` \| `cancelled` \| `paused` |
| `bannerImage` | String | Default: empty string |
| `imageUrl` | String | Optional legacy image field |
| `registrationDeadline` | Date | Optional |
| `registrationClosesAt` | Date | Optional |
| `requirements` | String[] | Default: [] |
| `dosAndDonts` | String[] | Default: [] |
| `participationRequirements` | Array<Object> | `{ label, fieldType, isRequired }` |
| `isActive` | Boolean | Default: true |
| `isVisible` | Boolean | Default: false |
| `hasPendingUpdate` | Boolean | Default: false |
| `pendingUpdate` | Mixed \| null | Staged update payload |
| `lastApprovedData` | Mixed \| null | Last approved snapshot |
| `rejectionReason` | String \| null | Default: null |
| `reminderSent24h` | Boolean | Default: false |
| `reminderSent1h` | Boolean | Default: false |
| `noShowProcessed` | Boolean | Default: false, true after no-show job has run |
| `pauseReason` | String \| null | Default: null |
| `audience` | String | `my_college` \| `all_colleges` (default `all_colleges`) |
| `isApproved` | Boolean | Default: false |
| `createdAt` | Date | Default: now |
| `updatedAt` | Date | Default: now (updated in pre-save hook) |

## Registrations

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `event` | ObjectId -> Event | Required |
| `user` | ObjectId -> User | Required |
| `college` | ObjectId -> College | Required |
| `status` | String | `pending` \| `approved` \| `rejected` \| `attended` \| `no_show` \| `waitlisted` \| `cancelled` |
| `waitlistPosition` | Number \| null | Default: null |
| `confirmationDeadline` | Date \| null | Default: null |
| `registrationDate` | Date | Default: now |
| `approvalDate` | Date | Optional |
| `rejectionReason` | String | Optional |
| `noShowReason` | String \| null | Default: null |
| `customRequirements` | Map<String, String> | Default: {} |
| `notes` | String \| null | Default: null |
| `approvedBy` | ObjectId -> User \| null | Default: null |
| `rejectedBy` | ObjectId -> User \| null | Default: null |
| `rejectedAt` | Date \| null | Default: null |
| `createdAt` | Date | From `timestamps: true` |
| `updatedAt` | Date | From `timestamps: true` |

Indexes:

- Unique compound index on `(event, user)` to prevent duplicate registrations.
- Additional indexes on `(event, status)` and `(user, status)`.

## Feedback

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `eventId` | ObjectId -> Event | Required, indexed |
| `userId` | ObjectId -> User | Required, indexed |
| `registrationId` | ObjectId -> Registration | Required |
| `rating` | Number | Required, 1-5 |
| `comment` | String | Required, max 1000 chars |
| `createdAt` | Date | Default: now |
| `updatedAt` | Date | From `timestamps: true` |

Compatibility virtuals:

- `event` -> `eventId`
- `user` -> `userId`
- `comments` -> `comment`

Index:

- Unique compound index on `(eventId, userId)`.

## Comments

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `eventId` | ObjectId -> Event | Required, indexed |
| `userId` | ObjectId -> User | Required, indexed |
| `message` | String | Required, max 2000 chars |
| `createdAt` | Date | From `timestamps: true` |
| `updatedAt` | Date | From `timestamps: true` |

## AdminLogs

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `action` | String | Enum: `EVENT_CREATE`, `EVENT_UPDATE`, `EVENT_DELETE`, `EVENT_APPROVE`, `REGISTRATION_APPROVE`, `REGISTRATION_REJECT`, `USER_ACTIVATE`, `USER_DEACTIVATE`, `COLLEGE_CREATE`, `COLLEGE_UPDATE`, `SYSTEM_ANNOUNCEMENT` |
| `perfomedBy` | ObjectId -> User | Required (spelled as in model) |
| `targetId` | ObjectId | Optional |
| `targetType` | String | `User` \| `Event` \| `College` \| `Registration` |
| `details` | Mixed | Optional metadata |
| `ipAddress` | String | Optional |
| `createdAt` | Date | Default: now |