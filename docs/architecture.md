# 🏗 System Architecture – CampusEventHub

## 1️⃣ Overview

CampusEventHub follows a modern MERN-based layered architecture designed for scalability, modularity, and secure inter-service communication.

Architecture Type:

* Client–Server Architecture
* RESTful API Design
* Role-Based Access Control (RBAC)
* Containerized Deployment (Docker)

---

## 2️⃣ High-Level Architecture

```
Client (Browser)
      ↓
Frontend (React + Vite)
      ↓
Backend API (Node.js + Express)
      ↓
MongoDB Database
```

Optional Services:

* JWT Authentication Layer
* Email Service (Nodemailer)
* Docker Container Network

---

## 3️⃣ Technology Stack

### Frontend Layer

* React (Vite)
* React Router
* Axios
* Role-based UI rendering
* Static build served via Nginx (Docker)

Responsibilities:

* User interface
* Client-side routing
* API communication
* Role-based dashboards

---

### Backend Layer

* Node.js
* Express.js
* Mongoose ODM
* JWT Authentication
* Role-based authorization middleware
* Input validation and error handling

Responsibilities:

* REST API endpoints
* Authentication and authorization
* Business logic
* Database interaction
* Registration approval workflow
* Feedback processing

---

### Database Layer

* MongoDB
* Document-based schema
* Indexed collections
* Relational references via ObjectId

Collections:

* Users
* Events
* Registrations
* Feedback
* AdminLogs

---

## 4️⃣ Authentication Flow

1. User registers
2. Password is hashed (bcrypt)
3. JWT token is generated
4. Token is sent to client
5. Client stores token securely
6. Protected routes verify token using middleware

Role-Based Access:

* student
* college_admin
* super_admin

Authorization is handled at middleware level before controller execution.

---

## 5️⃣ Event Registration Flow

1. Student views events
2. Student submits registration
3. Registration stored as "pending"
4. Admin reviews registrations
5. Admin approves/rejects
6. Status updated in database

---

## 6️⃣ Feedback System Flow

1. Student submits rating and comment
2. Feedback stored in database
3. Admin dashboard aggregates ratings
4. Analytics can be generated from feedback collection

---

## 7️⃣ Dockerized Deployment Architecture

Services:

* frontend
* backend
* mongo

Internal Docker Network:

```
backend → connects to → mongo
frontend → communicates with → backend
```

Important:
Inside Docker, MongoDB connection must use:

```
mongodb://mongo:27017/<database_name>
```

Not localhost.

---

## 8️⃣ Environment Configuration Strategy

Sensitive values are stored in `.env` files.

Examples:

* MONGO_URI
* JWT_SECRET
* PORT

.env files are:

* Ignored via .gitignore
* Not committed to repository
* Provided via documentation template

---

## 9️⃣ Security Architecture

* Password hashing using bcrypt
* JWT-based stateless authentication
* Role-based route protection
* No hardcoded credentials
* Environment-based configuration
* Docker network isolation

---

## 🔟 Scalability Considerations

Future Improvements:

* Redis caching
* Load balancing
* Microservice separation
* Event notification system
* CI/CD pipeline integration

---

## 1️⃣1️⃣ System Characteristics

* Modular
* Containerized
* Role-aware
* API-driven
* Deployment-ready
* Team-collaboration structured
