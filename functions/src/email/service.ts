import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import { EmailSettings, EmailSchedule, EmailLog } from '../types/email';
import { Appointment } from '../types/appointment';
import { generateResponseEmail } from './templates/response';

type ResponseStatus = 'accepted' | 'pending' | 'declined';

export class EmailService {
  private db = getFirestore();
  private gmail = google.gmail('v1');

  async sendEmail(
    appointment: Appointment,
    type: 'confirmation' | 'reminder' | 'followup' | 'cancellation' | 'status_update' | 'response',
    status?: ResponseStatus
  ): Promise<void> {
    const settings = await this.getDefaultEmailSettings();
    if (!settings) {
      throw new Error('No default email account configured');
    }

    let subject: string;
    let content: string;

    if (type === 'response' && status) {
      const template = this.getResponseTemplate(status);
      subject = template.subject;
      content = generateResponseEmail(appointment, status);
    } else {
      const template = this.getEmailTemplate(settings, type, status);
      subject = this.getEmailSubject(type, appointment, status);
      content = this.generateEmailContent(template, appointment, status);
    }

    if (settings.provider === 'gmail') {
      await this.sendGmailEmail(settings, appointment.prospectEmail, subject, content);
    } else {
      await this.sendSmtpEmail(settings, appointment.prospectEmail, subject, content);
    }

    await this.logEmail(appointment.id, type, appointment.prospectEmail, subject);
  }

  async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    await this.sendEmail(appointment, 'confirmation');
  }

  async sendReminderEmail(appointment: Appointment): Promise<void> {
    await this.sendEmail(appointment, 'reminder');
  }

  async sendFollowupEmail(appointment: Appointment): Promise<void> {
    await this.sendEmail(appointment, 'followup');
  }

  async sendCancellationEmail(appointment: Appointment): Promise<void> {
    await this.sendEmail(appointment, 'cancellation');
  }

  async sendStatusUpdateEmail(appointment: Appointment, status: string): Promise<void> {
    await this.sendEmail(appointment, 'status_update', status as ResponseStatus);
  }

  async scheduleEmails(appointment: Appointment): Promise<void> {
    const settings = await this.getDefaultEmailSettings();
    if (!settings) return;

    const date = appointment.date.toDate();
    const schedules: EmailSchedule[] = [
      {
        appointmentId: appointment.id,
        type: 'reminder',
        scheduledFor: new Date(date.getTime() - settings.customTimeframes.reminder * 60 * 60 * 1000),
        status: 'pending',
        attempts: 0,
      },
      {
        appointmentId: appointment.id,
        type: 'followup',
        scheduledFor: new Date(date.getTime() + settings.customTimeframes.followup * 60 * 60 * 1000),
        status: 'pending',
        attempts: 0,
      },
    ];

    const batch = this.db.batch();
    schedules.forEach(schedule => {
      const docRef = this.db.collection('emailSchedules').doc();
      batch.set(docRef, schedule);
    });

    await batch.commit();
  }

  private async getDefaultEmailSettings(): Promise<EmailSettings | null> {
    const snapshot = await this.db.collection('emailSettings')
      .where('isDefault', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as EmailSettings;
  }

  private getEmailTemplate(settings: EmailSettings, type: string, status?: string): string {
    const templateKey = status ? `${type}_${status}` : type;
    return settings.templates[templateKey]?.template || this.getDefaultTemplate(type, status);
  }

  private getEmailSubject(type: string, appointment: Appointment, status?: string): string {
    const baseSubject = `Appointment ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    return status ? `${baseSubject} - ${status.charAt(0).toUpperCase() + status.slice(1)}` : baseSubject;
  }

  private generateEmailContent(template: string, appointment: Appointment, status?: string): string {
    const date = appointment.date.toDate();
    return template
      .replace('{{title}}', appointment.title)
      .replace('{{date}}', date.toLocaleDateString())
      .replace('{{time}}', date.toLocaleTimeString())
      .replace('{{status}}', status || appointment.status)
      .replace('{{description}}', appointment.description || '');
  }

  private async sendGmailEmail(settings: EmailSettings, to: string, subject: string, content: string): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: settings.credentials?.accessToken,
      refresh_token: settings.credentials?.refreshToken,
    });

    const message = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      content,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await this.gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  }

  private async sendSmtpEmail(settings: EmailSettings, to: string, subject: string, content: string): Promise<void> {
    // Implement SMTP email sending logic here
    throw new Error('SMTP email sending not implemented');
  }

  private async logEmail(
    appointmentId: string,
    type: string,
    recipient: string,
    subject: string,
    error?: string
  ): Promise<void> {
    const log: EmailLog = {
      appointmentId,
      type,
      sentAt: new Date(),
      recipient,
      subject,
      status: error ? 'failed' : 'success',
      error,
    };

    await this.db.collection('emailLogs').add(log);
  }

  private getDefaultTemplate(type: string, status?: string): string {
    const templates: { [key: string]: string } = {
      confirmation: `
        <h2>Appointment Confirmation</h2>
        <p>Your appointment has been confirmed:</p>
        <ul>
          <li>Title: {{title}}</li>
          <li>Date: {{date}}</li>
          <li>Time: {{time}}</li>
        </ul>
        <p>{{description}}</p>
      `,
      reminder: `
        <h2>Appointment Reminder</h2>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li>Title: {{title}}</li>
          <li>Date: {{date}}</li>
          <li>Time: {{time}}</li>
        </ul>
        <p>{{description}}</p>
      `,
      followup: `
        <h2>Appointment Follow-up</h2>
        <p>Thank you for your appointment:</p>
        <ul>
          <li>Title: {{title}}</li>
          <li>Date: {{date}}</li>
          <li>Time: {{time}}</li>
        </ul>
        <p>{{description}}</p>
      `,
      cancellation: `
        <h2>Appointment Cancellation</h2>
        <p>Your appointment has been cancelled:</p>
        <ul>
          <li>Title: {{title}}</li>
          <li>Date: {{date}}</li>
          <li>Time: {{time}}</li>
        </ul>
        <p>{{description}}</p>
      `,
      status_update: `
        <h2>Appointment Status Update</h2>
        <p>Your appointment status has been updated to: {{status}}</p>
        <ul>
          <li>Title: {{title}}</li>
          <li>Date: {{date}}</li>
          <li>Time: {{time}}</li>
        </ul>
        <p>{{description}}</p>
      `,
    };

    const templateKey = status ? `${type}_${status}` : type;
    return templates[templateKey] || templates[type] || '';
  }

  private getResponseTemplate(status: ResponseStatus): { subject: string } {
    const templates: Record<ResponseStatus, { subject: string }> = {
      accepted: { subject: 'Looking forward to our meeting!' },
      pending: { subject: 'Please confirm your attendance' },
      declined: { subject: 'Thank you for your response' }
    };
    return templates[status] || templates.pending;
  }

  async sendResponseEmail(appointment: Appointment, responseStatus: ResponseStatus): Promise<void> {
    await this.sendEmail(appointment, 'response', responseStatus);
  }
} 