export type ClientStatus = 'active' | 'inactive';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'cancelled';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  calendarIntegration: 'google' | 'outlook' | 'apple' | null;
  calendarSettings?: {
    type: string;
    apiKey?: string;
    calendarId?: string;
    clientId?: string;
    tenantId?: string;
    syncEnabled: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: string;
  };
  availableTimes?: string[];
  availableDays?: string[];
  lastAppointment?: string;
  nextAppointment?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: ClientStatus;
  appointments?: Appointment[];
  conversion?: number;
  statistics?: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    showUpRate: number;
  };
}