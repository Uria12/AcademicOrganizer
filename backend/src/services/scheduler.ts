import cron from 'node-cron';
import reminderService from './reminderService';

class Scheduler {
  private reminderJob: cron.ScheduledTask | null = null;

  startReminderScheduler(): void {
    // Run every day at 9:00 AM
    this.reminderJob = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('⏰ Running daily reminder check...');
        await reminderService.checkAndSendReminders();
      } catch (error) {
        console.error('❌ Error in reminder scheduler:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('✅ Reminder scheduler started (daily at 9:00 AM UTC)');
  }

  stopReminderScheduler(): void {
    if (this.reminderJob) {
      this.reminderJob.stop();
      console.log('�� Reminder scheduler stopped');
    }
  }

  // For testing purposes - run immediately
  async runReminderCheckNow(): Promise<void> {
    try {
      console.log('🔍 Running immediate reminder check...');
      await reminderService.checkAndSendReminders();
    } catch (error) {
      console.error('❌ Error in immediate reminder check:', error);
    }
  }
}

export default new Scheduler(); 