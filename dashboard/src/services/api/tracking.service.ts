import { ClientStats } from '@/types/tracking';
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class TrackingService {
  private functions = getFunctions();

  async getClientStats(clientId: string, dateRange: DateRange): Promise<ClientStats> {
    const getClientStatsCallable = httpsCallable(this.functions, 'getClientStatsCallable');
    const result = await getClientStatsCallable({
      clientId,
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    });
    return result.data as ClientStats;
  }

  async getOverallStats(dateRange: DateRange): Promise<{
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
    overallAverageResponseTime?: number;
  }> {
    const getOverallStatsCallable = httpsCallable(this.functions, 'getOverallStatsCallable');
    const result = await getOverallStatsCallable({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    });
    return result.data as any;
  }

  async trackEvent(event: {
    type: string;
    clientId: string;
    appointmentId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const trackEventCallable = httpsCallable(this.functions, 'trackEventCallable');
    await trackEventCallable(event);
  }
} 