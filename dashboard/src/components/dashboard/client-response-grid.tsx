import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { ClientStats } from '@/types/tracking';

interface ClientResponseGridProps {
  clients?: Array<{
    id: string;
    name: string;
    stats: ClientStats;
  }>;
}

export function ClientResponseGrid({ clients = [] }: ClientResponseGridProps) {
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatTime = (hours?: number) => {
    if (!hours) return 'N/A';
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Client Response Statistics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{client.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                className="p-1"
              >
                {expandedClient === client.id ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{client.stats.acceptedAppointments}</span>
                  <Badge variant="success">{formatPercentage(client.stats.acceptanceRate)}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{client.stats.pendingAppointments}</span>
                  <Badge variant="warning">{formatPercentage(client.stats.pendingRate)}</Badge>
                </div>
              </div>
            </div>

            {expandedClient === client.id && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Appointments</span>
                    <span className="font-medium">{client.stats.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Average Response Time</span>
                    <span className="font-medium">{formatTime(client.stats.averageResponseTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="font-medium">{formatPercentage(client.stats.completionRate)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {client.stats.dailyStats.slice(-5).map((day) => (
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
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 