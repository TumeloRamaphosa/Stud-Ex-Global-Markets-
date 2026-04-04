'use client';

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CategoryScore } from '@/lib/audit-types';

interface RadarChartProps {
  categories: CategoryScore[];
}

export default function RadarChart({ categories }: RadarChartProps) {
  const data = categories.map((cat) => ({
    subject: cat.name.split(' & ')[0].split(' ')[0], // Shorten labels
    fullName: cat.name,
    score: cat.score,
    fullMark: cat.maxScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
          }}
          formatter={(value: number, _name: string, props: { payload?: { fullName?: string } }) => [
            `${value}/10`,
            props.payload?.fullName || 'Score',
          ]}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
