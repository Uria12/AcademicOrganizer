import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Validate environment variables
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing email environment variables: ${missingVars.join(', ')}`);
      console.warn(' Email service will be disabled');
      return;
    }

    const config: EmailConfig = {
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendDeadlineReminder(userEmail: string, assignmentTitle: string, deadline: Date): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('📧 Email service not configured, skipping reminder');
        return false;
      }

      const deadlineFormatted = deadline.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `⚠️ Deadline Reminder: ${assignmentTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">⚠️ Assignment Deadline Reminder</h2>
            <p>Hello!</p>
            <p>This is a friendly reminder that your assignment <strong>"${assignmentTitle}"</strong> is due <strong>tomorrow</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Assignment:</strong> ${assignmentTitle}</p>
              <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
            </div>
            <p>Please make sure to submit your assignment on time!</p>
            <p>Best regards,<br>Academic Organizer</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Reminder email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send reminder email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('📧 Email service not configured');
        return false;
      }
      
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService(); 