'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = true,
  clickable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-primary-100 bg-white/85 backdrop-blur-md p-6 shadow-sm transition-all duration-300',
        hover && 'hover:border-primary-300 hover:shadow-lg',
        clickable && 'cursor-pointer hover:translate-y-[-2px]',
        className
      )}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}
