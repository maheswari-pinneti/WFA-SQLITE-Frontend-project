import { AnalyticsData } from '../../api/analytics.api';

export interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}
