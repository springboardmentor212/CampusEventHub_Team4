# CampusEventHub

Inter-college event management platform built with MERN stack.
Students discover and register for events across colleges.
College admins manage events and students.
Superadmin governs the platform.

---

## What It Does

- Students browse and register for events from their college
  and other colleges on the platform
- College admins create events, manage registrations,
  and approve student accounts
- Superadmin approves college admins, reviews events before
  they go live, and monitors platform health

---

## Three Roles

| Role | DB Value | Route | Responsibility |
|------|----------|-------|----------------|
| Superadmin | `admin` | `/superadmin` | Platform governance, approvals, analytics |
| College Admin | `college_admin` | `/admin` | Events, registrations, student management |
| Student | `student` | `/campus-feed` | Browse events, register, feedback |

Superadmin is seeded directly — no UI signup.
College admins and students sign up via `/register`.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT tokens |
| Email | Nodemailer (Gmail SMTP) |

---

## Repository Structure

```
CampusEventHub_Team4/
├── frontend/          React + Vite app
├── backend/           Express API + MongoDB
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── jobs/          Scheduled jobs (reminders, no-show)
└── docs/              Technical documentation
```

---

## Environment Variables

Create `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campuseventhub
JWT_SECRET=your_random_secret_here
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

For Gmail: enable 2FA on your Google account,
then generate an App Password and use that as EMAIL_PASS.
Without this, email features fail silently but the
app still works.

---

## Local Development

```bash
# 1. Clone the repo
git clone [repo url]
cd CampusEventHub_Team4

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set up environment files (see above)

# 4. Seed the database
cd backend && node seed.js

# 5. Start backend
npm run dev

# 6. In a new terminal, start frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health

---

## Seed Credentials (local dev only)

After running seed.js:

```
Superadmin:    [read email from seed.js output] / pass123
College Admin: [read email from seed.js output] / pass123
```

Note: These credentials are for local development only.
Run `node seed.js` and copy the printed credentials.

---

## Branch Strategy

```
main    — protected, production only
dev     — integration branch, merge here before demo
name/feature-branch — your work
```

Current active branch: `uday/role-security-flow-fix`
If contributing to Milestone 3 or 4, branch off this
and raise PR back to it. See CONTRIBUTING.md.

Commit style:
```
feat(auth): add role-aware login redirect
fix(registrations): correct waitlist position calculation
docs(readme): update setup instructions
chore(config): update env variable names
```

---

## Documentation

| File | Purpose |
|------|---------|
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup guide |
| [docs/ROLE_GUIDE.md](docs/ROLE_GUIDE.md) | Role definitions and flows |
| [docs/database-schema.md](docs/database-schema.md) | All models and fields |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | All API endpoints |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

Note: The `docs/` folder reflects the latest implementation.
When in doubt, go by the code.

---

## Security

- Never commit `.env` files
- Backend requires: MONGO_URI, JWT_SECRET, FRONTEND_URL
- Email features require valid Gmail App Password
- Superadmin credentials must be changed before production

---

## Team

[List team member names and GitHub handles here]