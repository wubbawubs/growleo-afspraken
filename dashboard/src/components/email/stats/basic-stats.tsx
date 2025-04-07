'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmailStats } from '@/types/email';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BasicStatsProps {
  stats: EmailStats;
}

export function BasicStats({ stats }: BasicStatsProps) {
  const responseData = [
    { name: 'Accepted', value: stats.responses.accepted },
    { name: 'Declined', value: stats.responses.declined },
    { name: 'Pending', value: stats.responses.pending },
  ];

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Emails Sent</h3>
            <p className="text-2xl font-bold">{stats.totalSent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
            <p className="text-2xl font-bold">{formatTime(stats.averageResponseTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="text-2xl font-bold">
              {new Date(stats.lastUpdated).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Response Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 