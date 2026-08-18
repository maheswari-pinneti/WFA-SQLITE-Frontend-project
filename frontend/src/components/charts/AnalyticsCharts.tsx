import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AnalyticsChartContainer } from '../common/AnalyticsChartContainer';

type ChartRow = Record<string, string | number>;

interface BaseChartProps {
  title: string;
  subtitle?: string;
  data?: ChartRow[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: number;
}

interface Series {
  key: string;
  name: string;
  color: string;
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-secondary)',
  borderColor: 'var(--border-color)',
  borderRadius: '12px',
  color: 'var(--text-primary)'
};

export const AnalyticsLineChart: React.FC<BaseChartProps & { xKey: string; series: Series[] }> = ({
  title, subtitle, data = [], isLoading, error, onRetry, height = 260, xKey, series
}) => (
  <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data.length} onRetry={onRetry} minHeight={height + 100}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey={xKey} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
        {series.map((item) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={3} dot={{ r: 3 }} />)}
      </LineChart>
    </ResponsiveContainer>
  </AnalyticsChartContainer>
);

export const AnalyticsBarChart: React.FC<BaseChartProps & { xKey: string; series: Series[]; layout?: 'horizontal' | 'vertical' }> = ({
  title, subtitle, data = [], isLoading, error, onRetry, height = 260, xKey, series, layout = 'horizontal'
}) => (
  <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data.length} onRetry={onRetry} minHeight={height + 100}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout === 'vertical' ? 'vertical' : 'horizontal'} margin={{ top: 12, right: 12, left: layout === 'vertical' ? 36 : -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        {layout === 'vertical' ? <><XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11 }} /><YAxis dataKey={xKey} type="category" width={110} stroke="var(--text-muted)" tick={{ fontSize: 10 }} /></> : <><XAxis dataKey={xKey} stroke="var(--text-muted)" tick={{ fontSize: 10 }} /><YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} /></>}
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
        {series.map((item) => <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[6, 6, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  </AnalyticsChartContainer>
);

export const AnalyticsDonutChart: React.FC<BaseChartProps & { nameKey?: string; valueKey?: string; colors?: string[] }> = ({
  title, subtitle, data = [], isLoading, error, onRetry, height = 260, nameKey = 'name', valueKey = 'value', colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
}) => (
  <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data.length} onRetry={onRetry} minHeight={height + 100}>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={58} outerRadius={88} paddingAngle={3} cx="50%" cy="45%">
          {data.map((_, index) => <Cell key={`slice-${index}`} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: '10px', color: 'var(--text-muted)' }} />
      </PieChart>
    </ResponsiveContainer>
  </AnalyticsChartContainer>
);
