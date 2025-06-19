import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import validate from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;