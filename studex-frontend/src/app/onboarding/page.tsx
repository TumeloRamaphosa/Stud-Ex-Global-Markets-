'use client';

import { useState, useEffect, useCallback } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';
type AppStatus = 'pending' | 'screening' | 'approved' | 'flagged' | 'provisioning' | 'active' | 'rejected';
type AgentType = 'RetailBot' | 'ContentBot' | 'AnalyticsBot';

interface Application {
  id: string;
  companyName: string;
  email: string;
  whatsapp: string;
  agentType: AgentType;
  monthlySpend: number;
  status: AppStatus;
  riskLevel: RiskLevel;
  flags: string[];
  checksPassed: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalClients: number;
  pendingReviews: number;
  activeThisMonth: number;
  revenueMRR: number;
}

const PIPELINE_COLUMNS: { key: AppStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'border-gray-600' },
  { key: 'screening', label: 'Screening', color: 'border-blue-600' },
  { key: 'approved', label: 'Approved', color: 'border-green-600' },
  { key: 'flagged', label: 'Flagged', color: 'border-yellow-600' },
  { key: 'provisioning', label: 'Provisioning', color: 'border-purple-600' },
  { key: 'active', label: 'Active', color: 'border-emerald-600' },
];

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-green-900/50 text-green-400 border border-green-700',
  medium: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  high: 'bg-red-900/50 text-red-400 border border-red-700',
};

export default function OnboardingPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ totalClients: 0, pendingReviews: 0, activeThisMonth: 0, revenueMRR: 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    whatsapp: '',
    agentType: 'RetailBot' as AgentType,
    monthlySpend: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch('/api/kyc-onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_applications' }) }),
        fetch('/api/kyc-onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_stats' }) }),
      ]);
      const appsData = await appsRes.json();
      const statsData = await statsRes.json();
      if (appsData.ok) setApplications(appsData.applications);
      if (statsData.ok) setStats(statsData.stats);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/kyc-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_application', ...form, monthlySpend: Number(form.monthlySpend) }),
      });
      const data = await res.json();
      if (data.ok) {
        setForm({ companyName: '', email: '', whatsapp: '', agentType: 'RetailBot', monthlySpend: '' });
        await fetchData();
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (applicationId: string, action: 'approve' | 'reject' | 'provision') => {
    setActionLoading(applicationId);
    try {
      await fetch('/api/kyc-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, applicationId }),
      });
      await fetchData();
    } catch (err) {
      console.error(`${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const pipelineApps = (status: AppStatus) => applications.filter((a) => a.status === status);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 lg:pl-72">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">KYC Onboarding Dashboard</h1>
          <p className="text-gray-400 mt-1">Client screening, provisioning, and activation pipeline for stud.exchange</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: stats.totalClients, icon: '▣' },
            { label: 'Pending Reviews', value: stats.pendingReviews, icon: '◎', highlight: stats.pendingReviews > 0 },
            { label: 'Active This Month', value: stats.activeThisMonth, icon: '⚡' },
            { label: 'Revenue MRR', value: `R ${stats.revenueMRR.toLocaleString()}`, icon: '◆' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gray-900 border rounded-xl p-5 ${stat.highlight ? 'border-yellow-700' : 'border-gray-800'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* New Client Application Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">New Client Application</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="Acme Holdings (Pty) Ltd"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="admin@acme.co.za"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
              <input
                type="tel"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="+27 82 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
              <select
                value={form.agentType}
                onChange={(e) => setForm({ ...form, agentType: e.target.value as AgentType })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-600 focus:outline-none"
              >
                <option value="RetailBot">RetailBot</option>
                <option value="ContentBot">ContentBot</option>
                <option value="AnalyticsBot">AnalyticsBot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Spend (ZAR)</label>
              <input
                type="number"
                required
                min="0"
                value={form.monthlySpend}
                onChange={(e) => setForm({ ...form, monthlySpend: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                placeholder="15000"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>

        {/* KYC Pipeline */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">KYC Status Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_COLUMNS.map((col) => {
              const apps = pipelineApps(col.key);
              return (
                <div key={col.key} className={`bg-gray-900 border-t-2 ${col.color} rounded-xl p-4 min-h-[160px]`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">{col.label}</h3>
                    <span className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">{apps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {apps.map((app) => (
                      <div key={app.id} className="bg-gray-800 rounded-lg p-2.5 text-xs">
                        <p className="font-medium text-white truncate">{app.companyName}</p>
                        <p className="text-gray-500 mt-0.5">{app.agentType}</p>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${RISK_BADGE[app.riskLevel]}`}>
                          {app.riskLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Agent</th>
                  <th className="px-6 py-3 font-medium">Spend</th>
                  <th className="px-6 py-3 font-medium">Risk</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No applications yet. Submit one above to get started.
                    </td>
                  </tr>
                )}
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white font-medium">{app.companyName}</td>
                    <td className="px-6 py-3 text-gray-400">{app.email}</td>
                    <td className="px-6 py-3 text-gray-400">{app.agentType}</td>
                    <td className="px-6 py-3 text-gray-400">R {app.monthlySpend.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_BADGE[app.riskLevel]}`}>
                        {app.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-gray-300 capitalize">{app.status}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {(app.status === 'flagged' || app.status === 'pending' || app.status === 'screening') && (
                          <>
                            <button
                              onClick={() => handleAction(app.id, 'approve')}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 text-xs bg-green-900/50 text-green-400 border border-green-700 rounded hover:bg-green-800/50 disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(app.id, 'reject')}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 text-xs bg-red-900/50 text-red-400 border border-red-700 rounded hover:bg-red-800/50 disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <button
                            onClick={() => handleAction(app.id, 'provision')}
                            disabled={actionLoading === app.id}
                            className="px-2.5 py-1 text-xs bg-purple-900/50 text-purple-400 border border-purple-700 rounded hover:bg-purple-800/50 disabled:opacity-50 transition-colors"
                          >
                            Provision
                          </button>
                        )}
                        {app.status === 'active' && (
                          <span className="text-xs text-emerald-400">Live</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flow description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">Provisioning Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {[
              { step: '1', label: 'Payment', desc: 'Client pays on stud.exchange' },
              { step: '2', label: 'KYC Screen', desc: 'Email domain, SA registry, risk rating' },
              { step: '3', label: 'n8n Routing', desc: 'Auto-provision / Slack notify / manual review' },
              { step: '4', label: 'Dynamic Workflow', desc: 'VM, AgentMail, Northstar, welcome email, Slack' },
              { step: '5', label: '16 Subagents', desc: 'Parallel execution, done in 60s' },
            ].map((s) => (
              <div key={s.step} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                  {s.step}
                </div>
                <p className="font-medium text-white">{s.label}</p>
                <p className="text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
