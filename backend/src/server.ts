import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables before importing other modules
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Now import other modules
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import assignmentRoutes from './routes/assignments';
import noteRoutes from './routes/notes';
import { authenticateToken } from './middleware/auth';
import { 
  securityHeaders, 
  apiRateLimit, 
  sanitizeInput, 
  requestSizeLimit 
} from './middleware/security';
import scheduler from './services/scheduler';
import emailService from './services/emailService';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware (apply first)
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(sanitizeInput);

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', apiRateLimit);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes - all routes below this middleware require authentication
app.use('/api/assignments', authenticateToken, assignmentRoutes);
app.use('/api/notes', authenticateToken, noteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email test endpoint (for development/testing)
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const success = await emailService.testConnection();
    if (!success) {
      return res.status(500).json({ error: 'Email service not configured or connection failed' });
    }

    res.json({ message: 'Email service is working correctly' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Email test failed' });
  }
});

// Manual reminder trigger endpoint (for testing)
app.post('/api/trigger-reminders', authenticateToken, async (req, res) => {
  try {
    await scheduler.runReminderCheckNow();
    res.json({ message: 'Reminder check completed' });
  } catch (error) {
    console.error('Manual reminder trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger reminders' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize services
async function initializeServices() {
  try {
    // Test email service connection (optional)
    const emailConnected = await emailService.testConnection();
    if (!emailConnected) {
      console.warn('⚠️ Email service not available, reminders will be disabled');
    }
    
    // Start reminder scheduler
    scheduler.startReminderScheduler();
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  scheduler.stopReminderScheduler();
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  
  // Initialize services after server starts
  initializeServices();
});