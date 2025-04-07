export interface WorkingHours {
  monday?: { start: string; end: string; }[];
  tuesday?: { start: string; end: string; }[];
  wednesday?: { start: string; end: string; }[];
  thursday?: { start: string; end: string; }[];
  friday?: { start: string; end: string; }[];
  saturday?: { start: string; end: string; }[];
  sunday?: { start: string; end: string; }[];
}

export interface CalendarIntegration {
  type: 'google' | 'outlook' | 'apple';
  calendarId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: Date;
  syncEnabled: boolean;
}

export interface EmailIntegration {
  provider: string;
  settings: {
    apiKey?: string;
    domain?: string;
    fromEmail?: string;
    fromName?: string;
  };
}

export interface ClientStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  showUpRate: number;
  revenue?: number;
  lastAppointment?: Date;
  nextAppointment?: Date;
  // Tracking metrics
  averageResponseTime?: number;
  conversionRate?: number;
  clientSatisfaction?: number;
}

export interface ClientSettings {
  workingHours: WorkingHours;
  timezone: string;
  defaultDuration: number;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  appointmentTypes?: {
    id: string;
    name: string;
    duration: number;
    price?: number;
    color?: string;
  }[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  settings: ClientSettings;
  statistics: ClientStatistics;
  integrations: {
    calendar?: CalendarIntegration;
    email?: EmailIntegration;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientCreateInput extends Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'statistics'> {
  // Additional fields for client creation
}

export interface ClientUpdateInput extends Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>> {
  // Additional fields for client updates
}

export type ClientStatus = 'active' | 'inactive' | 'pending'; 