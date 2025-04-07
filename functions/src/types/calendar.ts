import { Timestamp } from 'firebase-admin/firestore';

// Google Calendar API types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  status?: string;
  htmlLink?: string;
  location?: string;
  created: string;
  updated: string;
}

// Internal calendar types
export interface CalendarEvent {
  id: string;
  appointmentId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
  status: 'confirmed' | 'cancelled';
  googleEventId?: string;
}

export interface CalendarAvailability {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

// OAuth gerelateerde settings
export interface CalendarOAuthSettings {
  accessToken: string;
  refreshToken: string;
  expiryDate: Timestamp;
  calendarId: string;
}

// Calendar operationele settings
export interface CalendarSettings {
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  defaultDuration: number;
}

// API Request/Response types
export interface CalendarCheckQuery {
  access_token: string;
}

export interface CalendarCallbackQuery {
  code: string;
}

export interface TimeSlotsQuery {
  access_token: string;
  date: string;
}

export interface CalendarCheckResponse {
  connected: boolean;
  calendars?: Array<{
    id: string;
    summary: string;
  }>;
  error?: string;
}

export interface CalendarConnectResponse {
  url: string;
}

export interface CalendarCallbackResponse {
  access_token: string;
  refresh_token: string;
  error?: string;
}

export interface TimeSlotsResponse {
  timeSlots: Array<{
    start: string;
    end: string;
  }>;
  error?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface AvailabilityRequest {
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
  settings: CalendarSettings;
}

// Update de CalendarService interface
export interface CalendarService {
  getAvailability(startTime: Date, endTime: Date): Promise<CalendarAvailability[]>;
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
  getEvent(id: string): Promise<CalendarEvent>;
  listEvents(startTime: Date, endTime: Date): Promise<CalendarEvent[]>;
  getSettings(): Promise<CalendarSettings>;
  updateSettings(settings: Partial<CalendarSettings>): Promise<CalendarSettings>;
}

export interface ClientCalendarSettings {
  accessToken: string;
  refreshToken: string;
  expiryDate: Timestamp;
  calendarId: string;
  workingHours: {
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
  };
  timezone: string;
  defaultDuration: number;
} 