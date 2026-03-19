# Setup Guide

This guide explains how to run CampusEventHub locally for development.

## Prerequisites

Install the following first:

- Node.js 20 or newer
- npm
- MongoDB local instance or MongoDB Atlas connection
- Git

Optional but useful for full feature coverage:

- SMTP credentials for email verification and password reset
- Cloudinary credentials for hosted image upload

## Project Structure

```text
CampusEventHub/
├── backend/
├── frontend/
├── docs/
└── .github/
```

## 1. Clone the Repository

```bash
git clone <repository-url>
cd CampusEventHub
```

## 2. Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## 3. Environment Variables

Create local `.env` files in both the backend and frontend folders.

### Backend example

File: `backend/.env`

```env
MONGO_URI=mongodb://localhost:27017/campuseventhub
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_secure_secret
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

### Frontend example

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:5555/api
```

Notes:

- Do not commit `.env` files.
- GitHub Actions uses `VITE_API_URL` from repository secrets in CI rather than hardcoding a port.

## 4. Run the Application

### Start backend

From `backend/`:

```bash
npm run dev
```

### Start frontend

From `frontend/`:

```bash
npm run dev
```

## 5. Default Local URLs

- Frontend app: `http://localhost:5173`
- Frontend API target: `http://localhost:5555/api`
- Backend server port: defined by `PORT` in `backend/.env`

If your backend listens on a different port locally, update `VITE_API_URL` to match your backend API origin.

## 6. Available Scripts

### Backend

| Script | Purpose |
| --- | --- |
| `npm run dev` | start backend in development mode |
| `npm start` | start backend in production mode |
| `npm run seed` | seed database |
| `npm test` | run backend unit tests |

### Frontend

| Script | Purpose |
| --- | --- |
| `npm run dev` | start Vite dev server |
| `npm run build` | build production frontend |
| `npm run preview` | preview production build locally |

## 7. Seed Data

The current seed script is focused on initial platform access rather than full demo content.

Run from `backend/`:

```bash
npm run seed
```

Current behavior:

- clears key collections before seeding
- creates a default superadmin account

Current seeded credentials from `seed.js`:

- email: `229x1a2856@gprec.ac.in`
- password: `pass123`

Use the seed command carefully in development because it resets data used by the script.

## 8. Recommended First Checks

After starting the app locally:

1. Open the frontend.
2. Register a test account.
3. Verify email flow if SMTP is configured.
4. Confirm login works.
5. Confirm API requests are reaching the expected backend base URL.

## 9. Troubleshooting

### Frontend cannot reach API

- confirm `frontend/.env` has the correct `VITE_API_URL`
- restart the Vite server after changing env values
- confirm backend is running

### Emails are not sending

- verify SMTP credentials
- check `EMAIL_FROM`, host, port, and password values

### Images do not upload

- verify Cloudinary credentials
- confirm the backend has access to those env values

### Authentication issues

- check backend JWT secret
- confirm cookie behavior matches your local frontend/backend origin setup

---
Last updated: 2026-03-19
Maintained by: @udaycodespace
---
