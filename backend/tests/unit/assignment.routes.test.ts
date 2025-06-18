import request from 'supertest';
import express from 'express';
import assignmentRoutes from '../../src/routes/assignments';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());

// ✅ Mock auth to inject test user ID
app.use((req: any, res, next) => {
  req.user = { id: '720827c0-dbae-49f5-bdc4-3a5b4467e475' };
  next();
});

app.use('/api/assignments', assignmentRoutes);
const prisma = new PrismaClient();

describe('Assignment API Routes', () => {
  let testAssignmentId: string;

  beforeAll(async () => {
    await prisma.assignment.deleteMany(); // clean slate
  });

  afterAll(async () => {
    await prisma.assignment.deleteMany(); // clean up after tests
    await prisma.$disconnect();
  });

  it('should create a new assignment', async () => {
    const res = await request(app).post('/api/assignments').send({
      title: 'Test Assignment',
      deadline: new Date().toISOString(),
      status: 'pending',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    testAssignmentId = res.body.id;
  });

  it('should get list of assignments', async () => {
    const res = await request(app).get('/api/assignments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update an assignment', async () => {
    const res = await request(app)
      .put(`/api/assignments/${testAssignmentId}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('should delete an assignment', async () => {
    const res = await request(app).delete(`/api/assignments/${testAssignmentId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should return 404 when deleting again', async () => {
    const res = await request(app).delete(`/api/assignments/${testAssignmentId}`);
    expect(res.status).toBe(404);
  });
});
