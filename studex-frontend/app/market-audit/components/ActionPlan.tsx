'use client';

import type { ActionWeek } from '@/lib/audit-types';
import { Calendar, CheckSquare, Square } from 'lucide-react';

interface ActionPlanProps {
  weeks: ActionWeek[];
}

export default function ActionPlan({ weeks }: ActionPlanProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {weeks.map((week) => (
        <div
          key={week.week}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-primary-600/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Calendar size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Week {week.week}</p>
              <h4 className="text-sm font-semibold text-white">{week.title}</h4>
            </div>
          </div>

          <div className="space-y-2.5">
            {week.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {item.completed ? (
                  <CheckSquare size={16} className="text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <Square size={16} className="text-gray-600 mt-0.5 shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
