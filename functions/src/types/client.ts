export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  calendarCredentials?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  };
  calendarSettings?: {
    workingHours: {
      start: string; // Format: "HH:mm"
      end: string;   // Format: "HH:mm"
    };
    timezone: string;
    defaultDuration: number; // in minutes
  };
  statistics?: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    showUpRate: number; // percentage
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientCreateInput extends Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'statistics'> {
  // Add any additional fields specific to client creation
}

export interface ClientUpdateInput extends Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>> {
  // Add any additional fields specific to client updates
}

export interface ClientCalendarSettings {
  accessToken: string;
  refreshToken: string;
  expiryDate: FirebaseFirestore.Timestamp;
  calendarId: string;
  workingHours: {
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
  };
  timezone: string;
  defaultDuration: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  title: string;
  description: string;
  attendees: {
    email: string;
    name?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  startTime: FirebaseFirestore.Timestamp;
  endTime: FirebaseFirestore.Timestamp;
  status: 'scheduled' | 'cancelled' | 'completed';
  googleEventId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
} 