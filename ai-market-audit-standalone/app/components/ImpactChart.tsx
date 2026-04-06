'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ProjectedImpact } from '@/lib/audit-types';

interface ImpactChartProps {
  impacts: ProjectedImpact[];
}

export default function ImpactChart({ impacts }: ImpactChartProps) {
  const data = impacts.map((impact) => {
    const match = impact.conversionLift.match(/\d+/);
    const value = match ? parseInt(match[0]) : 5;
    return {
      name: impact.optimization.length > 20
        ? impact.optimization.slice(0, 18) + '...'
        : impact.optimization,
      fullName: impact.optimization,
      value,
      lift: impact.conversionLift,
      revenue: impact.revenueImpact,
    };
  });

  const colors: Record<string, string> = {
    'High': '#2ea043',
    'Medium': '#e6a01e',
    'Long-term': '#0ea5e9',
    'Prevents bounce': '#dc3c3c',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          label={{ value: 'Est. Lift %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
          }}
          formatter={(_value: number, _name: string, props: { payload?: { lift?: string; revenue?: string; fullName?: string } }) => [
            `${props.payload?.lift || ''} — ${props.payload?.revenue || ''} impact`,
            props.payload?.fullName || 'Optimization',
          ]}
          labelFormatter={() => ''}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colors[entry.revenue] || '#0ea5e9'} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
