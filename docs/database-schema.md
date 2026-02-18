# 🗄 Database Schema – CampusEventHub

## Users

* id
* name
* email (unique)
* password (hashed)
* college
* role
* created_at

---

## Events

* id
* college_id
* title
* description
* category
* location
* start_date
* end_date
* created_at

---

## Registrations

* id
* event_id
* user_id
* status (pending, approved, rejected)
* timestamp

---

## Feedback

* id
* event_id
* user_id
* rating
* comments
* timestamp

---

## AdminLogs

* id
* action
* user_id
* timestamp