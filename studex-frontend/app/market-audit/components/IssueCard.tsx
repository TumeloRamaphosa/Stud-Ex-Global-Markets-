'use client';

import { useState } from 'react';
import type { CriticalIssue } from '@/lib/audit-types';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface IssueCardProps {
  issue: CriticalIssue;
  index: number;
}

export default function IssueCard({ issue, index }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }> = {
    critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'CRITICAL' },
    high: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'HIGH' },
    medium: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'MEDIUM' },
    low: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'LOW' },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-opacity-60`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left"
      >
        <div className={`mt-0.5 p-2 rounded-lg ${config.bg}`}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h4 className="text-white font-semibold text-base">{issue.title}</h4>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{issue.description}</p>
        </div>
        <div className="text-gray-500 mt-1">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 animate-fade-in">
          <div className="flex items-start gap-2 mb-3">
            <Zap size={16} className="text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gold-400 mb-1">Recommended Fix</p>
              <p className="text-sm text-gray-300">{issue.fix}</p>
            </div>
          </div>

          {issue.fixSteps && issue.fixSteps.length > 0 && (
            <div className="ml-6 mt-3 space-y-2">
              {issue.fixSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 font-mono mt-0.5 w-5">{i + 1}.</span>
                  <p className="text-sm text-gray-400">{step}</p>
                </div>
              ))}
            </div>
          )}

          {issue.impact && (
            <div className="mt-3 ml-6 px-3 py-2 rounded-lg bg-white/5">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Impact:</span> {issue.impact}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
