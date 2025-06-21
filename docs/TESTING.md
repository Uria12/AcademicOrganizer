# Testing Strategy - Academic Organizer

## Testing Framework Setup

### Backend Testing
- **Framework**: Jest + Supertest
- **Test Types**: 
  - Unit tests: For middleware, utility functions, and isolated service logic.
  - Integration tests: For testing route handlers with mocked database and authentication logic.
- **Location**: `backend/tests/`
- **Coverage**:
  - ✅ `auth.middleware.ts`: Unit tests for `authenticateToken` and `optionalAuth` middleware
  - ✅ `auth.routes.ts`: Integration tests for `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`

### Frontend Testing  
- **Framework**: React Testing Library + Jest
- **Test Types**: 
  - Component tests: Rendering, props, state
  - User interaction tests: Simulate clicks, typing, form validation
- **Location**: `frontend/src/__tests__/`
