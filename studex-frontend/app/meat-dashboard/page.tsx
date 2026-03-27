'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MeatDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#2a2420] flex flex-col">
      {/* Navigation bar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#322c28] border-b border-[rgba(255,220,180,0.18)]">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#e8c97a] hover:text-[#C9A84C] transition-colors font-mono text-sm"
        >
          <ArrowLeft size={16} />
          BACK TO COMMAND CENTRE
        </button>
        <div className="h-4 w-px bg-[rgba(255,220,180,0.18)]" />
        <span className="font-mono text-xs text-[rgba(255,240,215,0.38)] tracking-widest uppercase">
          Studex Meat — Agent Command Centre
        </span>
      </div>

      {/* Embedded dashboard */}
      <iframe
        src="/meat-command-centre.html"
        className="flex-1 w-full border-none"
        title="Studex Meat Agent Command Centre"
        style={{ minHeight: 'calc(100vh - 48px)' }}
      />
    </div>
  );
}
