# Assignment Module - Notes

**Author:** Giorgi Uriatmkopeli  
**Module:** Assignments + Database + Core API

## Overview

This module handles all student assignment functionality including task creation, updates, status filtering, deadline sorting, and comprehensive testing. The implementation provides a complete connection between the frontend React components, Express backend API, and PostgreSQL database through Prisma ORM.

The primary objective was to deliver a production-ready, full-stack CRUD workflow for assignments that operates reliably and supports future feature expansion.

## Backend API Implementation

The backend uses Express with Prisma ORM and Zod for request validation. All routes are protected by a `requireAuth` middleware that validates `req.user` for authenticated access.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | Retrieve all assignments for authenticated user |
| POST | `/api/assignments` | Create new assignment |
| PUT | `/api/assignments/:id` | Update assignment status |
| DELETE | `/api/assignments/:id` | Delete assignment by ID |

### Key Features

- Assignments are automatically sorted by `createdAt` timestamp
- Request validation implemented using Zod schemas
- Comprehensive console logging for debugging purposes
- Architecture prepared for seamless JWT authentication integration

## Database Schema

The Prisma schema defines the Assignment model with UUID primary keys and proper user relationships:

```typescript
model Assignment {
  id          String   @id @default(uuid())
  title       String
  description String?
  deadline    DateTime
  status      String   @default("pending")
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Database Details

- Production PostgreSQL database hosted on Railway
- All migrations applied using Prisma Migrate
- Schema designed to handle edge cases identified during integration testing

## Backend Testing

Comprehensive test suite implemented using Jest and Supertest, located in `/backend/tests/unit/assignments.routes.test.ts`.

### Test Coverage

- **POST requests:** Valid and invalid assignment creation scenarios
- **GET requests:** Fetching all assignments for authenticated users
- **PUT requests:** Assignment status update operations
- **DELETE requests:** Assignment deletion and not-found error handling

Additional unit tests cover Zod schema validation in `assignmentSchema` to ensure data integrity at the validation layer.

## Frontend Implementation

The React frontend is built with TypeScript and uses the native Fetch API for backend communication.

### AssignmentForm Component

- Implements controlled form inputs for title, description, and deadline
- Handles client-side validation and loading states
- Submits data to `/api/assignments` endpoint via POST requests
- Triggers parent component updates through `onAdd()` callback on successful submission

### AssignmentList Component

- Displays assignments with configurable sorting by deadline (ascending/descending)
- Provides filtering capabilities by status: `all`, `pending`, `in-progress`, `completed`
- Enables direct status updates through dropdown interface
- Supports assignment deletion with optimistic UI updates for better user experience

## Frontend Testing

React Testing Library test suites are located in `frontend/src/__tests__/components/`:

### Test Files

- **AssignmentForm.test.tsx:** Validates form field rendering, submission success/failure scenarios, and button state management
- **AssignmentList.test.tsx:** Tests component rendering, filtering functionality, and status update behavior

## Authentication Middleware

The authentication system evolved from mock implementation to production-ready structure:

### Previous Mock Implementation
```typescript
// req.user = { id: '...' };
```

### Current Production-Ready Implementation
```typescript
const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};
```

This middleware design allows for seamless integration with JWT authentication once the authentication module is completed. All protected routes utilize this middleware for consistent security enforcement.

## Project Structure

```
backend/
├── controllers/assignments.ts
├── routes/assignments.ts
├── tests/unit/
│   ├── assignments.routes.test.ts
│   └── assignments.test.ts (schema validation)

frontend/
├── src/components/
│   ├── AssignmentForm.tsx
│   └── AssignmentList.tsx
├── src/__tests__/components/
│   ├── AssignmentForm.test.tsx
│   └── AssignmentList.test.tsx

prisma/
├── schema.prisma
├── migrations/
```

## Work Summary

The assignment module implementation includes:

- Complete full-stack `/assignments` feature development covering frontend, backend, and database layers
- Reusable React components with advanced deadline sorting and filtering capabilities
- Comprehensive test coverage for both frontend and backend components
- Production database schema with proper migrations rather than mock data
- Removal of test-only authentication mocks and preparation for JWT integration
- Production-ready architecture that supports future feature expansion and maintenance