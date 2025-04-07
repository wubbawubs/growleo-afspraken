import { getFirestore } from 'firebase-admin/firestore';
import { TrackingEvent, ClientStats } from '../types/tracking';

export class TrackingService {
  private db = getFirestore();

  async trackEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>) {
    await this.db.collection('tracking_events').add({
      ...event,
      timestamp: new Date()
    });
  }

  async getClientStats(clientId: string, startDate: Date, endDate: Date): Promise<ClientStats> {
    const appointmentsSnapshot = await this.db
      .collection('appointments')
      .where('clientId', '==', clientId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
    const total = appointments.length;
    const accepted = appointments.filter(a => a.status === 'accepted').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;
    
    // Calculate response times
    const responseTimes = appointments
      .filter(a => a.responseTime)
      .map(a => a.responseTime - a.createdAt);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length
      : undefined;

    // Calculate daily stats
    const dailyStats = this.calculateDailyStats(appointments);

    const stats: ClientStats = {
      totalAppointments: total,
      completedAppointments: accepted,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
      completionRate: total ? (accepted / total) * 100 : 0,
      cancellationRate: total ? (cancelled / total) * 100 : 0,
      noShowRate: total ? (noShow / total) * 100 : 0,
      averageDuration: 45, // Default duration in minutes
      dailyStats,
      appointmentTrend: 0, // Calculate based on previous period
      clientTrend: 0, // Calculate based on previous period
      completionTrend: 0, // Calculate based on previous period
      durationTrend: 0, // Calculate based on previous period
      // Response tracking
      acceptedAppointments: accepted,
      pendingAppointments: pending,
      acceptanceRate: total ? (accepted / total) * 100 : 0,
      pendingRate: total ? (pending / total) * 100 : 0,
      averageResponseTime: averageResponseTime ? averageResponseTime / (1000 * 60 * 60) : undefined // Convert to hours
    };

    return stats;
  }

  private calculateDailyStats(appointments: any[]): DailyStats[] {
    const dailyMap = new Map<string, DailyStats>();

    appointments.forEach(appointment => {
      const date = new Date(appointment.date).toISOString().split('T')[0];
      const current = dailyMap.get(date) || {
        date,
        appointments: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        accepted: 0,
        pending: 0,
        declined: 0
      };

      current.appointments++;
      if (appointment.status === 'completed') current.completed++;
      if (appointment.status === 'cancelled') current.cancelled++;
      if (appointment.status === 'no-show') current.noShow++;
      if (appointment.status === 'accepted') current.accepted++;
      if (appointment.status === 'pending') current.pending++;
      if (appointment.status === 'declined') current.declined++;

      dailyMap.set(date, current);
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getOverallStats(startDate: Date, endDate: Date) {
    const clientsSnapshot = await this.db.collection('clients').get();
    const stats = await Promise.all(
      clientsSnapshot.docs.map(doc => this.getClientStats(doc.id, startDate, endDate))
    );

    const totalClients = clientsSnapshot.size;
    const totalAppointments = stats.reduce((acc, curr) => acc + curr.totalAppointments, 0);
    const totalAccepted = stats.reduce((acc, curr) => acc + curr.acceptedAppointments, 0);
    const totalCancelled = stats.reduce((acc, curr) => acc + curr.cancelledAppointments, 0);
    const totalPending = stats.reduce((acc, curr) => acc + curr.pendingAppointments, 0);
    const totalNoShow = stats.reduce((acc, curr) => acc + curr.noShowAppointments, 0);

    // Calculate average response time across all clients
    const responseTimes = stats
      .map(s => s.averageResponseTime)
      .filter((t): t is number => t !== undefined);
    const overallAverageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length
      : undefined;

    return {
      totalClients,
      totalAppointments,
      totalAccepted,
      totalCancelled,
      totalPending,
      totalNoShow,
      overallAcceptanceRate: totalAppointments ? (totalAccepted / totalAppointments) * 100 : 0,
      overallCancellationRate: totalAppointments ? (totalCancelled / totalAppointments) * 100 : 0,
      overallPendingRate: totalAppointments ? (totalPending / totalAppointments) * 100 : 0,
      overallNoShowRate: totalAppointments ? (totalNoShow / totalAppointments) * 100 : 0,
      overallAverageResponseTime
    };
  }
} 