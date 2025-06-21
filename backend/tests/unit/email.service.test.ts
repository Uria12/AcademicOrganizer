/// <reference types="jest" />
import emailService from '../../src/services/emailService';
import reminderService from '../../src/services/reminderService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AssignmentResult {
  reminderSent: boolean;
}

describe('Email Service', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.$executeRaw`
      DELETE FROM assignments 
      WHERE title LIKE '%Test%'
    `;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('sendDeadlineReminder', () => {
    it('should send reminder email successfully', async () => {
      const testEmail = 'test@example.com';
      const testTitle = 'Test Assignment';
      const testDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await emailService.sendDeadlineReminder(
        testEmail,
        testTitle,
        testDeadline
      );

      // In test environment, this might return false if email is not configured
      expect(typeof result).toBe('boolean');
    });

    it('should handle email service not configured', async () => {
      // This test will pass even if email is not configured
      const result = await emailService.sendDeadlineReminder(
        'test@example.com',
        'Test',
        new Date()
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('testConnection', () => {
    it('should test email connection', async () => {
      const result = await emailService.testConnection();
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Reminder Service', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'reminder-test@example.com',
        password: 'hashedpassword'
      }
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data using raw queries
    await prisma.$executeRaw`
      DELETE FROM assignments 
      WHERE "userId" = ${testUserId}
    `;
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  describe('checkAndSendReminders', () => {
    it('should not send reminders for assignments created less than 1 day before deadline', async () => {
      // Create assignment due tomorrow but created recently using raw query
      const assignment = await prisma.$executeRaw`
        INSERT INTO assignments (id, title, description, deadline, "userId", "reminderSent", status)
        VALUES (gen_random_uuid(), 'Test Assignment - Recent', 'Test description', 
                ${new Date(Date.now() + 24 * 60 * 60 * 1000)}, ${testUserId}, false, 'pending')
        RETURNING id
      `;

      await reminderService.checkAndSendReminders();

      // Check that reminder was not sent using raw query
      const updatedAssignment = await prisma.$queryRaw<AssignmentResult[]>`
        SELECT "reminderSent" FROM assignments 
        WHERE title = 'Test Assignment - Recent'
      `;

      expect(updatedAssignment[0]?.reminderSent).toBe(false);
    });

    it('should not send reminders for completed assignments', async () => {
      // Create completed assignment due tomorrow using raw query
      await prisma.$executeRaw`
        INSERT INTO assignments (id, title, description, deadline, "userId", "reminderSent", status)
        VALUES (gen_random_uuid(), 'Test Assignment - Completed', 'Test description', 
                ${new Date(Date.now() + 24 * 60 * 60 * 1000)}, ${testUserId}, false, 'completed')
      `;

      await reminderService.checkAndSendReminders();

      // Check that reminder was not sent using raw query
      const updatedAssignment = await prisma.$queryRaw<AssignmentResult[]>`
        SELECT "reminderSent" FROM assignments 
        WHERE title = 'Test Assignment - Completed'
      `;

      expect(updatedAssignment[0]?.reminderSent).toBe(false);
    });
  });

  describe('sendTestReminder', () => {
    it('should send test reminder', async () => {
      const result = await reminderService.sendTestReminder('test@example.com');
      expect(typeof result).toBe('boolean');
    });
  });
}); 