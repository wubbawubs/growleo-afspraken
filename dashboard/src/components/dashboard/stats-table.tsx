import { ClientStats } from '@/types/tracking';

interface StatsTableProps {
  stats: ClientStats | null;
}

export function StatsTable({ stats }: StatsTableProps) {
  if (!stats) return null;

  const rows = [
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
    },
    {
      label: 'Completed',
      value: stats.completedAppointments,
      percentage: stats.completionRate,
    },
    {
      label: 'Cancelled',
      value: stats.cancelledAppointments,
      percentage: stats.cancellationRate,
    },
    {
      label: 'No-show',
      value: stats.noShowAppointments,
      percentage: stats.noShowRate,
    },
    {
      label: 'Average Duration',
      value: `${stats.averageDuration} min`,
    },
  ];

  return (
    <div className="space-y-4">
      <table className="w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b">
              <td className="py-2 text-sm text-muted-foreground">{row.label}</td>
              <td className="py-2 text-sm font-medium text-right">
                {row.value}
                {row.percentage !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({row.percentage.toFixed(1)}%)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 