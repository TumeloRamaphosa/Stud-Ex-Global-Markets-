'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'primary',
  className,
  size = 'md',
}: BadgeProps) {
  const variants = {
    primary: 'bg-primary-900/50 text-primary-200',
    success: 'bg-green-900/50 text-green-200',
    warning: 'bg-amber-900/50 text-amber-200',
    error: 'bg-red-900/50 text-red-200',
    info: 'bg-cyan-900/50 text-cyan-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
