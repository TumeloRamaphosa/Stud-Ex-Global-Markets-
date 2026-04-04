'use client';

import { useEffect, useState } from 'react';
import type { CategoryScore } from '@/lib/audit-types';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface CategoryScoresProps {
  categories: CategoryScore[];
}

export default function CategoryScores({ categories }: CategoryScoresProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Solid': return <CheckCircle size={16} className="text-green-400" />;
      case 'Needs Work': return <AlertCircle size={16} className="text-amber-400" />;
      case 'Critical': return <AlertTriangle size={16} className="text-red-400" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      'Solid': 'bg-green-900/30 text-green-300 border-green-700/30',
      'Needs Work': 'bg-amber-900/30 text-amber-300 border-amber-700/30',
      'Critical': 'bg-red-900/30 text-red-300 border-red-700/30',
    };
    return colors[priority] || '';
  };

  return (
    <div className="space-y-4">
      {categories.map((cat, i) => (
        <div
          key={cat.name}
          className="group"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPriorityIcon(cat.priority)}
              <span className="text-sm font-medium text-gray-200">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(cat.priority)}`}
              >
                {cat.priority}
              </span>
              <span className="text-sm font-bold text-white w-12 text-right">
                {cat.score}/{cat.maxScore}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animated ? `${(cat.score / cat.maxScore) * 100}%` : '0%',
                backgroundColor: cat.color,
                transitionDelay: `${i * 80}ms`,
                boxShadow: `0 0 12px ${cat.color}40`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
