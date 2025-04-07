import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { calendar_v3 } from '@googleapis/calendar';
import { oauth2Client } from '../config/google';
import { CalendarService } from './types';
import { 
  CalendarEvent,
  CalendarAvailability, 
  CalendarSettings,
  CalendarOAuthSettings,
  ClientCalendarSettings
} from '../types/calendar';
import * as admin from 'firebase-admin';
import { getCalendarSettings, getCalendarOAuthSettings } from './settings';
import { Appointment } from '../types/appointment';
import { Timestamp } from 'firebase-admin/firestore';
import { EmailService } from '../email/service';

export class FirebaseCalendarService implements CalendarService {
  private db: Firestore;
  private calendar: calendar_v3.Calendar;
  private emailService: EmailService;

  constructor() {
    this.db = getFirestore();
    this.calendar = new calendar_v3.Calendar({ auth: oauth2Client });
    this.emailService = new EmailService();
  }

  async getEvents(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    const events = await this.db
      .collection('calendar_events')
      .where('startTime', '>=', startTime)
      .where('endTime', '<=', endTime)
      .get();

    return events.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const docRef = await this.db.collection('calendar_events').add(event);
    return {
      id: docRef.id,
      ...event
    };
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    const doc = await this.db.collection('calendar_events').doc(id).get();
    if (!doc.exists) {
      throw new Error('Event not found');
    }
    const data = doc.data();
    return { 
      id: doc.id, 
      appointmentId: data?.appointmentId,
      title: data?.title,
      description: data?.description,
      startTime: data?.startTime?.toDate(),
      endTime: data?.endTime?.toDate(),
      location: data?.location,
      attendees: data?.attendees,
      status: data?.status,
    } as CalendarEvent;
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await this.db.collection('calendar_events').doc(id).update(event);
    return this.getEvent(id);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.db.collection('calendar_events').doc(eventId).delete();
  }

