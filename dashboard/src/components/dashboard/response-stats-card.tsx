import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { ClientStats } from '@/types/tracking';

interface ResponseStatsCardProps {
  stats: ClientStats;
  title?: string;
}

export function ResponseStatsCard({ stats, title = 'Response Statistics' }: ResponseStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatTime = (hours?: number) => {
    if (!hours) return 'N/A';
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Accepted</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.acceptedAppointments}</span>
            <Badge variant="success">{formatPercentage(stats.acceptanceRate)}</Badge>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pending</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.pendingAppointments}</span>
            <Badge variant="warning">{formatPercentage(stats.pendingRate)}</Badge>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Declined</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {stats.totalAppointments - stats.acceptedAppointments - stats.pendingAppointments}
            </span>
            <Badge variant="destructive">
              {formatPercentage(100 - stats.acceptanceRate - stats.pendingRate)}
            </Badge>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg Response Time</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatTime(stats.averageResponseTime)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Daily Breakdown</h4>
          <div className="space-y-2">
            {stats.dailyStats.map((day) => (
              <div key={day.date} className="flex items-center justify-between text-sm">
                <span>{new Date(day.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <span className="text-green-600">+{day.accepted}</span>
                  <span className="text-yellow-600">{day.pending}</span>
                  <span className="text-red-600">-{day.declined}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 