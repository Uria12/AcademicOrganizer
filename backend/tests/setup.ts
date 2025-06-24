// Mock environment variables for tests
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000); 