  async getAvailability(startTime: Date, endTime: Date): Promise<CalendarAvailability[]> {
    try {
      // Get calendar settings
      const settings = await getCalendarSettings() || {
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'Europe/Amsterdam',
        defaultDuration: 60
      };

      // Get OAuth settings
      const oauthSettings = await getCalendarOAuthSettings();
      
      // Check if we're using mock credentials
      const isMockCredentials = oauthSettings?.accessToken === 'mock_access_token';
      console.log('Availability check:', { 
        startTime, 
        endTime, 
        isMockCredentials,
        hasOAuthSettings: !!oauthSettings 
      });

      // If using mock credentials, return test data
      if (isMockCredentials) {
        console.log('Using mock data for availability');
        const slots: CalendarAvailability[] = [];
        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
          const hour = currentTime.getHours();
          if (hour >= 9 && hour < 17) {  // Working hours
            slots.push({
              startTime: new Date(currentTime),
              endTime: new Date(currentTime.getTime() + settings.defaultDuration * 60000),
              isAvailable: true
            });
          }
          currentTime = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
        }

        return slots;
      }

      // Real implementation for production
      if (!oauthSettings) {
        throw new Error('Calendar not connected. Please connect Google Calendar first.');
      }

      oauth2Client.setCredentials({
        access_token: oauthSettings.accessToken,
        refresh_token: oauthSettings.refreshToken,
        expiry_date: oauthSettings.expiryDate.toDate().getTime()
      });

      const events = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      // Generate available slots
      const slots: CalendarAvailability[] = [];
      let currentTime = new Date(startTime);
      
      while (currentTime < endTime) {
        const hour = currentTime.getHours();
        if (hour >= 9 && hour < 17) {  // Working hours
          const slotEnd = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
          
          const isAvailable = !events.data.items?.some(event => {
            const eventStart = new Date(event.start?.dateTime || '');
            const eventEnd = new Date(event.end?.dateTime || '');
            return (
              (currentTime >= eventStart && currentTime < eventEnd) ||
              (slotEnd > eventStart && slotEnd <= eventEnd)
            );
          });

          if (isAvailable) {
            slots.push({
              startTime: new Date(currentTime),
              endTime: slotEnd,
              isAvailable: true
            });
          }
        }
        currentTime = new Date(currentTime.getTime() + settings.defaultDuration * 60000);
      }

      return slots;
    } catch (error) {
      console.error('Error in getAvailability:', error);
      throw error;
    }
  }

  async getSettings(): Promise<CalendarSettings> {
    const settings = await getCalendarSettings();
    if (!settings) {
      // Return default settings als er nog geen zijn opgeslagen
      return {
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        timezone: 'Europe/Amsterdam',
        defaultDuration: 60
      };
    }
    return settings;
  }

  async updateSettings(settings: Partial<CalendarSettings>): Promise<CalendarSettings> {
    await this.db.collection('calendar_settings').doc('default').set({
      ...settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return this.getSettings();
  }

  private async createEventGoogle(event: CalendarEvent): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'Europe/Amsterdam',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'Europe/Amsterdam',
          },
          location: event.location,
          attendees: event.attendees.map((email: string) => ({ email })),
          status: event.status,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEventGoogle(eventId: string, event: Partial<CalendarEvent>): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: event.startTime ? {
            dateTime: event.startTime.toISOString(),
            timeZone: 'Europe/Amsterdam',
          } : undefined,
          end: event.endTime ? {
            dateTime: event.endTime.toISOString(),
            timeZone: 'Europe/Amsterdam',
          } : undefined,
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
          status: event.status,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEventGoogle(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async getEventGoogle(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw error;
    }
  }

  async listEventsGoogle(timeMin: Date, timeMax: Date): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw error;
    }
  }

  async listEvents(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    try {
      const eventsRef = this.db.collection('events');
      const q = eventsRef.where('startTime', '>=', startTime)
                        .where('startTime', '<=', endTime)
                        .orderBy('startTime', 'asc');
      
      const snapshot = await q.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
    } catch (error) {
      console.error('Error listing events:', error);
      throw new Error('Failed to list events');
    }
  }

  private async getClientCalendarSettings(clientId: string): Promise<ClientCalendarSettings | null> {
    const doc = await this.db.collection('clients').doc(clientId).get();
    if (!doc.exists) return null;
    return doc.data()?.calendarSettings || null;
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'googleEventId' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      const oauthSettings = await getCalendarOAuthSettings();
      const isMockCredentials = oauthSettings?.accessToken === 'mock_access_token';

      if (isMockCredentials) {
        const mockEventId = `mock-event-${Date.now()}`;
        const newAppointment: Appointment = {
          ...appointmentData,
          id: mockEventId,
          googleEventId: mockEventId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        await this.db.collection('appointments').doc(newAppointment.id).set(newAppointment);
        return newAppointment;
      }

      // Rest of the production code...
      throw new Error('Not implemented');  // Temporary return for non-mock case
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointmentStatus(appointmentId: string): Promise<Appointment> {
    try {
      // Get appointment from Firestore
      const appointmentDoc = await this.db.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentDoc.data() as Appointment;

      // Get OAuth settings
      const oauthSettings = await getCalendarOAuthSettings();
      
      // Check if we're using mock credentials
      const isMockCredentials = oauthSettings?.accessToken === 'mock_access_token';
      console.log('Getting appointment status:', { 
        appointmentId,
        isMockCredentials,
        hasOAuthSettings: !!oauthSettings 
      });

      // If using mock credentials, return test data
      if (isMockCredentials) {
        console.log('Using mock data for appointment status');
        return {
          ...appointment,
          attendees: appointment.attendees.map(attendee => ({
            ...attendee,
            responseStatus: 'needsAction'  // Default status for test
          }))
        };
      }

      // Production code...
      const clientSettings = await this.getClientCalendarSettings(appointment.clientId);
      if (!clientSettings) {
        throw new Error('Client calendar not connected');
      }

      oauth2Client.setCredentials({
        access_token: clientSettings.accessToken,
        refresh_token: clientSettings.refreshToken,
        expiry_date: clientSettings.expiryDate.toDate().getTime()
      });

      const event = await this.calendar.events.get({
        calendarId: clientSettings.calendarId,
        eventId: appointment.googleEventId!
      });

      const updatedAttendees = event.data.attendees?.map(a => ({
        email: a.email || '',
        name: a.displayName || a.email?.split('@')[0] || 'Unknown',
        responseStatus: (a.responseStatus || 'needsAction') as 'needsAction' | 'declined' | 'tentative' | 'accepted'
      })) || [];

      const updatedAppointment: Appointment = {
        ...appointment,
        attendees: updatedAttendees,
        updatedAt: Timestamp.now()
      };

      await this.db.collection('appointments').doc(appointmentId).update({
        attendees: updatedAttendees,
        updatedAt: Timestamp.now()
      });

      const oldStatus = appointment.attendees[0].responseStatus;
      const newStatus = updatedAppointment.attendees[0].responseStatus;
      const statusChanged = oldStatus !== newStatus;

      if (statusChanged) {
        await this.emailService.sendAppointmentFollowup(updatedAppointment);
      }

      return updatedAppointment;
    } catch (error) {
      console.error('Error getting appointment status:', error);
      throw error;
    }
  }
}

export const calendarService = new FirebaseCalendarService(); 