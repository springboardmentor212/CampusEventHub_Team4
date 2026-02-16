# Backend API Testing Guide

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "college": "Example College"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "college": "Example College"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

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
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "college": "Example College"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get Profile
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "student",
      "college": "Example College",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Testing with Postman/curl

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "college": "Test College"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with actual token):
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Available Roles
- `student` - Default role for regular students
- `admin` - System administrator
- `college_admin` - College-level administrator

## Next Steps
1. Test the authentication endpoints
2. Implement event management routes
3. Add registration system for events
4. Create feedback system
