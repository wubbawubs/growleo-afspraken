'use client';

import { useState, useEffect, Suspense } from 'react';
import { ResponseStatsCard } from '@/components/dashboard/response-stats-card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ClientResponseGrid } from '@/components/dashboard/client-response-grid';
import { TrackingService, DateRange } from '@/services/api/tracking.service';
import { ClientStats } from '@/types/tracking';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name: string; stats: ClientStats }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const trackingService = new TrackingService();
        
        // Fetch overall stats
        const overall = await trackingService.getOverallStats(dateRange);
        setOverallStats(overall);
        
        // For demo purposes, we'll use a single client ID
        // In a real app, you would fetch all clients and their stats
        const clientId = 'demo-client-id';
        const stats = await trackingService.getClientStats(clientId, dateRange);
        setClientStats(stats);
        
        // Mock client data for the grid
        setClients([
          {
            id: clientId,
            name: 'Demo Client',
            stats
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Appointments"
          value={overallStats?.totalAppointments || 0}
          description="Last 30 days"
          trend={overallStats?.totalAppointments > 0 ? 5 : 0}
        />
        <StatsCard
          title="Acceptance Rate"
          value={`${overallStats?.overallAcceptanceRate.toFixed(1) || 0}%`}
          description="Last 30 days"
          trend={overallStats?.overallAcceptanceRate > 50 ? 5 : -5}
        />
        <StatsCard
          title="Average Response Time"
          value={overallStats?.overallAverageResponseTime ? `${overallStats.overallAverageResponseTime.toFixed(1)}h` : 'N/A'}
          description="Last 30 days"
          trend={overallStats?.overallAverageResponseTime && overallStats.overallAverageResponseTime < 24 ? 5 : -5}
        />
        <StatsCard
          title="Active Clients"
          value={overallStats?.totalClients || 0}
          description="Last 30 days"
          trend={overallStats?.totalClients > 0 ? 5 : 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {clientStats && <ResponseStatsCard stats={clientStats} />}
        <Suspense fallback={<div>Loading activity...</div>}>
          <ActivityFeed />
        </Suspense>
      </div>

      <ClientResponseGrid clients={clients} />
    </div>
  );
}