# Local Setup Guide

## Prerequisites

- Node.js v18 or higher
- MongoDB running locally on port 27017
- npm
- A Gmail account for email features (optional but recommended)

## Step 1 — Clone and install

```bash
git clone [repo url]
cd CampusEventHub_Team4
cd backend && npm install
cd ../frontend && npm install
```

## Step 2 — Environment files

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campuseventhub
JWT_SECRET=pick_any_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=CampusEventHub <your_gmail@gmail.com>
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Step 3 — Gmail App Password setup

1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. Security → App Passwords
4. Create a new app password for "Mail"
5. Use that 16-character password as EMAIL_PASS

Without this, email verification and notification
features will fail silently. The app still runs.

## Step 4 — Seed the database

```bash
cd backend
node seed.js
```

This creates:
- 1 college (Institute of Technology)
- 1 superadmin account
- 1 college admin account

Credentials are printed to console after seeding.

## Step 5 — Run the app

Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

## MongoDB collections

These are created automatically on first run:
```
users
colleges
events
registrations
notifications
feedbacks
comments
```

## Common issues

**Backend crashes on start:**
Check that MongoDB is running:
```bash
mongod --version
# Start MongoDB if needed
```

**Emails not sending:**
Check EMAIL_PASS in .env is a Gmail App Password
not your regular Gmail password.

**Frontend shows blank page:**
Check browser console for errors.
Make sure VITE_API_URL matches your backend port.

**Seed fails:**
Make sure MongoDB is running and MONGO_URI is correct.

**Login fails after seed:**
Use exactly the credentials printed by seed.js.
Password is pass123 by default.
