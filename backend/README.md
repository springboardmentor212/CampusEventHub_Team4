# 🖥 Backend – CampusEventHub API

This directory contains the Node.js + Express backend for CampusEventHub.

It handles:

* Authentication
* Role-based access control
* Event management
* Registration logic
* Feedback system
* Database communication
* Admin logging

---

## 🧱 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Docker

---

## 📂 Folder Structure

```
backend/
│
├── config/          # Database connection setup
├── controllers/     # Route logic
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── middleware/      # Auth & role validation
├── server.js        # Entry point
├── package.json
├── Dockerfile
└── .env             # Not committed to Git
```

---

## 🔐 Environment Variables

This project requires environment variables.

Important:

* Never commit `.env`
* Never expose secrets in README

Example structure (do not commit real values):

```
PORT=5000
MONGO_URI=mongodb://mongo:27017/campuseventhub
JWT_SECRET=your_secure_secret
```

For local development (without Docker), Mongo URI may differ.

---

## 🚀 Running Backend (Local – Without Docker)

From backend folder:

```
npm install
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

## 🐳 Running Backend (With Docker)

From project root:

```
docker compose up --build
```

Backend will run inside container and connect to MongoDB service automatically.

Important:
Mongoose must use:

```
process.env.MONGO_URI
```

Not `localhost` inside Docker.

---

## 🔐 Authentication Architecture

1. User registers
2. Password hashed before save
3. JWT token generated on login
4. Token required for protected routes
5. Middleware validates token
6. Role-based middleware restricts access

Roles supported:

* student
* college_admin
* super_admin

---

## 🧩 Core API Responsibilities

### Authentication

* Register
* Login
* Token validation

### Events

* Create event (admin)
* List events
* Filter events
* Update events
* Delete events

### Registration

* Register for event
* Approve / reject registration
* Manage slots

### Feedback

* Submit rating
* Add comment
* Fetch event feedback

### Admin Logs

* Track administrative actions
* Maintain audit trail

---

## 🛑 Development Rules

* Do not push directly to main
* Always create feature branch
* Raise Pull Request to dev
* Merge only after review
* Keep controllers thin
* Use proper error handling
* Never expose stack traces in production
* Validate request input

---

## 📦 Package Management

All dependencies are managed via:

* package.json
* package-lock.json

Do not delete package-lock.json.

Install new packages carefully and commit both files.

---

## 🧪 Best Practices

* Use async/await
* Centralized error handling
* Use HTTP status codes properly
* Avoid duplicate business logic
* Keep database logic inside models/services
* Never trust client input

---

## 🔍 Logging & Monitoring

Current:

* Console logs

Future improvement:

* Structured logging
* Request tracing
* Admin action logs expansion

---

## 🔒 Security Guidelines

* Hash passwords before storage
* Store JWT secret securely
* Validate user roles
* Restrict admin-only routes
* Never expose raw database errors

---

## 📌 Important

Backend must remain API-only.

No frontend logic should exist here.