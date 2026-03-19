# Role Guide

CampusEventHub has three active roles in production: `student`, `college_admin`, and `admin` (superadmin). Each role has a different permission boundary and a different path through the product.

## 1. Student

Students are the primary end users of the platform.

### What students can do

- register an account
- verify their email
- remain pending until approved by a college admin
- browse approved events
- register for events
- join waitlists when events are full
- cancel eligible registrations before cutoff
- track event status from the dashboard
- comment on events where access rules allow
- submit feedback after attendance, subject to platform rules

### Approval flow

1. Student signs up.
2. Student verifies email.
3. Account enters pending state.
4. A college admin approves the account.
5. Student signs in and starts using the platform.

### Special case: no active college admin

If a student's college does not currently have an active admin:

- the student can still register
- the account remains pending
- the frontend shows a warm inline message instead of failing silently
- the backend sends a soft email explaining that approval can continue once a college admin is available

## 2. College Admin

College admins manage one college or community tenant.

### What college admins can do

- register and verify their email
- wait for superadmin approval
- create events
- edit events
- submit events for approval
- pause, resume, or cancel events they manage
- view registrations for their events
- export event registrations
- mark attendance
- review pending students for their college
- view feedback for their tenant
- access the college admin dashboard

### Approval flow

1. College admin signs up.
2. College admin verifies email.
3. Account enters pending state.
4. Superadmin approves the account.
5. College admin signs in and manages their tenant.

## 3. Superadmin

Superadmins operate at the full-platform level.

### What superadmins can do

- create and manage colleges
- approve or reject college admins
- approve or reject events
- view all users and colleges
- inspect registrations across the platform
- access platform analytics and signals
- moderate event operations through admin-level dashboards

## Event Lifecycle

The current event lifecycle is designed to prevent unreviewed content from going live accidentally.

1. A college admin creates an event.
2. The event enters a pending approval flow.
3. A superadmin approves or rejects the event.
4. Once approved, students can discover and register for it.
5. If the event is full, students can be waitlisted.
6. If seats open, waitlist promotion happens automatically.
7. Attendance can be marked after the event.
8. Feedback becomes relevant only for attended participants.

## Registration Rules

- The canonical registration endpoint is `POST /api/registrations/register/:eventId`.
- Students can only manage their own registrations.
- Waitlist movement is automatic.
- Event-specific cancellation rules are enforced in the backend.
- Feedback depends on attendance and event timing rules.

## Dashboard Access

| Role | Main Dashboard |
| --- | --- |
| `student` | student dashboard |
| `college_admin` | college admin dashboard |
| `admin` | superadmin dashboard |

## Current Product Direction

CampusEventHub is now positioned as a multi-tenant event and community management platform with an immediate club-first use case. The first real-world deployment target is GGSA Google Student Club, with room to expand later to additional student clubs, departments, and similar communities.

---
Last updated: 2026-03-19
Maintained by: @udaycodespace
---
