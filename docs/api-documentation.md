# 📡 API Documentation – CampusEventHub

Base URL:

```
http://localhost:5000/api
```

---

## 🔐 Authentication

### POST /auth/register

Request:

```
{
  name,
  email,
  password,
  college,
  role
}
```

Response:

```
{
  message,
  token
}
```

---

### POST /auth/login

Request:

```
{
  email,
  password
}
```

Response:

```
{
  token,
  role
}
```

---

## 📅 Events

### POST /events

Create event (Admin only)

### GET /events

List events

### GET /events/:id

Get single event

---

## 📝 Registrations

### POST /registrations

Student registers

### PUT /registrations/:id

Admin approve/reject

---

## 💬 Feedback

### POST /feedback

Submit feedback

### GET /feedback/:eventId

Fetch event feedback