import { CalendarEvent, CalendarAvailability, CalendarSettings } from '../types/calendar';

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