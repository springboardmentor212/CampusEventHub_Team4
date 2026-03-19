# CampusEventHub

CampusEventHub is a MERN stack inter-college event management platform for publishing, approving, discovering, and managing campus events across multiple colleges.

## What It Does

- Helps students discover events, register for them, and track their participation from one dashboard.
- Gives college admins a structured way to create events, manage registrations, and review student activity for their own college.
- Gives superadmins platform-level control over approvals, colleges, admins, and overall event operations.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT-based auth with HttpOnly cookies |
| Infra / Tooling | GitHub Actions, Nodemailer, Cloudinary |

## Roles

- **Student**: Discovers events, registers, tracks status, and submits feedback after attending.
- **College Admin**: Creates and manages events for a college, reviews students, and monitors participation.
- **Superadmin**: Oversees the full platform, including college approvals, admin approvals, and event governance.

## Local Setup

### Prerequisites

Make sure you have the following installed:

- Node.js 20 or later
- npm
- MongoDB (local instance or hosted connection string)
- Git

### Clone The Repository

```bash
git clone https://github.com/springboardmentor212/CampusEventHub_Team4
cd CampusEventHub
```

### Environment Setup

Create local environment files based on the example values below:

- `backend/.env`
- `frontend/.env`

### Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Run The Backend

From the `backend` folder:

```bash
npm run dev
```

### Run The Frontend

From the `frontend` folder:

```bash
npm run dev
```

By default, the frontend runs on Vite and the backend runs on the configured Node/Express port from your backend environment file.

## Environment Variables

### Backend

Create `backend/.env` with placeholder values like these:

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

### Frontend

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5555/api
```

## API Overview

API documentation is available here:

[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Database Schema

Database schema documentation is available here:

[docs/database-schema.md](docs/database-schema.md)

## Contributing

This project is part of an internship program. For questions or collaboration reach out to the developers below.

## Developers

- **Uday** ([@udaycodespace](https://github.com/udaycodespace)) — Frontend lead, Backend, Figma design, Architecture
- **Gayatri** ([@Gayatri-3168](https://github.com/Gayatri-3168)) — Backend

## License

This project is licensed under the [MIT License](LICENSE).