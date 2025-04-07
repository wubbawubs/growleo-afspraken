import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import { EmailService } from '../email/service';
import { TrackingService } from '../tracking/service';
import { FirebaseAppointmentService } from '../appointment/service';
import { TrackingEvent } from '../types/tracking';
import { Client } from '../types/client';

type ResponseStatus = 'accepted' | 'pending' | 'declined';

interface EventResponse {
  eventId: string;
  attendeeEmail: string;
  responseStatus: ResponseStatus;
  updatedAt: Date;
}

export class CalendarMonitorService {
  private db = getFirestore();
  private calendar = google.calendar('v3');
  private emailService: EmailService;
  private trackingService: TrackingService;
  private appointmentService: FirebaseAppointmentService;

  constructor() {
    this.emailService = new EmailService();
    this.trackingService = new TrackingService();
    this.appointmentService = new FirebaseAppointmentService();
  }

  async checkAppointmentStatus(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentService.getAppointment(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Get client data
    const clientDoc = await this.db.collection('clients').doc(appointment.clientId).get();
    if (!clientDoc.exists) {
      throw new Error('Client not found');
    }
    const client = clientDoc.data() as Client;

    if (!client.calendarCredentials) {
      throw new Error('Client calendar not connected');
    }

    const auth = await this.getCalendarAuth(client.calendarCredentials);
    const event = await this.calendar.events.get({
      auth,
      calendarId: 'primary',
      eventId: appointment.googleEventId,
    });

    const responses = this.processAttendeeResponses(event.data.attendees || []);
    await this.updateAppointmentStatus(appointmentId, responses);
    await this.trackResponses(appointmentId, responses);
    await this.handleResponseEmails(appointmentId, responses);
  }

  private processAttendeeResponses(attendees: any[]): EventResponse[] {
    return attendees.map(attendee => ({
      eventId: attendee.eventId,
      attendeeEmail: attendee.email,
      responseStatus: this.mapGoogleResponseStatus(attendee.responseStatus),
      updatedAt: new Date(),
    }));
  }

  private mapGoogleResponseStatus(googleStatus: string): ResponseStatus {
    switch (googleStatus) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      default:
        return 'pending';
    }
  }

  private async updateAppointmentStatus(appointmentId: string, responses: EventResponse[]): Promise<void> {
    const mainAttendee = responses.find(r => r.attendeeEmail === responses[0].attendeeEmail);
    if (!mainAttendee) return;

    let status: 'scheduled' | 'cancelled' | 'completed';
    switch (mainAttendee.responseStatus) {
      case 'accepted':
        status = 'scheduled';
        break;
      case 'declined':
        status = 'cancelled';
        break;
      default:
        status = 'scheduled';
        break;
    }

    await this.appointmentService.updateAppointmentStatus(appointmentId, status);
  }

  private async trackResponses(appointmentId: string, responses: EventResponse[]): Promise<void> {
    const mainAttendee = responses.find(r => r.attendeeEmail === responses[0].attendeeEmail);
    if (!mainAttendee) return;

    const event: Omit<TrackingEvent, 'id'> = {
      type: 'appointment_updated',
      clientId: appointmentId,
      timestamp: new Date(),
      data: {
        appointmentId,
        responseStatus: mainAttendee.responseStatus,
        timestamp: mainAttendee.updatedAt,
      },
    };

    await this.trackingService.trackEvent(event);
  }

  private async handleResponseEmails(appointmentId: string, responses: EventResponse[]): Promise<void> {
    const mainAttendee = responses.find(r => r.attendeeEmail === responses[0].attendeeEmail);
    if (!mainAttendee) return;

    const appointment = await this.appointmentService.getAppointment(appointmentId);
    if (!appointment) return;

    await this.emailService.sendResponseEmail(appointment, mainAttendee.responseStatus);
  }

  private async getCalendarAuth(credentials: Client['calendarCredentials']): Promise<any> {
    if (!credentials?.accessToken || !credentials?.refreshToken) {
      throw new Error('Invalid calendar credentials');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    return oauth2Client;
  }

  async startMonitoring(appointmentId: string): Promise<void> {
    const docRef = this.db.collection('appointmentMonitoring').doc(appointmentId);
    await docRef.set({
      appointmentId,
      isActive: true,
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    });

    await this.checkAppointmentStatus(appointmentId);
  }

  async stopMonitoring(appointmentId: string): Promise<void> {
    const docRef = this.db.collection('appointmentMonitoring').doc(appointmentId);
    await docRef.update({
      isActive: false,
      stoppedAt: new Date(),
    });
  }
} 