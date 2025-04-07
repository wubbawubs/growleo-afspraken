import { useState, useEffect } from 'react';
import { ClientStats } from '@/types/tracking';
import { TrackingService } from '@/services/api/tracking.service';

const trackingService = new TrackingService();

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function useClientStats(clientId: string, dateRange: DateRange) {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await trackingService.getClientStats(clientId, dateRange);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch client statistics'));
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchStats();
    }
  }, [clientId, dateRange.startDate, dateRange.endDate]);

  return { stats, loading, error };
}

export function useOverallStats(dateRange: DateRange) {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await trackingService.getOverallStats(dateRange);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch overall statistics'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange.startDate, dateRange.endDate]);

  return { stats, loading, error };
}

export function useTrackEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const trackEvent = async (event: {
    type: string;
    clientId: string;
    description: string;
    data?: any;
  }) => {
    try {
      setLoading(true);
      await trackingService.trackEvent(event);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to track event'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { trackEvent, loading, error };
} 