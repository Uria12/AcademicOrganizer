# Super Academic Organizer

A lightweight, centralized web application for university and high school students to manage academic tasks, assignments, and study notes efficiently.

## 🎯 Project Overview

**Problem**: Students struggle to keep track of assignments, deadlines, and notes across different platforms, leading to missed deadlines and disorganized study habits.

**Solution**: A clean, easy-to-use web interface that centralizes task tracking and note management in one place.

**Team**: Giorgi Uriatmkopeli, Dima Chubinidze

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest (backend) + React Testing Library (frontend)
- **Deployment**: Railway (backend + database) + Netlify (frontend)

## 📁 Project Structure

```
academic-organizer/
├── frontend/                 # React + TypeScript client
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AssignmentForm.tsx
│   │   │   ├── AssignmentList.tsx
│   │   │   ├── NoteForm.tsx
│   │   │   └── NoteList.tsx
│   │   ├── pages/           # Main application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Helper functions
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Node.js + TypeScript server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── assignments.ts
│   │   │   ├── notes.ts
│   │   │   └── auth.ts
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # Database models (Prisma)
│   │   ├── utils/           # Helper functions
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── docs/                    # Project documentation
├── .gitignore
├── README.md
└── docker-compose.yml       # For local PostgreSQL (optional)
```

## 🚀 Core Features

### Must-Have (MVP)
- ✅ User registration and authentication
- ✅ CRUD operations for assignments with deadlines
- ✅ CRUD operations for study notes with tags
- ✅ Assignment status tracking (pending, in-progress, completed)
- ✅ Basic search and filtering
- ✅ Responsive design

### Nice-to-Have
- 📧 Email notifications for deadlines
- 📅 Calendar integration
- 📎 File attachments
- 🎨 Advanced tagging with colors
- 📊 Export functionality (PDF, CSV)
- 🌙 Dark mode theme

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  tag TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Assignments
- `GET /api/assignments` - Fetch user's assignments
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Notes
- `GET /api/notes` - Fetch user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/academic-organizer.git
   cd academic-organizer
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database URL in .env
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📅 Development Timeline

- **Week 1**: Project setup, database design, basic structure
- **Week 2**: Core API development, authentication, basic UI
- **Week 3**: CRUD functionality, deployment setup
- **Week 4**: UI polish, enhanced features, documentation

## 🚀 Deployment

- **Backend**: Railway (includes PostgreSQL)
- **Frontend**: Netlify
- **Domain**: Using default subdomains from hosting platforms

## Note
This project is part of an academic assignment.

## 📞 Contact

- **Giorgi Uriatmkopeli** - [[[GitHub Profile]](https://github.com/Uria12)](https://github.com/Uria12)
- **Dima Chubinidze** - [[GitHub Profile]](https://github.com/DimaCH2004)
- **Beka Baratashvili** - [[GitHub Profile]](https://github.com/BekasGithub)
