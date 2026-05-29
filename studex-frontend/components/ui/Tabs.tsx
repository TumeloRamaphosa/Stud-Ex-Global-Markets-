'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

export default function Tabs({
  items,
  activeTab,
  onTabChange,
  children,
  className,
}: TabsProps) {
  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-primary-100 mb-6 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 -mb-[2px]',
              activeTab === item.id
                ? 'border-b-primary-500 text-primary-700'
                : 'border-b-transparent text-slate-500 hover:text-slate-900'
            )}
          >
            {item.icon && item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}
