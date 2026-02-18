# 🎓 CampusEventHub

### Inter-College Event Management Platform

---

## 📌 Overview

CampusEventHub is a full-stack MERN application designed to manage inter-college events efficiently.

The platform enables:

* Students to browse and register for events
* College admins to create and manage events
* Real-time registration tracking
* Feedback and interaction system

The system follows a role-based architecture to ensure secure and structured access control.

---

## 🏗 Architecture

Frontend → React (Vite)
Backend → Node.js + Express
Database → MongoDB
Containerization → Docker

---

## 📁 Repository Structure

```
CampusEventHub_Team4/
│
├── frontend/
├── backend/
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

Each folder contains its own detailed README.

---

## 🌿 Branching Strategy (Strict Policy)

main

* Production branch
* Never push directly

dev

* Root development branch
* All feature branches merge here

feature/*

* Individual feature branches
* Example: feature/auth-module

---

## 🚦 Development Workflow

1. Always start from dev:

```
git checkout dev
git pull origin dev
```

2. Create your feature branch:

```
git checkout -b feature/your-feature-name
```

3. Work and commit cleanly.

4. Push branch:

```
git push origin feature/your-feature-name
```

5. Raise Pull Request → merge into dev.

Never commit directly to main.

---

## 🧾 Commit Message Standard

Use structured commit format:

```
feat(auth): implement login controller
fix(events): resolve date validation bug
docs(readme): update setup instructions
refactor(user): optimize password hashing
chore(docker): update container config
```

Avoid vague messages like:

* update
* final
* changes
* done

---

## 🐳 Running with Docker (Recommended)

From project root:

```
docker compose up --build
```

Access:

Frontend → [http://localhost:3000](http://localhost:3000)
Backend → [http://localhost:5000](http://localhost:5000)

---

## 💻 Running Without Docker

Backend:

```
cd backend
npm install
npm run dev
```

Frontend:

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Security Guidelines

* Do NOT commit environment files
* Do NOT expose database credentials
* Do NOT hardcode secrets
* Use environment variables only
* Review PR before merging

---

## 📅 Project Milestones

Milestone 1 → Authentication & Role System
Milestone 2 → Event Creation & Listing
Milestone 3 → Registration & Slot Management
Milestone 4 → Feedback & Admin Analytics
