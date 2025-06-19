import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validate environment variable at startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

const JWT_SECRET = process.env.JWT_SECRET;

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

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token provided');
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    console.log('🔐 Token decoded successfully:', { userId: decoded.userId });

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      console.log('❌ User not found for token:', decoded.userId);
      return res.status(401).json({ error: 'Invalid token: user not found' });
    }

    // Attach user to request object
    req.user = user;
    console.log('✅ Authentication successful for user:', user.email);
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    console.log('⚠️ Optional auth failed, continuing without user:', error);
    next();
  }
};