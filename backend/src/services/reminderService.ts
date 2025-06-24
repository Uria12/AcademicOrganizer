import { PrismaClient } from '@prisma/client';
import emailService from './emailService';

const prisma = new PrismaClient();

class ReminderService {
  async checkAndSendReminders(): Promise<void> {
    try {
      console.log('🔍 Checking for assignments due tomorrow...');
      
      // Get assignments due tomorrow that haven't had reminders sent
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Use raw query to avoid TypeScript issues until client is regenerated
      const assignments = await prisma.$queryRaw`
        SELECT 
          a.id, a.title, a.description, a.deadline, a.status, a."createdAt", a."userId",
          a."reminderSent", a."reminderSentAt",
          u.email as user_email
        FROM assignments a
        JOIN users u ON a."userId" = u.id
        WHERE a.deadline >= ${tomorrow}
        AND a.deadline < ${dayAfterTomorrow}
        AND a."reminderSent" = false
        AND a.status != 'completed'
      `;

      console.log(`📋 Found ${(assignments as any[]).length} assignments due tomorrow`);

      for (const assignment of assignments as any[]) {
        const userEmail = assignment.user_email;
        // Check if assignment was created less than 1 day before deadline
        const timeUntilDeadline = new Date(assignment.deadline).getTime() - new Date(assignment.createdAt).getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (timeUntilDeadline < oneDayInMs) {
          console.log(`⏰ Skipping reminder for "${assignment.title}" - created less than 1 day before deadline`);
          continue;
        }

        // Send reminder email
        const emailSent = await emailService.sendDeadlineReminder(
          userEmail,
          assignment.title,
          new Date(assignment.deadline)
        );

        if (emailSent) {
          // Mark reminder as sent using raw query
          await prisma.$executeRaw`
            UPDATE assignments 
            SET "reminderSent" = true, "reminderSentAt" = ${new Date()}
            WHERE id = ${assignment.id}
          `;
          
          console.log(`✅ Reminder sent for assignment: ${assignment.title}`);
        } else {
          console.log(`❌ Failed to send reminder for assignment: ${assignment.title}`);
        }
      }
    } catch (error) {
      console.error('❌ Error in reminder service:', error);
    }
  }

  async sendTestReminder(userEmail: string): Promise<boolean> {
    try {
      const testAssignment = {
        title: 'Test Assignment',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };

      return await emailService.sendDeadlineReminder(
        userEmail,
        testAssignment.title,
        testAssignment.deadline
      );
    } catch (error) {
      console.error('❌ Error sending test reminder:', error);
      return false;
    }
  }
}

export default new ReminderService(); 