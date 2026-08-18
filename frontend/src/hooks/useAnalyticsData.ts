import { useCallback, useEffect, useState } from 'react';
import { analyticsApi, AnalyticsData } from '../api/endpoints/analytics.api';

export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await analyticsApi.getAnalytics());
    } catch (err: any) {
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { data, isLoading, error, reload };
};
