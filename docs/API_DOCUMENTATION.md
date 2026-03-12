# CampusEventHub Backend API Documentation

## Overview

CampusEventHub is a comprehensive event management platform for inter-college events. This API provides authentication, user management, and college management functionality with role-based access control.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### HttpOnly Cookies (Recommended)
In the production flow, the server sends a `token` cookie with the following flags:
- `HttpOnly`: Protects against XSS by preventing JavaScript access.
- `Secure`: Ensures the cookie is only sent over HTTPS (enabled in production).
- `SameSite=Strict`: Protects against CSRF.

### Authorization Header (Legacy/API Tools)
The API still supports the Authorization header for testing or mobile clients:
```
Authorization: Bearer <your-jwt-token>
```

## Standard Response Format

All responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "status": "fail" or "error"
}
```

## Roles

- **student**: Regular student users
- **college_admin**: Administrators for specific colleges
- **admin**: System administrators with full access

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account. Validation is enforced for complex passwords and required fields.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "collegeId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "phone": "+1234567890"
}
```

### Login User

**POST** `/auth/login`

Authenticate user and receive a secure `token` cookie.

**Request Body:**
```json
{
  "email": "admin@campuseventhub.com",
  "password": "password123"
}
```

### Logout User

**GET** `/auth/logout`

Clear the authentication cookie.

### Verify Email

**GET** `/auth/verify-email/:token`

### Get Profile

**GET** `/auth/profile` 🔒

### Update Profile

**PUT** `/auth/profile` 🔒

### Request Password Reset

**POST** `/auth/request-password-reset`

### Reset Password

**POST** `/auth/reset-password`

---

## Event Management Endpoints (Milestone 2)

### Get All Events

**GET** `/events`

Retrieve all events with optional filtering. This is a public endpoint.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of events per page (default: 10)
- `category` (optional): Filter by event category (sports, hackathon, cultural, workshop, seminar, technical, other)
- `college` (optional): Filter by college ID
- `startDate` (optional): Filter events starting from this date (YYYY-MM-DD)
- `endDate` (optional): Filter events ending before this date (YYYY-MM-DD)
- `status` (optional): Filter by event status (upcoming, ongoing, completed, cancelled)
- `search` (optional): Search in title and description

**Example Request:**
```
GET /events?category=sports&college=60f7b3b3b3b3b3b3b3b3b3b3&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "results": 5,
  "total": 25,
  "page": 1,
  "pages": 5,
  "data": {
    "events": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Inter-College Cricket Tournament",
        "description": "Annual cricket tournament for all colleges",
        "category": "sports",
        "location": "Main Sports Ground",
        "startDate": "2024-03-15T09:00:00.000Z",
        "endDate": "2024-03-17T18:00:00.000Z",
        "college": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "Engineering College",
          "code": "EC"
        },
        "createdBy": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "firstName": "Admin",
          "lastName": "User"
        },
        "status": "upcoming",
        "maxParticipants": 100,
        "currentParticipants": 45,
        "createdAt": "2024-02-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Single Event

**GET** `/events/:id`

Retrieve details of a specific event by ID. This is a public endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Hackathon 2024",
      "description": "24-hour coding competition",
      "category": "hackathon",
      "location": "Computer Lab",
      "startDate": "2024-03-20T09:00:00.000Z",
      "endDate": "2024-03-21T09:00:00.000Z",
      "college": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Engineering College",
        "code": "EC",
        "email": "info@engcollege.edu",
        "website": "https://engcollege.edu"
      },
      "createdBy": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@engcollege.edu"
      },
      "maxParticipants": 50,
      "currentParticipants": 0,
      "status": "upcoming",
      "registrationDeadline": "2024-03-18T23:59:59.000Z",
      "requirements": "Basic programming knowledge required",
      "imageUrl": "",
      "createdAt": "2024-02-01T10:00:00.000Z"
    }
  }
}
```

### Create Event

**POST** `/events/create` 🔒

Create a new event. Only college admins can create events.

**Request Body:**
```json
{
  "title": "Annual Cultural Fest",
  "description": "A grand cultural festival with music, dance, and drama performances",
  "category": "cultural",
  "location": "College Auditorium",
  "startDate": "2024-04-01T10:00:00.000Z",
  "endDate": "2024-04-03T22:00:00.000Z",
  "maxParticipants": 500,
  "registrationDeadline": "2024-03-25T23:59:59.000Z",
  "requirements": "Participants must register in teams of 4-6 members",
  "imageUrl": "https://example.com/poster.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Annual Cultural Fest",
      "description": "A grand cultural festival with music, dance, and drama performances",
      "category": "cultural",
      "location": "College Auditorium",
      "startDate": "2024-04-01T10:00:00.000Z",
      "endDate": "2024-04-03T22:00:00.000Z",
      "college": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Engineering College",
        "code": "EC"
      },
      "createdBy": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@engcollege.edu"
      },
      "maxParticipants": 500,
      "currentParticipants": 0,
      "status": "upcoming",
      "registrationDeadline": "2024-03-25T23:59:59.000Z",
      "requirements": "Participants must register in teams of 4-6 members",
      "imageUrl": "https://example.com/poster.jpg",
      "createdAt": "2024-02-01T10:00:00.000Z"
    }
  }
}
```

### Update Event

**PATCH** `/events/:id` 🔒

