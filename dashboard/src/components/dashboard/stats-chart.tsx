import { ClientStats } from '@/types/tracking';
import { DateRange } from 'react-day-picker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatsChartProps {
  stats: ClientStats | null;
  dateRange: DateRange;
}

export function StatsChart({ stats, dateRange }: StatsChartProps) {
  if (!stats || !stats.dailyStats) return null;

  const data = stats.dailyStats.map((day) => ({
    date: new Date(day.date).toLocaleDateString(),
    appointments: day.appointments,
    completed: day.completed,
    cancelled: day.cancelled,
    noShow: day.noShow,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#8884d8"
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#82ca9d"
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="cancelled"
            stroke="#ff8042"
            name="Cancelled"
          />
          <Line
            type="monotone"
            dataKey="noShow"
            stroke="#ffc658"
            name="No-show"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 