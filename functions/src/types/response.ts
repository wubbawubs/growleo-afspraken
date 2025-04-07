import { Timestamp } from 'firebase-admin/firestore';

export type ResponseStatus = 'accepted' | 'pending' | 'declined';

export interface ResponseHistory {
  status: ResponseStatus;
  timestamp: Timestamp;
  source: 'calendar' | 'email' | 'manual';
}

export interface ResponseTracking {
  appointmentId: string;
  currentStatus: ResponseStatus;
  responseHistory: ResponseHistory[];
  remindersSent: number;
  lastReminderSent: Timestamp;
  lastChecked: Timestamp;
  nextCheck: Timestamp;
  isActive: boolean;
}

export interface ReminderConfig {
  initialReminder: number; // hours before meeting
  followUpReminder: number; // hours after no response
  maxReminders: number; // maximum number of reminders
  responseTimeout: number; // hours to wait for response
}

export interface ResponseSettings {
  reminders: ReminderConfig;
  tracking: {
    enabled: boolean;
    storeHistory: boolean;
  };
} 