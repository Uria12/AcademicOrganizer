# Super Academic Organizer

A full-stack web application designed to help students efficiently track their academic assignments and study notes through a unified, clean interface.

## What It Does

**Problem:** Students frequently struggle to keep track of tasks, deadlines, and notes when they are scattered across different applications or physical notebooks.

**Our Solution:** A lightweight academic organizer that enables students to manage assignments and notes with comprehensive filtering, deadline tracking, and search functionality, all consolidated in one convenient location.

**Team Members:** Giorgi Uriatmkopeli, Dima Chubinidze, Beka Baratashvili

## Tech Stack

- **Frontend:** React + TypeScript
- **Backend:** Node.js + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Testing:** Jest (backend) + React Testing Library (frontend)

## Project Structure

```
academic-organizer/
├── frontend/                    # React client application
│   └── src/
│       ├── components/          # UI components: AssignmentForm, NoteList, etc.
│       ├── hooks/               # Custom React hooks
│       ├── types/               # Shared TypeScript types
│       └── App.tsx
├── backend/                     # Node.js server
│   └── src/
│       ├── routes/              # API endpoints (auth, notes, assignments)
│       ├── controllers/         # Business logic layer
│       ├── middleware/          # Validation, authentication checks
│       └── server.ts
├── prisma/                      # Database schema & migrations
├── docs/                        # Project documentation
└── tests/                       # Unit + integration tests
```

## Main Features

### Assignment Management
- Create, update, delete, and view assignments
- Track assignment status: pending, in-progress, completed
- Sort assignments by deadline and filter by status

### Notes Management
- Create, update, delete, and tag study notes
- Basic filtering and search functionality

### Authentication System
- Secure user registration and login using JWT-based authentication

### Additional Features
- Responsive user interface with real-time updates
- Comprehensive test coverage for both backend and frontend components

## Testing

```bash
# Backend tests using Jest
cd backend
npm test

# Frontend tests using React Testing Library
cd frontend
npm test
```

## Running the App Locally

### Requirements
- Node.js (version 18 or higher)
- PostgreSQL database

### Setup Instructions

#### Backend Setup
```bash
# 1. Clone the project repository
git clone https://github.com/your-username/academic-organizer.git
cd academic-organizer

# 2. Setup backend environment
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL and other environment variables
npx prisma migrate dev
npm run dev
```

#### Frontend Setup
```bash
# 3. Setup frontend environment
cd ../frontend
npm install
npm start
```

### Access Points
- Application runs at: `http://localhost:3000`
- API server runs at: `http://localhost:5000`

## Contact

**Development Team:**
- Giorgi Uriatmkopeli
- Dima Chubinidze
- Beka Baratashvili

## Project Background

This project was developed as a university final project, with all features and architecture built from scratch by our development team. The application demonstrates full-stack development capabilities including modern web technologies, database design, authentication systems, and comprehensive testing practices.