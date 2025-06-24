# 🔐 Authentication Module – Academic Organizer

## Overview
This module provides JWT-based authentication for the Academic Organizer backend. It handles **user registration**, **login**, **logout**, and **fetching the current user** via secure token verification.

---

## 📦 Components

### 1. **Controllers**: `src/controllers/auth.ts`
- `register`: Registers a new user
- `login`: Logs in an existing user
- `logout`: Statelessly acknowledges logout
- `getCurrentUser`: Returns the currently authenticated user

### 2. **Middleware**: `src/middleware/auth.ts`
- `authenticateToken`: Enforces token verification for protected routes
- `optionalAuth`: Allows optional authentication for semi-protected routes

### 3. **Schemas**: `src/schemas/auth.ts`
- Zod-based schemas for request body validation

### 4. **Routes**: `src/routes/auth.ts`
Defines endpoints for registration, login, logout, and fetching the current user.

---

## 🔐 Authentication Flow

### 🔸 Token-Based (JWT)
- Tokens are generated using `jsonwebtoken` on successful login or registration.
- Secret: `process.env.JWT_SECRET`
- Expiration: Configurable with `JWT_EXPIRES_IN` (default: `24h`)
- JWT Payload: `{ userId: <string> }`

---

## 📘 API Endpoints

### `POST /api/auth/register`
Registers a new user.

**Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Validations**:
- Email must be valid
- Password must be at least 6 characters

**Responses**:
- `201 Created`: `{ user: { id, email }, token }`
- `400 Bad Request`: Email already exists or validation errors
- `500 Internal Server Error`: Registration failure

---

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.

**Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Validations**:
- Email must be valid
- Password must not be empty

**Responses**:
- `200 OK`: `{ user: { id, email }, token }`
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Login failure

---

### `POST /api/auth/logout`
Statelessly acknowledges a logout request.

**Headers**:
- Requires valid JWT in `Authorization: Bearer <token>`

**Responses**:
- `200 OK`: `{ message: "Logged out successfully" }`

---

### `GET /api/auth/me`
Fetches the current authenticated user's information.

**Headers**:
- Requires valid JWT in `Authorization: Bearer <token>`

**Responses**:
- `200 OK`: `{ user: { id, email, createdAt } }`
- `401 Unauthorized`: Token missing or invalid
- `404 Not Found`: User not found
- `500 Internal Server Error`: DB errors

---

## 🛡️ Middleware

### `authenticateToken`
- Extracts JWT from `Authorization` header
- Verifies token signature and expiry
- Fetches user from database
- Attaches user to `req.user`
- Returns 401/403/500 on failure

### `optionalAuth`
- Same as `authenticateToken` but does **not block** requests on failure
- Used for routes that can work with or without authentication

---

## 🧪 Validation (Zod)

### `registerSchema`
```ts
z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});
```

### `loginSchema`
```ts
z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});
```

---

## 🔧 Environment Variables

| Variable         | Description                             | Required | Example Value                    |
|------------------|-----------------------------------------|----------|----------------------------------|
| `JWT_SECRET`     | Secret key for signing JWTs             | ✅       | `your-secret-key`               |
| `JWT_EXPIRES_IN` | Token expiration duration (optional)    | ❌       | `24h`, `1d`, `7d`               |
| `BCRYPT_ROUNDS`  | Cost factor for password hashing        | ✅       | `10`                            |
| `DATABASE_URL`   | PostgreSQL connection string            | ✅       | `postgres://user:pass@host/db`  |

---

## ✅ Security Best Practices
- Passwords are hashed using bcrypt with configurable salt rounds.
- JWTs are signed with a secure secret and expire in a limited time.
- Sensitive fields (e.g., password) are never exposed in responses.
- All protected routes require valid tokens for access.