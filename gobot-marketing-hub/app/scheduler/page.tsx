'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Bot,
  Plus,
  Filter,
  RefreshCw,
  Trash2,
  Database,
} from 'lucide-react';
import { PLATFORM_CONFIG, type BlotaPlatform, DEFAULT_SCHEDULE } from '@/lib/types';

const NAV_LINKS = [
  { href: '/content-hub', label: 'Content Hub' },
  { href: '/scheduler', label: 'Scheduler' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/automations', label: 'Automations' },
];

interface ScheduleRecord {
  id: string;
  fields: {
    Title: string;
    Status: string;
    Platforms: string;
    'Scheduled Date': string;
    'Scheduled Time': string;
    'Hook Text': string;
    'Hook Category': string;
    Caption: string;
  };
}

export default function SchedulerPage() {
  const [records, setRecords] = useState<ScheduleRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/airtable/content${params}`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [filter]);

  const handleDelete = async (recordId: string) => {
    try {
      await fetch(`/api/airtable/content?recordId=${recordId}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (recordId: string, status: string) => {
    try {
      await fetch('/api/airtable/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, Status: status }),
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, fields: { ...r.fields, Status: status } } : r))
      );
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const STATUS_STYLES: Record<string, string> = {
    Draft: 'bg-dark-700/50 text-dark-300',
    Scheduled: 'bg-brand-900/20 text-brand-400',
    Posted: 'bg-emerald-900/20 text-emerald-400',
    Failed: 'bg-rose-900/20 text-rose-400',
    Archived: 'bg-dark-700/50 text-dark-500',
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-brand-700/20 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
                <Bot size={20} className="text-dark-900" />
              </div>
              <span className="text-xl font-bold">Go<span className="text-brand-400">Bot</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    link.href === '/scheduler' ? 'text-brand-400 font-medium' : 'text-dark-400 hover:text-brand-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar size={28} className="text-accent-teal" />
              Content Scheduler
            </h1>
            <p className="text-dark-400 mt-1">Airtable-powered content calendar with n8n automation</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadRecords}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700/30 text-dark-400 hover:text-white transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/content-hub"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-gold text-dark-900 font-bold"
            >
              <Plus size={16} />
              New Post
            </Link>
          </div>
        </div>

        {/* Default Schedule Display */}
        <div className="card-glass rounded-xl p-6 mb-8">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-brand-400" />
            Daily Posting Schedule (n8n Automated)
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {DEFAULT_SCHEDULE.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-700/30">
                <div className="text-brand-400 font-bold font-mono">{slot.time}</div>
                <div>
                  <p className="text-sm font-medium">{slot.label}</p>
                  <p className="text-xs text-dark-500">
                    {slot.platforms.map((p) => PLATFORM_CONFIG[p].label).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'Draft', 'Scheduled', 'Posted', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-brand-900/30 text-brand-400 border border-brand-700/50'
                  : 'text-dark-400 bg-dark-800/50 border border-dark-700/30 hover:border-dark-600'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Records Table */}
        {records.length === 0 ? (
          <div className="card-glass rounded-xl p-16 text-center">
            <Database size={48} className="mx-auto text-dark-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">No records in Airtable</h2>
            <p className="text-dark-400 mb-4">
              Create content in the Content Hub to populate your Airtable calendar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="card-glass rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold truncate">{record.fields.Title || record.fields['Hook Text'] || 'Untitled'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[record.fields.Status] || STATUS_STYLES.Draft}`}>
                        {record.fields.Status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-dark-400">
                      {record.fields['Scheduled Date'] && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {record.fields['Scheduled Date']}
                        </span>
                      )}
                      {record.fields['Scheduled Time'] && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {record.fields['Scheduled Time']}
                        </span>
                      )}
                      {record.fields.Platforms && (
                        <span className="flex items-center gap-1">
                          <Send size={14} /> {record.fields.Platforms}
                        </span>
                      )}
                    </div>
                    {record.fields['Hook Text'] && (
                      <p className="text-sm text-dark-400 mt-2 truncate">{record.fields['Hook Text']}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {record.fields.Status === 'Draft' && (
                      <button
                        onClick={() => handleStatusChange(record.id, 'Scheduled')}
                        className="px-3 py-1.5 rounded-lg bg-brand-900/30 text-brand-400 text-xs font-medium hover:bg-brand-900/50 transition-all"
                      >
                        Schedule
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
