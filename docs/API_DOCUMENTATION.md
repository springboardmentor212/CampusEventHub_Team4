# CampusEventHub Backend API Documentation

## Overview

CampusEventHub is a comprehensive event management platform for inter-college events. This API provides authentication, user management, and college management functionality with role-based access control.

## Base URL

```
Development: http://localhost:5555/api
Production: https://your-domain.com/api
```

### Health Check

**GET** `/api/health`

Verify the server is running. No authentication required.

**Response:**
```json
{
  "success": true,
  "service": "CampusEventHub API",
  "uptime": 120.5,
  "sampleBannerImage": "http://localhost:5555/uploads/test.png"
}
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
- **college_admin**: Administrators for specific colleges (must be approved by superadmin before they can create events)
- **admin**: System-wide superadmin with full access — can approve/reject events and college admin accounts

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

Create a new event. Only approved college admins or superadmin can create events.

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
  "visibilityScope": "college_only",
  "bannerImage": "https://example.com/poster.jpg"
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
      "visibilityScope": "college_only",
      "bannerImage": "https://example.com/poster.jpg",
      "createdAt": "2024-02-01T10:00:00.000Z"
    }
  }
}
```

> **`visibilityScope` values:**
> - `"college_only"` — only students from the organizing college can register (default)
> - `"all_colleges"` — students from any college can register

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
  "notes": "Optional notes"
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
      "event": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Hackathon 2024"
      },
      "user": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "student123"
      },
      "status": "pending",
      "registrationDate": "2024-02-01T10:00:00.000Z",
      "notes": "Optional notes"
    }
  }
}
```

#### Get My Registrations
```http
GET /api/registrations/my
Authorization: Bearer <token>
```

Alias route supported for frontend compatibility:
```http
GET /api/registrations/my-registrations
```

#### Cancel Registration
```http
DELETE /api/registrations/:id/cancel
Authorization: Bearer <token>
```

Alias route supported for frontend compatibility:
```http
DELETE /api/registrations/:id
```

### Admin / College Admin Operations

#### Get Event Registrations
```http
GET /api/registrations/event/:eventId
Authorization: Bearer <token>
```

#### Export Event Registrations (CSV)
```http
GET /api/registrations/event/:eventId/export
Authorization: Bearer <token>
```

#### Approve Registration
```http
PATCH /api/registrations/:id/approve
Authorization: Bearer <token>
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
  "reason": "Event capacity reached"
}
```

#### Mark Attendance
```http
PATCH /api/registrations/:id/attendance
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "attended"
}
```

Allowed attendance statuses:
- `attended`
- `no-show`
- `approved`

#### Registration Statistics
```http
GET /api/registrations/stats/:eventId
Authorization: Bearer <token>
```

### Super Admin Operations

#### Get All Registrations
```http
GET /api/registrations?status=pending&event_id=<eventId>&user_id=<userId>&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Registration by ID
```http
GET /api/registrations/:id
Authorization: Bearer <token>
```

### Registration Status Values

- `pending`: Awaiting review
- `approved`: Approved by admin
- `rejected`: Rejected by admin
- `attended`: Marked attended
- `no-show`: Marked absent

### Validation and Access Rules

- Students can register only for events in their own college **unless** the event has `visibilityScope: "all_colleges"`.
- Registration is blocked for inactive/cancelled events.
- Registration is blocked after `registrationDeadline`.
- Duplicate registrations are prevented with a unique index on `(event, user)`.
- Event capacity is enforced using atomic participant increment logic.

### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Event reached capacity or registration is closed"
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

## Event Approval Workflow (SuperAdmin)

Events created by college admins are **pending** by default and require superadmin approval before becoming visible to students.

### Get Pending Events

```http
GET /api/events/admin/pending-events
Authorization: Bearer <token>
```

Returns all events with `status: "pending"`. SuperAdmin only.

### Approve Event

```http
PATCH /api/events/:id/approve
Authorization: Bearer <token>
```

Changes event status to `"upcoming"` and sends an approval email to the organizer.

**Response:**
```json
{
  "success": true,
  "message": "Event approved successfully"
}
```

### Reject Event

```http
DELETE /api/events/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "The event description does not meet content guidelines"
}
```

Soft-deletes the event (sets `isActive: false`) and sends a rejection email to the organizer containing the reason. SuperAdmin only.

**Response:**
```json
{
  "success": true,
  "message": "Event rejected successfully"
}
```

> **Note:** The `reason` field is required. The organizer receives an email with the full rejection context.

---

## Security Features (Production Ready)

- ✅ **CORS Hardening**: Access restricted to authorized frontend origins.
- ✅ **Secure Cookies**: HttpOnly, Secure, and SameSite flags protect tokens.
- ✅ **Rate Limiting**: Protection against brute-force on auth endpoints.
- ✅ **Schema Validation**: All inputs validated via Joi before processing.
- ✅ **Global Error Handling**: Standardized responses without leaking internal stack traces.
- ✅ **Password Policy**: Enforced complexity (uppercase, lowercase, number, min 8 chars).

