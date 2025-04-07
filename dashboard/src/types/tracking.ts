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

export interface ResponseStats {
  accepted: number;
  pending: number;
  declined: number;
  total: number;
  acceptanceRate: number;
  pendingRate: number;
  declinedRate: number;
  averageResponseTime?: number;
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
  averageResponseTime?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
} 