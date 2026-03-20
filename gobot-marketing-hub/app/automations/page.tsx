'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Zap,
  Bot,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  Send,
  Database,
  Workflow,
  Terminal,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/content-hub', label: 'Content Hub' },
  { href: '/scheduler', label: 'Scheduler' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/automations', label: 'Automations' },
];

interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  schedule: string;
  icon: React.ReactNode;
  active: boolean;
  file: string;
}

const WORKFLOWS: WorkflowInfo[] = [
  {
    id: 'scheduled-posting',
    name: 'Scheduled Content Posting',
    description: 'Posts content from Airtable at 07:30, 16:30, and 21:00 daily via Blotato API. Reads from Content Calendar, posts to configured platforms, logs results.',
    schedule: '07:30 / 16:30 / 21:00 daily',
    icon: <Send size={20} className="text-brand-400" />,
    active: false,
    file: 'n8n-workflows/scheduled-posting.json',
  },
  {
    id: 'daily-analytics',
    name: 'Daily Analytics Collection',
    description: 'Collects platform analytics from Blotato accounts at 7 AM, saves snapshots to Airtable Analytics table, analyzes recent posts, and generates diagnostic reports.',
    schedule: '07:00 daily',
    icon: <BarChart3 size={20} className="text-accent-violet" />,
    active: false,
    file: 'n8n-workflows/daily-analytics.json',
  },
];

interface LogEntry {
  id: string;
  fields: {
    'Action Type': string;
    'Action Details': string;
    Status: string;
    'Triggered By': string;
    'Triggered At': string;
    'Error Message'?: string;
  };
}

export default function AutomationsPage() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      // Attempt to load automation logs from Airtable
      const res = await fetch('/api/airtable/content?action=logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.records || []);
      }
    } catch {
      // Logs table may not exist yet
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleToggleWorkflow = async (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    if (!workflow) return;

    try {
      await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: workflow.active ? 'deactivate' : 'activate',
          workflowId,
        }),
      });

      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, active: !w.active } : w))
      );

      toast.success(`Workflow ${workflow.active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to toggle workflow. Check n8n connection.');
    }
  };

  const handleTriggerManually = async (workflowId: string) => {
    setTriggeringWorkflow(workflowId);
    try {
      await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', workflowId }),
      });
      toast.success('Workflow triggered manually!');
    } catch {
      toast.error('Failed to trigger. Check n8n connection.');
    } finally {
      setTriggeringWorkflow(null);
    }
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
                    link.href === '/automations' ? 'text-brand-400 font-medium' : 'text-dark-400 hover:text-brand-400'
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap size={28} className="text-accent-emerald" />
            Automations
          </h1>
          <p className="text-dark-400 mt-1">n8n workflows for automated posting, analytics, and reporting</p>
        </div>

        {/* Connection Status */}
        <div className="card-glass rounded-xl p-5 mb-8">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Terminal size={18} className="text-brand-400" />
            Integration Status
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
              <Send size={18} className="text-brand-400" />
              <div>
                <p className="text-sm font-medium">Blotato</p>
                <p className="text-xs text-dark-500">Multi-platform posting</p>
              </div>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-brand-900/20 text-brand-400 text-xs">Configured</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
              <Database size={18} className="text-accent-teal" />
              <div>
                <p className="text-sm font-medium">Airtable</p>
                <p className="text-xs text-dark-500">Content calendar & tracking</p>
              </div>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal text-xs">Configured</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
              <Zap size={18} className="text-accent-emerald" />
              <div>
                <p className="text-sm font-medium">n8n</p>
                <p className="text-xs text-dark-500">Workflow automation</p>
              </div>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs">Configured</span>
            </div>
          </div>
        </div>

        {/* Workflows */}
        <div className="space-y-4 mb-8">
          <h2 className="font-bold flex items-center gap-2">
            <Workflow size={18} className="text-brand-400" />
            n8n Workflows
          </h2>

          {workflows.map((workflow) => (
            <div key={workflow.id} className="card-glass rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-dark-800/50 flex items-center justify-center flex-shrink-0">
                    {workflow.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{workflow.name}</h3>
                    <p className="text-sm text-dark-400 mt-1">{workflow.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-dark-500">
                        <Clock size={12} /> {workflow.schedule}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-dark-500">
                        <Terminal size={12} /> {workflow.file}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleTriggerManually(workflow.id)}
                    disabled={triggeringWorkflow === workflow.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800/50 border border-dark-700/30 text-dark-300 hover:text-white transition-all disabled:opacity-50"
                  >
                    {triggeringWorkflow === workflow.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} />
                    )}
                    Run Now
                  </button>
                  <button
                    onClick={() => handleToggleWorkflow(workflow.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      workflow.active
                        ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/30'
                        : 'bg-dark-800/50 text-dark-400 border border-dark-700/30'
                    }`}
                  >
                    {workflow.active ? <Pause size={14} /> : <Play size={14} />}
                    {workflow.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Automation Logs */}
        <div className="card-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Database size={18} className="text-accent-teal" />
              Automation Log (Airtable)
            </h2>
            <button
              onClick={loadLogs}
              className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Database size={32} className="mx-auto text-dark-600 mb-3" />
              <p className="text-dark-500 text-sm">No automation logs yet. Logs appear here after workflows run.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/30">
                  {log.fields.Status === 'Success' ? (
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.fields['Action Type']}</p>
                    <p className="text-xs text-dark-500 truncate">{log.fields['Action Details']}</p>
                  </div>
                  <span className="text-xs text-dark-500 whitespace-nowrap">
                    {log.fields['Triggered At']?.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
