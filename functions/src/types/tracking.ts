export interface TrackingEvent {
  id: string;
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 'appointment_completed' | 'appointment_response';
  clientId: string;
  appointmentId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DailyStats {
  date: string;
  appointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  accepted: number;
  pending: number;
  declined: number;
}

export interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageDuration: number;
  dailyStats: DailyStats[];
  appointmentTrend: number;
  clientTrend: number;
  completionTrend: number;
  durationTrend: number;
  // Response tracking
  acceptedAppointments: number;
  pendingAppointments: number;
  acceptanceRate: number;
  pendingRate: number;
  averageResponseTime?: number; // in hours
}

export interface OverallStats {
  totalClients: number;
  totalAppointments: number;
  totalAccepted: number;
  totalCancelled: number;
  totalPending: number;
  totalNoShow: number;
  overallAcceptanceRate: number;
  overallCancellationRate: number;
  overallPendingRate: number;
  overallNoShowRate: number;
  overallAverageResponseTime?: number; // in hours
} 