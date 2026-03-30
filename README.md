<div align="center" style="
  padding: 80px 0;
  margin-bottom: 50px;
">
  <img src="./frontend/src/assets/logo.png"
       width="380"
       style="
         display: block;
         margin: 0 auto;
         filter: drop-shadow(0 25px 60px rgba(0,0,0,0.22));
       "
       alt="CampusEventHub Logo"/>

</div>

<p>Most college event systems are a WhatsApp forward and a Google Form. We built something better.</p>

<p>
  <img src="https://img.shields.io/badge/MERN%20Stack-Full%20Stack-20232A?style=for-the-badge&logo=mongodb&logoColor=4DB33D" />
  <img src="https://img.shields.io/badge/Infosys%20Springboard-Internship%206-0066CC?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8" />
  <img src="https://img.shields.io/badge/Node.js-215732?style=flat-square&logo=node.js&logoColor=68A063" />
  <img src="https://img.shields.io/badge/Express-111111?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-013220?style=flat-square&logo=mongodb&logoColor=4DB33D" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Nodemailer-EA4335?style=flat-square&logo=gmail&logoColor=white" />
</p>

</div>

---

## 📚 Table of Contents

<samp>

1. [📖 About](#-about)
2. [✨ Features](#-features)
3. [🎭 Roles & Permissions](#-roles--permissions)
4. [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
5. [📂 Folder Structure](#-folder-structure)
6. [🧩 Local Setup](#-local-setup)
7. [🔐 Environment Variables](#-environment-variables)
8. [📡 API Reference](#-api-reference)
9. [🗄️ Database Schema](#%EF%B8%8F-database-schema)
10. [👥 Developers](#-developers)

</samp>

---

## 📖 About

College events are everywhere and organized nowhere. A fest announcement lives in someone's Instagram story. Registration is a Google Form. Attendance is a signature sheet. Nobody knows who showed up, who's waiting, or what actually happened.

**CampusEventHub** fixes that. It's a full-stack, multi-tenant inter-college event platform on the MERN stack — students discover and register for events, college admins publish and manage them, and a superadmin governs the whole thing with approvals, analytics, and audit logs.

Three roles. One platform. No more WhatsApp forwards.

> Built during **Infosys Springboard Internship 6** as a collaborative full-stack project.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **JWT Auth** | HttpOnly cookie-based auth with email verification and password reset |
| 🏫 **Multi-Tenant** | Each college is isolated — its own admins, events, and students |
| 📋 **Event Lifecycle** | Draft → Pending → Approved → Paused / Cancelled with staged update support |
| 🎫 **Waitlist System** | Auto-promotes students when a slot opens up |
| 📊 **Dashboards** | Separate dashboards for students, college admins, and superadmins |
| 💬 **Comments** | Event-level discussion with pinning, likes, and official admin replies |
| ⭐ **Feedback** | Post-attendance ratings with analytics and moderation |
| 📤 **Export** | Download registration data per event |
| 🖼️ **Media Uploads** | Cloudinary-backed banner images |
| 📧 **Email Notifications** | Transactional emails via Nodemailer for verification and approvals |
| 🛡️ **Admin Logs** | Full audit trail for every superadmin and college admin action |

---

## 🎭 Roles & Permissions

```
┌─────────────────────────────────────────────────────────┐
│                      SUPERADMIN                         │
│  Platform governance · College/Admin approvals          │
│  Global event review · Analytics · Audit logs           │
├─────────────────────────────────────────────────────────┤
│                    COLLEGE ADMIN                        │
│  Create & manage events · Approve students              │
│  Track registrations · Mark attendance · View feedback  │
├─────────────────────────────────────────────────────────┤
│                       STUDENT                           │
│  Discover events · Register / Join waitlist             │
│  Track participation · Submit feedback · Comment        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT with HttpOnly cookies |
| **Media** | Cloudinary |
| **Email** | Nodemailer |

---

## 📂 Folder Structure

```
CampusEventHub/
├── frontend/                  # React + Vite + Tailwind CSS
│   ├── public/
│   └── src/
│       ├── api/               # Axios config & API calls
│       ├── assets/            # Images, icons, logo
│       ├── components/        # Reusable UI (Navbar, Cards, Modals, etc.)
│       ├── pages/             # Route-level pages by role
│       ├── context/           # Auth and global state
│       ├── hooks/             # Custom React hooks
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                   # Node.js + Express + MongoDB
│   └── src/
│       ├── config/            # DB connection, Cloudinary config
│       ├── controllers/       # Business logic per feature
│       ├── middleware/         # Auth guard, role check, error handler
│       ├── models/            # Mongoose schemas
│       ├── routes/            # API route definitions
│       └── utils/             # Helpers, email templates
│   └── server.js              # App entry point
│
├── LICENSE
└── README.md
```

---

## 🧩 Local Setup

### ✅ Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) — local or Atlas
- [Git](https://git-scm.com/)

---

### 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/springboardmentor212/CampusEventHub_Team4
cd CampusEventHub
```

---

### 🌿 Step 2 — Create Your Branch

```bash
git checkout -b feature/<your-feature-name>
```

---

### ⚙️ Step 3 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@example.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
APP_NAME=CampusEventHub
APP_VERSION=1.0.0
```

Start the backend:

```bash
npm run dev
```

> ✅ Backend running at `http://localhost:5000`

---

### 🎨 Step 4 — Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

> ✅ Frontend running at `http://localhost:5173`

---

### 🔄 Step 5 — Development Workflow

```bash
git add .
git commit -m "feat: your meaningful commit message"
git push origin feature/<your-feature-name>
```

Open a PR from your feature branch → `dev`.

> ⚠️ Always pull latest `dev` or `main` before starting to avoid merge conflicts.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | Email address |
| `EMAIL_PASS` | Email password / app password |
| `EMAIL_FROM` | Sender display address |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for all API calls |

---

## 📡 API Reference

**Base URL (local):** `http://localhost:5000/api`

### Standard Response Format

```json
// Success
{ "success": true, "message": "...", "data": {} }

// Error
{ "success": false, "message": "Something went wrong" }
```

---

### 🔑 Auth — `/api/auth`

<details>
<summary><b>Public Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register student or college admin |
| `POST` | `/login` | Sign in, sets HttpOnly cookie |
| `GET` | `/logout` | Clear session |
| `GET` | `/verify-email/:token` | Verify account email |
| `POST` | `/resend-verification` | Resend verification email |
| `POST` | `/request-password-reset` | Send password reset email |
| `POST` | `/reset-password` | Reset password via token |

</details>

<details>
<summary><b>Authenticated Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Get current user profile |
| `PUT` | `/profile` | Update profile |
| `PATCH` | `/profile` | Partial update |
| `POST` | `/change-password` | Change password |

</details>

<details>
<summary><b>Admin Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/pending-users` | Pending users for superadmin review |
| `GET` | `/admin/all-users` | All users |
| `PATCH` | `/admin/approve-user/:id` | Approve a user |
| `DELETE` | `/admin/reject-user/:id` | Reject a user |
| `POST` | `/admin/create-student` | Create student as admin |
| `GET` | `/college/pending-students` | Pending students for college admin |

</details>

---

### 🏫 Colleges — `/api/colleges`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all colleges |
| `GET` | `/:id` | Get one college |
| `POST` | `/` | Create a college |
| `PUT` | `/:id` | Update a college |
| `DELETE` | `/:id` | Delete a college |
| `GET` | `/:id/has-active-admin` | Check if college has active admin |
| `GET` | `/:collegeId/users` | List users for a college |

</details>

---

### 📅 Events — `/api/events`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List events |
| `GET` | `/:id` | Get event details |
| `POST` | `/create` | Create event (college admin) |
| `GET` | `/my/events` | Get admin's own events |
| `PATCH` | `/:id` | Update event |
| `PATCH` | `/:id/cancel` | Cancel event |
| `PATCH` | `/:id/pause` | Pause event |
| `PATCH` | `/:id/resume` | Resume paused event |
| `DELETE` | `/:id` | Delete event |
| `GET` | `/admin/pending-events` | Events awaiting superadmin review |
| `PATCH` | `/:id/approve` | Approve event |
| `DELETE` | `/:id/reject` | Reject event |

</details>

---

### 🎫 Registrations — `/api/registrations`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register/:eventId` | Register or join waitlist |
| `GET` | `/my` | Get own registrations |
| `GET` | `/:id` | Get specific registration |
| `PATCH` | `/:id/confirm-waitlist` | Confirm promoted waitlist spot |
| `DELETE` | `/:id` | Cancel registration |
| `GET` | `/event/:eventId` | List all registrations for event |
| `GET` | `/event/:eventId/export` | Export registrations |
| `PATCH` | `/:id/approve` | Approve registration |
| `PATCH` | `/:id/reject` | Reject registration |
| `PATCH` | `/:id/attendance` | Mark attendance |
| `GET` | `/event/:eventId/waitlist` | Get waitlist |
| `GET` | `/stats/:eventId` | Registration stats |

</details>

---

### 💬 Comments — `/api/comments`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Post a comment |
| `GET` | `/event/:eventId` | Get comments for event |
| `PATCH` | `/:id/like` | Like / unlike |
| `PATCH` | `/:id/pin` | Pin / unpin |
| `POST` | `/:id/official-reply` | Add official reply |
| `DELETE` | `/:id` | Delete comment |
| `GET` | `/admin/moderation` | Moderation queue |

</details>

---

### ⭐ Feedback — `/api/feedback`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Submit feedback |
| `GET` | `/event/:eventId` | Get feedback for event |
| `GET` | `/my` | Get own feedback |
| `GET` | `/admin/analytics` | Platform feedback analytics |
| `GET` | `/college/mine` | College admin feedback view |

</details>

---

### 📊 Dashboards — `/api/dashboards`

<details>
<summary><b>Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/student` | Student dashboard |
| `GET` | `/college-admin` | College admin dashboard |
| `GET` | `/super-admin` | Superadmin dashboard |
| `GET` | `/analytics` | Shared analytics |
| `GET` | `/signals` | Platform signal summary |

</details>

---

## 🗄️ Database Schema

### Relationships

```
College
 ├── Users (students + admins)
 └── Events

User
 ├── Registrations
 ├── Feedback
 ├── Comments
 └── AdminLogs

Event
 ├── Registrations
 ├── Feedback
 └── Comments
```

### Collections Overview

<details>
<summary><b>Users</b></summary>

| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique |
| `email` | String | Unique, used for login |
| `password` | String | Hashed |
| `firstName`, `lastName` | String | Display name |
| `role` | String | `student` / `college_admin` / `admin` |
| `college` | ObjectId | Ref → College |
| `isVerified` | Boolean | Email verification |
| `isApproved` | Boolean | Admin approval |
| `isActive` | Boolean | Account state |
| `isBlocked` | Boolean | Moderation flag |

</details>

<details>
<summary><b>Colleges</b></summary>

| Field | Type | Notes |
|---|---|---|
| `name` | String | College name |
| `code` | String | Short identifier |
| `location` | String | Campus/city |
| `isActive` | Boolean | Tenant status |

</details>

<details>
<summary><b>Events</b></summary>

| Field | Type | Notes |
|---|---|---|
| `title`, `description` | String | Event content |
| `category`, `location` | String | Metadata |
| `startDate`, `endDate` | Date | Schedule |
| `maxParticipants` | Number | Capacity |
| `status` | String | Lifecycle state |
| `pendingUpdate` | Mixed | Staged edit payload |
| `college` | ObjectId | Ref → College |
| `bannerImage` | String | Cloudinary path |

</details>

<details>
<summary><b>Registrations</b></summary>

| Field | Type | Notes |
|---|---|---|
| `event` | ObjectId | Ref → Event |
| `student` | ObjectId | Ref → User |
| `status` | String | `approved` / `waitlisted` / `attended` / `cancelled` |
| `waitlistPosition` | Number | Queue position |

</details>

<details>
<summary><b>Comments</b></summary>

| Field | Type | Notes |
|---|---|---|
| `event` | ObjectId | Ref → Event |
| `author` | ObjectId | Ref → User |
| `content` | String | Comment text |
| `parentComment` | ObjectId | Thread / reply ref |
| `isPinned` | Boolean | Highlighted |
| `likesCount` | Number | Reactions |

</details>

<details>
<summary><b>Feedback</b></summary>

| Field | Type | Notes |
|---|---|---|
| `event` | ObjectId | Ref → Event |
| `student` | ObjectId | Ref → User |
| `rating` | Number | Score |
| `comment` | String | Written feedback |

</details>

<details>
<summary><b>AdminLogs</b></summary>

| Field | Type | Notes |
|---|---|---|
| `admin` | ObjectId | Ref → User |
| `action` | String | Action performed |
| `targetType` | String | Entity type |
| `targetId` | ObjectId | Entity ref |
| `details` | Mixed | Structured context |

</details>

---

## 👥 Developers

Built with 💙 during **Infosys Springboard Internship 6**.

| Name | Role | GitHub |
|---|---|---|
| **UDAY** | Frontend Lead · Backend · Architecture · Figma Design | [@udaycodespace](https://github.com/udaycodespace) |
| **Gayatri** | Backend Developer | [@Gayatri-3168](https://github.com/Gayatri-3168) |

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-React%20%2B%20Node.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Powered%20by-MongoDB-013220?style=for-the-badge&logo=mongodb&logoColor=4DB33D"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Built%20at-Infosys%20Springboard-0066CC?style=for-the-badge"/>
</p>