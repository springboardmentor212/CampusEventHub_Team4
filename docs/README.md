# 📘 Documentation – CampusEventHub

This directory contains all technical documentation related to system architecture, database design, workflows, and project milestones.

This folder is meant for developers, reviewers, and maintainers.

---

## 📂 Folder Purpose

The `docs/` directory provides:

* System architecture explanation
* Database schema details
* API documentation structure
* Workflow diagrams
* Milestone breakdown
* Future scalability planning

This is the single source of technical truth for the project.

---

## 🏗 System Architecture Overview

CampusEventHub follows a layered architecture:

Client Layer
→ React Frontend (UI)

API Layer
→ Express REST API

Business Logic Layer
→ Controllers & Services

Data Layer
→ MongoDB via Mongoose

Infrastructure Layer
→ Docker container orchestration

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend validates credentials
3. Passwords are hashed before storage
4. JWT token is issued
5. Token is verified for protected routes
6. Role-based access is enforced

Roles:

* student
* college_admin
* super_admin

---

## 🧩 Core Modules

### Module A – Authentication & User Management

* Registration
* Login
* Role assignment
* Secure password handling

### Module B – Event Listing & Registration

* Event creation
* Event filtering
* Event browsing
* Slot registration

### Module C – Event Management Dashboard

* Participant management
* Approve / reject registrations
* View event statistics

### Module D – Community Feedback & Interaction

* Event feedback submission
* Ratings
* Comment discussions
* Admin analytics dashboard

---

## 🗄 Database Design

### Users

* id
* name
* email
* password
* college
* role

### Events

* id
* college_id
* title
* description
* category
* location
* start_date
* end_date
* created_at

### Registrations

* id
* event_id
* user_id
* status
* timestamp

### Feedback

* id
* event_id
* user_id
* rating
* comments
* timestamp

### AdminLogs

* id
* action
* user_id
* timestamp

---

## 🔁 Development Lifecycle

Every feature must follow:

1. Feature branch creation
2. Local development
3. Unit validation
4. Pull Request
5. Code review
6. Merge into dev
7. Periodic merge dev → main

---

## 🧪 Testing Strategy (Planned)

* Manual API validation
* Route-level testing
* Role-based access validation
* Registration edge-case testing
* Feedback submission testing

---

## 📈 Scalability Planning

Future Improvements:

* Pagination for event listings
* Caching for popular events
* Admin analytics dashboard metrics
* Email notifications
* Role-based audit logging

---

## 🛑 Documentation Rules

* Update docs whenever API changes
* Update schema section when DB structure changes
* Do not document secrets
* Keep architecture consistent with implementation

---

## 📌 Important

This folder is not for environment configuration.
It is strictly for technical explanation and architecture design.
