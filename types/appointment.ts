export interface Appointment {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  leadName: string;
  leadEmail: string;
  date: Date;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
} 