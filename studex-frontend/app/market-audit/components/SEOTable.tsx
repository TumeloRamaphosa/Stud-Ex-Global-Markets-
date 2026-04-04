'use client';

import type { SEOItem } from '@/lib/audit-types';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface SEOTableProps {
  items: SEOItem[];
}

export default function SEOTable({ items }: SEOTableProps) {
  const statusConfig = {
    'good': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Good' },
    'needs-fix': { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Needs Fix' },
    'missing': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Missing' },
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="bg-white/[0.04]">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Element</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item, i) => {
            const cfg = statusConfig[item.status];
            const Icon = cfg.icon;
            return (
              <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-3.5">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <Icon size={12} />
                    {cfg.label}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-200">{item.issue}</td>
                <td className="px-5 py-3.5 text-sm text-gray-400">{item.fix}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
