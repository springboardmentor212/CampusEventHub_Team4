# 🖥 Backend – CampusEventHub API

This directory contains Node.js + Express backend for CampusEventHub.

It handles:

* ✅ **Authentication & Registration** with email verification
* ✅ **Role-based access control** (Student, College Admin, System Admin)
* ✅ **User & College Management** with full CRUD operations
* ✅ **Password Management** (reset, change, forgot password)
* ✅ **Profile Management** with update functionality
* 🔄 Event management (coming in Milestone 2)
* 🔄 Registration logic (coming in Milestone 3)
* 🔄 Feedback system (coming in Milestone 4)
* ✅ **Database communication** with MongoDB
* ✅ **Secure middleware** for authentication and authorization

---

## 🧱 Tech Stack

* Node.js 20+
* Express.js
* MongoDB with Mongoose ODM
* JWT Authentication
* bcryptjs for password hashing
* Docker for containerization
* ES6+ Modules

---

## 📂 Folder Structure

```
backend/
│
├── controllers/
│   ├── authController.js      # Authentication & user management
│   └── passwordController.js # Password reset & change
├── middleware/
│   └── auth.js               # Authentication & role-based middleware
├── models/
│   ├── User.js               # User schema with roles
│   └── College.js            # College management schema
├── routes/
│   ├── auth.js               # Authentication endpoints
│   └── colleges.js           # College management endpoints
├── docs/
│   ├── API_DOCUMENTATION.md  # Complete API documentation
│   └── API_TESTING.md       # Testing examples
├── seed.js                  # Database seeding script
├── server.js                # Entry point
├── package.json
├── Dockerfile
├── .env.example             # Environment variables template
└── .env                     # Not committed to Git
```

---

## � Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
MONGO_URI=mongodb://localhost:27017/campuseventhub
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or start local MongoDB instance
mongod
```

### 4. Seed Database (Recommended)
```bash
npm run seed
```
This creates sample colleges and users for testing.

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

## 🐳 Docker Setup

From project root:
```bash
docker compose up --build
```

Backend will run inside container and connect to MongoDB service automatically.

---

## 🔐 Authentication System

### Features Implemented
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Password reset via email
- ✅ Password change for authenticated users
- ✅ Profile management
- ✅ Role-based access control

### User Roles
1. **student**: Can register, login, manage profile
2. **college_admin**: Can manage users from their college
3. **admin**: System administrator with full access

### Authentication Flow
1. User registers → Email verification token generated
2. User verifies email → Account activated
3. User logs in → JWT token issued
4. Token used for protected routes
5. Role-based middleware enforces permissions

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/request-password-reset` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/change-password` | Change password | Yes |

### College Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/colleges` | Get all colleges | No |
| GET | `/api/colleges/:id` | Get college by ID | No |
| POST | `/api/colleges` | Create college | Admin |
| PUT | `/api/colleges/:id` | Update college | Admin |
| DELETE | `/api/colleges/:id` | Delete college | System Admin |
| GET | `/api/colleges/:id/users` | Get college users | Admin |

---

## 🔑 Default Login Credentials (After Seeding)

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| System Admin | admin@campuseventhub.com | password123 | Full system access |
| College Admin (IOT) | admin@iot.edu | password123 | Institute of Technology |
| College Admin (COS) | admin@cos.edu | password123 | College of Science |
| Student | student1@iot.edu | password123 | Regular student access |

---

## 🧪 Testing

### Quick Test with curl
```bash
# Test health endpoint
curl http://localhost:5000/

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "collegeId": "60f7b3b3b3b3b3b3b3b3b3"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Postman Testing
1. Import the API collection from `docs/API_DOCUMENTATION.md`
2. Set base URL to `http://localhost:5000/api`
3. Use sample credentials for testing

---

## �️ Security Features

- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Input Validation**: Comprehensive validation on all endpoints
- ✅ **Role-Based Access Control**: Granular permission system
- ✅ **Email Verification**: Prevents fake registrations
- ✅ **Rate Limiting Ready**: Structure for implementation
- ✅ **CORS Configuration**: Proper cross-origin setup

---

## 📦 Package Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `PORT` | Server port | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `APP_NAME` | Application name | ❌ |
| `APP_VERSION` | Application version | ❌ |

---

## 📋 Milestone 1 Status: ✅ COMPLETED

### Features Delivered
- ✅ User registration with validation
- ✅ Email verification system
- ✅ Secure login with JWT
- ✅ Role-based access control
- ✅ College management system
- ✅ User profile management
- ✅ Password reset functionality
- ✅ Comprehensive API documentation
- ✅ Database seeding for testing
- ✅ Docker configuration

### Security Implementation
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based middleware
- ✅ Input validation and sanitization
- ✅ Error handling without exposing sensitive data

### Documentation
- ✅ Complete API documentation
- ✅ Testing examples
- ✅ Setup instructions
- ✅ Security guidelines

---

## 🔄 Next Milestones

### Milestone 2: Event Creation & Listing
- Event management endpoints
- Event categories and tags
- Image upload functionality
- Event search and filtering

### Milestone 3: Registration & Slot Management
- Event registration system
- Slot management
- Registration approval workflow
- Capacity management

### Milestone 4: Feedback & Admin Analytics
- Feedback and rating system
- Analytics dashboard
- Reporting features
- Notification system

---

## � Development Rules

* Do not push directly to main
* Always create feature branch from dev
* Raise Pull Request to dev
* Merge only after review
* Keep controllers thin and focused
* Use proper error handling
* Never expose stack traces in production
* Validate all request inputs
* Follow structured commit messages

---

## 🔒 Security Guidelines

* Hash passwords before storage
* Store JWT secret securely
* Validate user roles on every request
* Restrict admin-only routes with middleware
* Never expose raw database errors
* Use HTTPS in production
* Implement rate limiting
* Log security events

---

## 📌 Important Notes

* Backend is API-only - no frontend logic
* All endpoints return JSON responses
* Authentication required for most operations
* Role-based access is strictly enforced
* Database seeding provides test data
* Docker configuration is production-ready

For detailed API documentation, see: `docs/API_DOCUMENTATION.md`