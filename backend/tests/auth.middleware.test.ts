import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth } from '../src/middleware/auth';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@prisma/client');

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as any;

// Mock PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'user-123' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { id: true, email: true }
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', async () => {
      mockRequest.headers = {};

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic invalid-format'
      };

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing after Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for invalid JWT token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for expired JWT token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token'
      };

      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found in database', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'non-existent-user' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token: user not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 for database errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'user-123' } as any);
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed JWT payload', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      // Mock JWT verification returning payload without userId
      mockJwt.verify.mockReturnValue({ invalidField: 'value' } as any);

      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: undefined },
        select: { id: true, email: true }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token: user not found'
      });
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate valid token and set user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'user-123' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when no header provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when header format is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Basic invalid-format'
      };

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'non-existent-user' } as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication on database errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockJwt.verify.mockReturnValue({ userId: 'user-123' } as any);
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});