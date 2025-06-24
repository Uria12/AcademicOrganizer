import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../src/routes/auth';

// Mock Prisma Client
jest.mock('@prisma/client');
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as any;

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
const mockBcrypt = require('bcryptjs') as {
  hash: jest.Mock<any, any>;
  compare: jest.Mock<any, any>;
};


// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
const mockJwt = require('jsonwebtoken') as {
  sign: jest.Mock<any, any>;
};


// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '24h';
process.env.BCRYPT_ROUNDS = '10';

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset PrismaClient mock
    (PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      // Mock dependencies
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user: { id: 'user-123', email: 'test@example.com' },
        token: 'mock-jwt-token'
      });

      // Verify mocks were called correctly
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password'
        },
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-123' },
        'test-secret',
        { expiresIn: '24h' }
      );
    });

    it('should return 400 if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User with this email already exists'
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toContainEqual(
        expect.objectContaining({
          message: 'Invalid email format'
        })
      );
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toContainEqual(
        expect.objectContaining({
          message: 'Password must be at least 6 characters long'
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'User registration failed'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: { id: 'user-123', email: 'test@example.com' },
        token: 'mock-jwt-token'
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-123' },
        'test-secret',
        { expiresIn: '24h' }
      );
    });

    it('should return 401 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid email or password'
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid email or password'
      });
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toContainEqual(
        expect.objectContaining({
          message: 'Invalid email format'
        })
      );
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toContainEqual(
        expect.objectContaining({
          message: 'Password is required'
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Login failed'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Logged out successfully'
      });
    });
  });
});