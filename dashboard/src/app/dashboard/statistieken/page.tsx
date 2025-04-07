'use client';

import { useState } from 'react';
import { useClientStats } from '@/hooks/useTracking';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { ClientSelect } from '@/components/ui/client-select';
import { StatsTable } from '@/components/dashboard/stats-table';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { ResponseStatsCard } from '@/components/dashboard/response-stats-card';
import { DateRange } from 'react-day-picker';

export default function StatisticsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const { stats, loading, error } = useClientStats(selectedClientId, {
    startDate: dateRange.from || new Date(),
    endDate: dateRange.to || new Date()
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const responseStats = {
    accepted: stats?.acceptedAppointments || 0,
    pending: stats?.pendingAppointments || 0,
    declined: stats?.cancelledAppointments || 0,
    total: stats?.totalAppointments || 0,
    acceptanceRate: stats?.acceptanceRate || 0,
    pendingRate: stats?.pendingRate || 0,
    declinedRate: stats?.cancellationRate || 0,
    averageResponseTime: stats?.averageResponseTime
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="flex gap-4">
          <ClientSelect
            value={selectedClientId}
            onChange={setSelectedClientId}
          />
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Appointment Statistics</h2>
          <StatsTable stats={stats} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Response Statistics</h2>
          <ResponseStatsCard 
            title={selectedClientId ? "Client Response Overview" : "Overall Response Overview"}
            stats={responseStats}
            showDetails={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Trends</h2>
        <StatsChart stats={stats} dateRange={dateRange} />
      </div>
    </div>
  );
}