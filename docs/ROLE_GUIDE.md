# Role Guide — CampusEventHub

## The Three Actors

### Superadmin
- DB role value: `admin`
- Route: `/superadmin`
- Created by: seeded directly, no UI signup
- Not associated with any college

**Can:**
- Approve or reject college admin applications with reason
- Approve or reject events before they go live
- Create, edit, deactivate colleges
- View all platform stats (read only)
- View all events (read only, no edit/delete)

**Cannot:**
- Create, edit, or delete events
- Register for events
- Access college admin pages

---

### College Admin
- DB role value: `college_admin`
- Route: `/admin`
- Created by: self-signup via /register
- Requires superadmin approval before any event management

**Can:**
- Create, edit, update, delete own college events
- Events go to superadmin pending queue before going live
- Approve or reject student applications from own college
- Manage registrations for own events
- View own college stats and feedback
- Manually create student accounts for own college

**Cannot:**
- See or touch other colleges events, students, or stats
- Edit college profiles (superadmin only)
- Create events that go live without superadmin approval

---

### Student
- DB role value: `student`
- Route: `/campus-feed`
- Created by: self-signup via /register
- Requires college admin approval before dashboard access

**Can:**
- Browse approved events (own college and other colleges)
- Register for any visible event
- Join waitlist when event is full
- Unregister before event starts (buffer: 24h before)
- Submit feedback after attending (30 day window)
- View and post comments on events

**Cannot:**
- Call any admin management APIs
- Create or edit events
- Sign up if their college has no active admin yet

---

## Approval Chain

```
College Admin:  Register → Email verify → Superadmin approves → Can login
Student:        Register → Email verify → College Admin approves → Can login
```

Neither can log in until the full chain is complete.

---

## Event Lifecycle

```
Admin creates event
  → isApproved: false, isVisible: false
  → Superadmin notified

Superadmin approves
  → isApproved: true, isVisible: true
  → Admin notified, students can now see and register

Admin edits live event
  → Changes stored in pendingUpdate (live data unchanged)
  → Event shows "Update Under Review" to students
  → Superadmin notified

Superadmin approves edit
  → Changes applied to live event
  → All registered students notified of what changed

Superadmin rejects edit
  → pendingUpdate discarded
  → Event reverts to lastApprovedData
  → Admin notified with reason, students not affected

Admin deletes live event
  → All registered students notified
  → All registrations removed
  → Superadmin notified
```

---

## Registration Flow

```
Student registers
  → Event has spots: status "pending"
  → Event is full: status "waitlisted" with position shown

Admin approves registration
  → Student notified by email and in-app
  → Reminders sent 24h and 1h before event

Admin rejects registration
  → Student notified with reason
  → Slot freed, next waitlisted student notified

Student cancels
  → Allowed only before 24h buffer before event start
  → If waitlisted: just deleted, no slot freed
  → If pending/approved: slot freed, next waitlisted notified

Waitlist spot opens
  → First waitlisted student gets 24h confirmation window
  → If confirms: moves to pending for admin approval
  → If ignores: moves to next person, stays on waitlist

After event ends
  → Approved but not attended: auto-marked no_show
  → Attended students can submit feedback within 30 days
```

---

## Email Notifications Sent

| Trigger | Recipient |
|---------|-----------|
| Admin signs up | Admin gets "under review" email |
| Admin email verified | Superadmin notified |
| Admin approved | Admin gets approval email with login link |
| Admin rejected | Admin gets rejection reason email |
| Student signs up and verifies | College admin notified |
| Student approved | Student gets approval email |
| Student rejected | Student gets rejection reason email |
| Event submitted | Superadmin notified |
| Event approved | College admin notified |
| Event rejected | College admin gets reason email |
| Event edited | Superadmin notified |
| Event update approved | All registered students notified of changes |
| Event deleted | All registered students notified |
| Registration approved | Student gets confirmation email |
| Registration rejected | Student gets reason email |
| Waitlist spot opens | Waitlisted student gets 24h window email |
| 24h before event | All approved registrants notified |
| 1h before event | All approved registrants notified |
| Event ends, no attendance | No-show students get feedback request |
