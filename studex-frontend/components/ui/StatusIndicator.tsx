'use client';

import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  active: { color: 'bg-green-500', label: 'Active' },
  inactive: { color: 'bg-gray-500', label: 'Inactive' },
  pending: { color: 'bg-amber-500', label: 'Pending' },
};

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          sizeClass,
          config.color,
          'rounded-full',
          status === 'active' && 'animate-pulse'
        )}
      />
      <span className="text-sm font-medium">
        {label || config.label}
      </span>
    </div>
  );
}
