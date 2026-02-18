# 🎨 Frontend – CampusEventHub Client

This directory contains the React-based frontend for CampusEventHub.

It provides:

* Authentication UI
* Student dashboard
* Admin dashboard
* Event browsing
* Event creation
* Registration interface
* Feedback system

The frontend communicates with the backend API.

---

## 🧱 Tech Stack

* React (Vite)
* React Router
* Axios
* Docker (production build served via Nginx)

---

## 📂 Folder Structure

```
frontend/
│
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── layouts/         # Layout wrappers
│   ├── services/        # API communication layer
│   ├── context/         # Global state (Auth, etc.)
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
├── Dockerfile
└── vite.config.js
```

---

## 🚀 Running Frontend (Local – Without Docker)

From frontend folder:

```
npm install
npm run dev
```

App will run on:

```
http://localhost:5173
```

Make sure backend is running separately.

---

## 🐳 Running Frontend (With Docker)

From project root:

```
docker compose up --build
```

Frontend will be served via Nginx at:

```
http://localhost:3000
```

---

## 🌐 API Configuration

Frontend should not hardcode backend URLs.

Use environment-based configuration.

Example:

```
VITE_API_BASE_URL=http://localhost:5000
```

Inside code:

```
import.meta.env.VITE_API_BASE_URL
```

Never expose secrets in frontend.

---

## 🔐 Authentication Flow (UI Perspective)

1. User logs in
2. Backend returns JWT
3. Token stored securely (preferably memory or secure storage strategy)
4. Axios attaches token to protected API calls
5. Protected routes check authentication state

---

## 🧭 Routing Structure

Suggested route groups:

Public:

* /
* /login
* /register

Student:

* /dashboard
* /events
* /events/:id

Admin:

* /admin/dashboard
* /admin/events
* /admin/registrations

Use route guards based on role.

---

## 🧩 UI Architecture Rules

* Pages handle layout composition
* Components handle reusable UI
* Services handle API calls
* Context handles authentication state
* No API logic inside components directly

---

## 🎯 UI Principles

* Clean layout
* Clear role separation (student vs admin)
* Simple navigation
* Consistent forms
* Clear error handling
* Loading states
* Proper form validation

---

## 🛑 Development Rules

* Do not push directly to main
* Always branch from dev
* One feature per branch
* Raise PR to dev
* No console logs in production code
* Keep components modular
* Avoid large monolithic files

---

## 📦 Adding Packages

When installing new frontend packages:

```
npm install <package>
```

Commit both:

* package.json
* package-lock.json

---

## 🧪 Testing Responsibility

Every screen must:

* Load correctly
* Handle empty states
* Handle error responses
* Respect role restrictions
* Prevent unauthorized access

---

## 🔒 Security Considerations

* Do not store sensitive secrets
* Never trust client-side role checks
* Backend must enforce permissions
* Avoid exposing internal error messages

---

## 📌 Important

Frontend is presentation-only.

All validation and business logic must be enforced by backend.