# CampusEventHub Backend API Documentation

## Overview

CampusEventHub is a comprehensive event management platform for inter-college events. This API provides authentication, user management, and college management functionality with role-based access control.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Roles

- **student**: Regular student users
- **college_admin**: Administrators for specific colleges
- **admin**: System administrators with full access

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "collegeId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "role": "student",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "college": "Example College",
      "isEmailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "college": {
        "name": "Example College",
        "code": "EC"
      },
      "isEmailVerified": true,
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify Email

**GET** `/auth/verify-email/:token`

Verify user email address.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Get Profile

**GET** `/auth/profile` 🔒

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "college": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Example College",
        "code": "EC",
        "email": "admin@example.com",
        "website": "https://example.com"
      },
      "isEmailVerified": true,
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile` 🔒

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Request Password Reset

**POST** `/auth/request-password-reset`

Request a password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password

**POST** `/auth/reset-password`

Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

### Change Password

**POST** `/auth/change-password` 🔒

Change password for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## College Management Endpoints

### Get All Colleges

**GET** `/colleges`

Get list of all active colleges with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name or code

**Response:**
```json
{
  "success": true,
  "data": {
    "colleges": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Example College",
        "code": "EC",
        "email": "admin@example.com",
        "website": "https://example.com",
        "description": "A great educational institution",
        "type": "engineering",
        "logo": "https://example.com/logo.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalColleges": 1
    }
  }
}
```

### Get College by ID

**GET** `/colleges/:id`

Get specific college details.

**Response:**
```json
{
  "success": true,
  "data": {
    "college": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Example College",
      "code": "EC",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 College St",
        "city": "College City",
        "state": "CA",
        "country": "India",
        "pincode": "123456"
      },
      "website": "https://example.com",
      "description": "A great educational institution",
      "type": "engineering",
      "establishedYear": 2000,
      "isActive": true,
      "isVerified": true
    }
  }
}
```

### Create College

**POST** `/colleges` 🔒 Admin

Create a new college (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "New College",
  "code": "NC",
  "email": "admin@newcollege.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 College Ave",
    "city": "New City",
    "state": "NY",
    "pincode": "654321"
  },
  "website": "https://newcollege.com",
  "description": "A new educational institution",
  "type": "engineering",
  "establishedYear": 2010
}
```

### Update College

**PUT** `/colleges/:id` 🔒 Admin

Update college information (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

### Delete College

**DELETE** `/colleges/:id` 🔒 System Admin

Delete a college (system admin only).

**Headers:**
```
Authorization: Bearer <system-admin-token>
```

### Get College Users

**GET** `/colleges/:id/users` 🔒 Admin

Get users belonging to a specific college (college admin or system admin).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (student, college_admin)
- `search` (optional): Search term for username, email, or name

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Examples

### Using curl

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "collegeId": "60f7b3b3b3b3b3b3b3b3b3b3"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the collection (if provided)
2. Set base URL to `http://localhost:5000/api`
3. For protected endpoints, add Authorization header with Bearer token
4. Use the request bodies as shown in examples

---

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Start MongoDB (using Docker or local instance)
5. Start the server: `npm run dev`

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens expire in 7 days
- Email verification required for full access
- Role-based access control implemented
- Input validation on all endpoints
- Rate limiting recommended for production

---

## Next Features

- Event management endpoints
- Registration system for events
- Feedback and rating system
- Notification system
- File upload for event images
- Analytics and reporting
