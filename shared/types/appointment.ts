export interface Appointment {
  id: string;
  clientId: string;
  prospectEmail: string;
  date: string; // ISO string format
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  calendarEventId?: string;
}

export interface AppointmentCreateInput {
  clientId: string;
  prospectEmail: string;
  date: string; // ISO string format
}

export interface AppointmentUpdateInput {
  status?: 'pending' | 'confirmed' | 'cancelled';
  date?: string; // ISO string format
} 