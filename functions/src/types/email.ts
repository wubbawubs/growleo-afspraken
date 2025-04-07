export interface EmailSettings {
  id: string;
  provider: 'gmail' | 'smtp';
  email: string;
  name: string;
  isDefault: boolean;
  customTimeframes: TimeframeSettings;
  templates: Record<string, EmailTemplate>;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  subject: string;
  template: string;
  variables: string[];
}

export interface TimeframeSettings {
  reminder: number; // hours before appointment
  followup: number; // hours after appointment
  cancellationWindow: number; // hours before appointment
}

export interface EmailStats {
  totalSent: number;
  responses: {
    accepted: number;
    declined: number;
    pending: number;
  };
  averageResponseTime: number;
  lastUpdated: Date;
}

export interface EmailLog {
  appointmentId: string;
  clientId: string;
  type: string;
  sentAt: Date;
  recipient: string;
  subject: string;
  status: 'success' | 'failed';
  error?: string;
  responseStatus?: 'accepted' | 'declined' | 'pending';
  responseTime?: number;
}

export interface EmailSchedule {
  appointmentId: string;
  type: 'reminder' | 'followup' | 'cancellation' | 'confirmation';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export interface ResponseLog {
  appointmentId: string;
  timestamp: Date;
  status: string;
  source: 'calendar' | 'email' | 'manual';
  details?: any;
} 