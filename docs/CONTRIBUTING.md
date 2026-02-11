# 🤝 Contributing Guidelines – CampusEventHub

This document defines how contributors must work on this repository.

Following these rules ensures stability, collaboration efficiency, and production readiness.

---

## 📌 Branching Strategy

* `main` → Production branch (Protected)
* `dev` → Root development branch
* Feature branches → Created from `dev`

🚫 Never push directly to `main`
🚫 Never commit directly to `dev`

All changes must go through Pull Requests.

---

## 🌿 Branch Naming Convention

Use structured names:

```
feature/<module-name>
fix/<issue-name>
refactor/<area>
docs/<section>
```

Examples:

```
feature/auth-login
feature/event-creation
fix/mongo-connection
docs/readme-update
```

---

## 🔁 Development Workflow

1. Pull latest changes from dev

```
git checkout dev
git pull origin dev
```

2. Create new branch

```
git checkout -b feature/your-feature-name
```

3. Make changes

4. Commit using standard commit format

5. Push branch

```
git push origin feature/your-feature-name
```

6. Raise Pull Request → Target branch: `dev`

---

## 🧠 Commit Message Standard (Required)

Use Conventional Commits:

```
type(scope): short description
```

Types:

* feat
* fix
* refactor
* docs
* chore
* test

Examples:

```
feat(auth): implement student login
fix(events): correct date filtering logic
docs(api): update registration endpoint documentation
```

🚫 Avoid:

```
updated
fixed stuff
changes done
final commit
```

---

## 🔎 Pull Request Rules

Every PR must:

* Be raised to `dev`
* Contain clear description
* Mention module affected
* Be tested locally
* Not break existing features

No direct merges without review.

---

## 🧪 Code Quality Rules

* No hardcoded secrets
* No console logs in production code
* Clean folder structure
* Reusable components
* Proper error handling
* Backend must validate everything

---

## 🔐 Security Rules

* Never commit `.env`
* Never expose database URI
* Never expose JWT secrets
* Do not store tokens insecurely

---

## 🧩 Feature Ownership

Modules:

* Module A → Authentication
* Module B → Event Listing
* Module C → Admin Dashboard
* Module D → Feedback System

Each feature branch must clearly belong to one module.

---

## 🚨 Violations

Direct push to main = Immediate rollback.

---

# 3️⃣ Improve `workflow.md`

Open:

```
docs/workflow.md
```

Replace with:

---

# 🔁 Development Workflow – CampusEventHub

This document defines the official workflow for all contributors.

---

## 🧭 Branch Hierarchy

```
main (protected)
   ↑
dev (root development branch)
   ↑
feature branches
```

---

## 🔄 Complete Flow

1. Clone repository
2. Checkout dev
3. Pull latest code
4. Create feature branch
5. Develop
6. Commit properly
7. Push branch
8. Raise PR to dev
9. Review + Merge
10. Pull latest dev

---

## ❌ What Not To Do

* Do not push to main
* Do not merge without PR
* Do not force push to shared branches
* Do not commit node_modules
* Do not commit .env

---

## 🔄 Keeping Code Updated

Before starting new feature:

```
git checkout dev
git pull origin dev
```

Always branch from updated dev.

---

## 🧱 Merge Strategy

Only squash or merge via PR.

No direct CLI merges into main.

---

# 4️⃣ Improve `api-documentation.md`

Replace with:

---

# 📡 API Documentation – CampusEventHub

Base URL:

```
http://localhost:5000/api
```

---

## 🔐 Authentication

### POST /auth/register

Request:

```
{
  name,
  email,
  password,
  college,
  role
}
```

Response:

```
{
  message,
  token
}
```

---

### POST /auth/login

Request:

```
{
  email,
  password
}
```

Response:

```
{
  token,
  role
}
```

---

## 📅 Events

### POST /events

Create event (Admin only)

### GET /events

List events

### GET /events/:id

Get single event

---

## 📝 Registrations

### POST /registrations

Student registers

### PUT /registrations/:id

Admin approve/reject

---

## 💬 Feedback

### POST /feedback

Submit feedback

### GET /feedback/:eventId

Fetch event feedback

---

# 5️⃣ Improve `database-schema.md`

Replace with:

---

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
