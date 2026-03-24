'use client';

import { ReactNode } from 'react';

interface HexMetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: { value: number; up: boolean };
  subtitle?: string;
}

export default function HexMetricCard({ label, value, icon, color, trend, subtitle }: HexMetricCardProps) {
  return (
    <div className="relative group">
      {/* Hex shape background */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl ${color}`}
      >
        {/* Hex pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`hex-${label}`} width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M14 17 L28 25 L28 41 L14 49 L0 41 L0 25 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#hex-${label})`} />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              {icon}
            </div>
            {trend && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend.up ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold mt-3">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm font-medium opacity-80 mt-1">{label}</div>
          {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
