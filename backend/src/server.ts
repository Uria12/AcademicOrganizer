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
// Pretend the user is already authenticated by hardcoding a user ID
// TODO: REMOVE THIS ONCE REAL AUTH SYSTEM IS PLUGGED IN
app.use((req: any, res, next) => {
  req.user = { id: '720827c0-dbae-49f5-bdc4-3a5b4467e475' }; // 👤 Simulated user ID
  next();
});
*/

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});