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

**Frontend** → React (Vite)

**Backend** → Node.js + Express

**Database** → MongoDB

**Containerization** → Docker

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

## 📚 Project Documentation

CampusEventHub maintains structured technical documentation to support system design clarity, maintainability, and transparent engineering practices.

The `docs/` directory contains the following resources:

| Document | Description |
|---------|-------------|
| [API Documentation](docs/API_DOCUMENTATION.md) | Backend endpoint reference and request/response formats |
| [API Testing Guide](docs/API_TESTING.md) | Example API requests and testing workflow |
| [Architecture](docs/architecture.md) | System architecture and component relationships |
| [Database Schema](docs/database-schema.md) | MongoDB collections and relationships |
| [Workflow Guide](docs/workflow.md) | Development workflow and contribution process |
| [Contributing Guide](docs/CONTRIBUTING.md) | Guidelines for contributing to the project |
| [Engineering Debug Log](docs/ENGINEERING_DEBUG_LOG.md) | Recorded debugging and stabilization events |
| [Pull Request Template](docs/PULL_REQUEST_TEMPLATE.md) | Standard template used for PR submissions |
| [Engineering Templates](docs/templates/DEBUG_ENTRY_TEMPLATE.md) | Reusable template for adding debug/stabilization entries |

This documentation is maintained alongside code changes to keep implementation and engineering context easy to navigate.

---

## 🚀 Getting Started

For local development, you can run the project either with Docker or directly with Node.js.

Local setup (without Docker):

**Backend:**

```
cd backend
npm install
npm run dev

```

**Frontend:**

```
cd frontend
npm install
npm run dev

```

---

## 🐳 Docker

From project root:

```
docker compose up --build

```

Access:

**Frontend** → [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

**Backend** → [http://localhost:5000](https://www.google.com/search?q=http://localhost:5000)

---

## 🚦 Development Workflow

Branching policy:

**main**

* Production branch
* Never push directly

**dev**

* Root development branch
* All feature branches merge here

**feature/**

* Individual feature branches
* Example: feature/auth-module

Recommended flow:

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

5. Raise Pull Request and merge into dev.

Never commit directly to main.

---

## 🧾 Commit Standard

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

## 🔐 Security

* Use `.env.local` for local secrets (preferred over `.env`)
* Generic defaults can be placed in `.env` (but still not committed)
* Review PR before merging to ensure no secrets were accidentally committed

---

## 📅 Project Milestones

**Milestone 1** → Authentication & Role System

**Milestone 2** → Event Creation & Listing

**Milestone 3** → Registration & Slot Management

**Milestone 4** → Feedback & Admin Analytics