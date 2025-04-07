import * as admin from 'firebase-admin';
import { AppointmentService } from './types';
import { Appointment, AppointmentCreateInput, AppointmentUpdateInput } from '../types/appointment';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { CalendarService } from '../calendar/service';
import { EmailService } from '../email/service';
import { TrackingService } from '../tracking/service';
import { getClientCalendarCredentials } from '../calendar/oauth';

export class FirebaseAppointmentService implements AppointmentService {
  private db: Firestore;
  private calendarService: CalendarService;
  private emailService: EmailService;
  private trackingService: TrackingService;

  constructor() {
    this.db = getFirestore();
    this.calendarService = new CalendarService();
    this.emailService = new EmailService();
    this.trackingService = new TrackingService();
  }

  async createAppointment(data: AppointmentCreateInput): Promise<Appointment> {
    try {
      const appointmentData: Omit<Appointment, 'id'> = {
        ...data,
        attendees: data.attendees.map(attendee => ({
          ...attendee,
          name: attendee.name || attendee.email.split('@')[0],
          responseStatus: 'needsAction'
        })),
        status: 'scheduled',
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await this.db.collection('appointments').add(appointmentData);

      // 2. Get client's calendar credentials
      const credentials = await getClientCalendarCredentials(data.clientId);
      if (!credentials) {
        throw new Error('Client calendar not connected');
      }

      // 3. Create calendar event
      const calendarEvent = await this.calendarService.createEvent({
        appointmentId: docRef.id,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        attendees: data.attendees.map(a => a.email)
      }, credentials);

      // 4. Update appointment with calendar event ID
      await docRef.update({
        googleEventId: calendarEvent.id,
        updatedAt: Timestamp.now()
      });

      // 5. Send confirmation emails
      await this.emailService.sendAppointmentConfirmation({
        ...appointmentData,
        id: docRef.id,
        googleEventId: calendarEvent.id
      });

      // 6. Track the event
      await this.trackingService.trackEvent({
        type: 'appointment_created',
        clientId: data.clientId,
        description: `Appointment created: ${data.title}`,
        data: {
          appointmentId: docRef.id,
          startTime: data.startTime,
          endTime: data.endTime
        }
      });

      return { id: docRef.id, ...appointmentData, googleEventId: calendarEvent.id };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    const doc = await this.db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      throw new Error('Appointment not found');
    }
    return { id: doc.id, ...doc.data() } as Appointment;
  }

  async updateAppointment(id: string, data: AppointmentUpdateInput): Promise<Appointment> {
    await this.db.collection('appointments').doc(id).update({
      ...data,
      updatedAt: Timestamp.now(),
    });
    return this.getAppointment(id);
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.db.collection('appointments').doc(id).delete();
  }

  async getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    const snapshot = await this.db
      .collection('appointments')
      .where('clientId', '==', clientId)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const snapshot = await this.db
      .collection('appointments')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  }

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<Appointment> {
    try {
      const appointmentRef = this.db.collection('appointments').doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();
      
      if (!appointmentDoc.exists) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentDoc.data() as Appointment;
      const oldStatus = appointment.status;

      // Update appointment status
      await appointmentRef.update({
        status,
        updatedAt: Timestamp.now()
      });

      // Update calendar event if needed
      if (appointment.googleEventId) {
        const credentials = await getClientCalendarCredentials(appointment.clientId);
        if (credentials) {
          await this.calendarService.updateEventStatus(
            appointment.googleEventId,
            status,
            credentials
          );
        }
      }

      // Send status update email
      await this.emailService.sendAppointmentStatusUpdate({
        ...appointment,
        status
      });

      // Track the status change
      await this.trackingService.trackEvent({
        type: 'appointment_status_changed',
        clientId: appointment.clientId,
        description: `Appointment status changed from ${oldStatus} to ${status}`,
        data: {
          appointmentId,
          oldStatus,
          newStatus: status
        }
      });

      return {
        ...appointment,
        status,
        updatedAt: Timestamp.now()
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async listAppointments(clientId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    let query = this.db.collection('appointments')
      .where('clientId', '==', clientId)
      .orderBy('startTime', 'desc');

    if (startDate) {
      query = query.where('startTime', '>=', Timestamp.fromDate(startDate));
    }
    if (endDate) {
      query = query.where('startTime', '<=', Timestamp.fromDate(endDate));
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Appointment);
  }
} 