Update an existing event. Only the event creator (college admin) or system admin can update events.

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "maxParticipants": 600
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Updated Event Title",
      "description": "Updated description",
      // ... other updated fields
      "updatedAt": "2024-02-02T15:30:00.000Z"
    }
  }
}
```

### Delete Event

**DELETE** `/events/:id` 🔒

Soft delete an event (sets isActive to false). Only the event creator (college admin) or system admin can delete events.

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Get My Events

**GET** `/events/my/events` 🔒

Retrieve events created by the current college admin user.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of events per page (default: 10)
- `status` (optional): Filter by event status

**Response:**
```json
{
  "success": true,
  "results": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "data": {
    "events": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "My Event 1",
        "category": "sports",
        "college": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "My College",
          "code": "MC"
        },
        "status": "upcoming",
        "createdAt": "2024-02-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Registration Management Endpoints (Milestone 3)

### Student Registration Operations

#### Register for Event
```http
POST /api/registrations/register
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "notes": "Optional notes about registration"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration submitted successfully",
  "data": {
    "registration": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "event_id": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Hackathon 2024",
        "description": "Annual coding competition",
        "category": "hackathon",
        "start_date": "2024-03-15T09:00:00.000Z",
        "end_date": "2024-03-15T18:00:00.000Z",
        "location": "Computer Lab"
      },
      "user_id": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "student123",
        "email": "student@college.edu"
      },
      "status": "pending",
      "registration_date": "2024-02-01T10:00:00.000Z",
      "notes": "Looking forward to participate!"
    }
  }
}
```

#### Get My Registrations
```http
GET /api/registrations/my-registrations?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "event_id": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "title": "Hackathon 2024",
          "category": "hackathon",
          "start_date": "2024-03-15T09:00:00.000Z",
          "location": "Computer Lab",
          "college": {
            "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
            "name": "Institute of Technology",
            "code": "IOT"
          }
        },
        "status": "pending",
        "registration_date": "2024-02-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRegistrations": 1
    }
  }
}
```

#### Cancel Registration
```http
DELETE /api/registrations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

### Admin Registration Management

#### Get Event Registrations
```http
GET /api/registrations/event/:eventId?status=approved&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "user_id": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "username": "student123",
          "email": "student@college.edu",
          "fullName": "John Doe"
        },
        "status": "pending",
        "registration_date": "2024-02-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRegistrations": 1
    }
  }
}
```

#### Get Registration Statistics
```http
GET /api/registrations/stats/:eventId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "stats": {
      "total": 25,
      "pending": 5,
      "approved": 18,
      "rejected": 2
    }
  }
}
```

#### Approve Registration
```http
PATCH /api/registrations/:id/approve
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Registration approved successfully",
  "data": {
    "registration": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "status": "approved",
      "approved_at": "2024-02-01T11:00:00.000Z",
      "approved_by": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "admin123",
        "email": "admin@college.edu"
      }
    }
  }
}
```

#### Reject Registration
```http
PATCH /api/registrations/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rejection_reason": "Event capacity reached"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration rejected successfully",
  "data": {
    "registration": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "status": "rejected",
      "rejected_at": "2024-02-01T11:00:00.000Z",
      "rejected_by": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "admin123",
        "email": "admin@college.edu"
      },
      "rejection_reason": "Event capacity reached"
    }
  }
}
```

#### Get All Registrations (Super Admin Only)
```http
GET /api/registrations?status=pending&event_id=60f7b3b3b3b3b3b3b3b3b3b3&page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "event_id": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "title": "Hackathon 2024",
          "category": "hackathon",
          "college": {
            "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
            "name": "Institute of Technology",
            "code": "IOT"
          }
        },
        "user_id": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "username": "student123",
          "email": "student@college.edu",
          "fullName": "John Doe"
        },
        "status": "pending",
        "registration_date": "2024-02-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRegistrations": 35
    }
  }
}
```

#### Get Registration by ID
```http
GET /api/registrations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registration": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "event_id": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Hackathon 2024",
        "category": "hackathon",
        "college": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "Institute of Technology",
          "code": "IOT"
        }
      },
      "user_id": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "student123",
        "email": "student@college.edu",
        "fullName": "John Doe"
      },
      "status": "pending",
      "registration_date": "2024-02-01T10:00:00.000Z",
      "notes": "Looking forward to participate!"
    }
  }
}
```

### Registration Status Values

- **pending**: Registration submitted, awaiting admin approval
- **approved**: Registration approved by admin
- **rejected**: Registration rejected by admin

### Query Parameters

- **status**: Filter by registration status (pending, approved, rejected)
- **event_id**: Filter by specific event ID
- **user_id**: Filter by specific user ID (admin only)
- **page**: Page number for pagination (default: 1)
- **limit**: Number of items per page (default: 10/20)

### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "You have already registered for this event"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Only students can register for events"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

## Security Features (Production Ready)

- ✅ **CORS Hardening**: Access restricted to authorized frontend origins.
- ✅ **Secure Cookies**: HttpOnly, Secure, and SameSite flags protect tokens.
- ✅ **Rate Limiting**: Protection against brute-force on auth endpoints.
- ✅ **Schema Validation**: All inputs validated via Joi before processing.
- ✅ **Global Error Handling**: Standardized responses without leaking internal stack traces.
- ✅ **Password Policy**: Enforced complexity (uppercase, lowercase, number, min 8 chars).
