import { assignmentSchema } from '../../src/schemas/assignments';

describe('Assignment Schema', () => {
  it('should pass with valid input', () => {
    const result = assignmentSchema.safeParse({
      title: 'Mock assignment',
      deadline: '2025-07-01T12:00:00.000Z',
      status: 'pending',
    });
    expect(result.success).toBe(true);
  });

  it('should fail if title is missing', () => {
    const result = assignmentSchema.safeParse({
      deadline: '2025-07-01T12:00:00.000Z',
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });

  it('should fail if status is invalid', () => {
    const result = assignmentSchema.safeParse({
      title: 'Invalid status test',
      deadline: '2025-07-01T12:00:00.000Z',
      status: 'wrong-status',
    });
    expect(result.success).toBe(false);
  });
});
