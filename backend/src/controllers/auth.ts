import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validate JWT environment variables at startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

if (!process.env.BCRYPT_ROUNDS) {
  throw new Error('BCRYPT_ROUNDS environment variable is missing');
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS: number = parseInt(process.env.BCRYPT_ROUNDS);

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('📝 Registration attempt for email:', email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password with configured salt rounds
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    
    // Create new user with password_hash field
    const user = await prisma.user.create({
      data: { 
        email, 
        password_hash: hashedPassword 
      },
      select: { 
        id: true, 
        email: true, 
        created_at: true 
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    console.log('✅ User registered successfully:', user.email);
    res.status(201).json({ 
      user: { id: user.id, email: user.email },
      token 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'User registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for email:', email);

    // Find user by email with password_hash
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password against password_hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    console.log('✅ Login successful for user:', user.email);
    res.json({ 
      user: { id: user.id, email: user.email },
      token 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    console.log('🚪 Logout request received');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('👤 Current user request for:', req.user.email);
    
    // Fetch fresh user data from database
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        email: true, 
        created_at: true 
      }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: currentUser.id,
        email: currentUser.email,
        createdAt: currentUser.created_at
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};