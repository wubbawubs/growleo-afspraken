import { Timestamp } from 'firebase-admin/firestore';

export interface AppointmentCreateInput {
  clientId: string;
  prospectEmail: string;
  date: string;
  title: string;
  description: string;
  attendees: {
    email: string;
    name: string;
  }[];
}

export interface Appointment {
  id: string;
  clientId: string;
  prospectEmail: string;
  date: Timestamp;
  title: string;
  description: string;
  attendees: {
    email: string;
    name: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  status: 'scheduled' | 'cancelled' | 'completed';
  googleEventId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AppointmentUpdateInput {
  title?: string;
  description?: string;
  date?: Date;
  status?: 'scheduled' | 'cancelled' | 'completed';
  attendees?: {
    email: string;
    name?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
} 