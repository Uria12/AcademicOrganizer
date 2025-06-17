import { Router } from 'express';
import { register, login } from '../controllers/auth';
import validate from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;