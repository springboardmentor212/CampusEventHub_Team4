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

## Security Features (Production Ready)

- ✅ **CORS Hardening**: Access restricted to authorized frontend origins.
- ✅ **Secure Cookies**: HttpOnly, Secure, and SameSite flags protect tokens.
- ✅ **Rate Limiting**: Protection against brute-force on auth endpoints.
- ✅ **Schema Validation**: All inputs validated via Joi before processing.
- ✅ **Global Error Handling**: Standardized responses without leaking internal stack traces.
- ✅ **Password Policy**: Enforced complexity (uppercase, lowercase, number, min 8 chars).
