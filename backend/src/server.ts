import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import assignmentRoutes from './routes/assignments';
import noteRoutes from './routes/notes';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

/*
// 🧪 TEMPORARY MOCK AUTH MIDDLEWARE — FOR POSTMAN TESTING ONLY
// pretend the user is already authenticated by hardcoding a user ID
// todo: REMOVE THIS ONCE REAL AUTH SYSTEM IS PLUGGED IN
app.use((req: any, res, next) => {
  req.user = { id: '720827c0-dbae-49f5-bdc4-3a5b4467e475' }; // 👤 Simulated user ID
  next();
});
*/

// TEMP: Placeholder auth middleware to simulate protection
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
  }
  next();
};

// Routes
app.use('/api/auth', authRoutes);

// Protected routes (JWT will be plugged in here later)
app.use('/api/assignments', requireAuth, assignmentRoutes);
app.use('/api/notes', requireAuth, noteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});