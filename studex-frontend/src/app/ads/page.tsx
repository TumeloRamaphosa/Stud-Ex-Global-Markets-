'use client';

import { useState, useEffect, useCallback } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  start_time?: string;
}

interface AdInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: string;
  cpc: string;
}

interface CampaignForm {
  name: string;
  objective: string;
  dailyBudget: string;
  startDate: string;
  endDate: string;
}

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'insights'>('campaigns');
  const [form, setForm] = useState<CampaignForm>({
    name: '', objective: 'OUTCOME_TRAFFIC', dailyBudget: '500', startDate: '', endDate: '',
  });
  const [formStatus, setFormStatus] = useState('');

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/meta-ads?resource=campaigns');
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch { /* offline */ }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch('/api/meta-ads?resource=insights');
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchCampaigns(), fetchInsights()]).finally(() => setLoading(false));
  }, [fetchCampaigns, fetchInsights]);

  const createCampaign = async () => {
    setFormStatus('Creating campaign...');
    try {
      const res = await fetch('/api/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_campaign', ...form }),
      });
      const data = await res.json();
      setFormStatus(data.ok ? `Campaign created: ${data.campaign?.id}` : `Error: ${data.error || 'Unknown error'}`);
      if (data.ok) fetchCampaigns();
    } catch {
      setFormStatus('Failed to create campaign');
    }
  };

  const totalSpend = insights.reduce((s, i) => s + parseFloat(i.spend || '0'), 0);
  const totalImpressions = insights.reduce((s, i) => s + parseInt(i.impressions || '0'), 0);
  const totalClicks = insights.reduce((s, i) => s + parseInt(i.clicks || '0'), 0);
  const totalConversions = insights.reduce((s, i) => s + parseInt(i.conversions || '0'), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Ad Manager</h1>
          <p className="text-sm text-gray-500">Facebook & Instagram campaign management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Spend', value: `R${totalSpend.toLocaleString()}`, color: 'red' },
            { label: 'Impressions', value: totalImpressions.toLocaleString(), color: 'blue' },
            { label: 'Clicks', value: totalClicks.toLocaleString(), color: 'green' },
            { label: 'CTR', value: `${avgCtr}%`, color: 'yellow' },
            { label: 'Conversions', value: totalConversions.toLocaleString(), color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gray-900 border border-gray-800 rounded-xl p-5`}>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {(['campaigns', 'create', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'create' ? 'Create Campaign' : tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading ad data...</p>}

        {/* Campaigns List */}
        {activeTab === 'campaigns' && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3">Campaign</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Objective</th>
                  <th className="text-left px-5 py-3">Budget</th>
                  <th className="text-left px-5 py-3">Start</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{c.objective}</td>
                    <td className="px-5 py-3 text-gray-400">{c.daily_budget ? `R${c.daily_budget}` : '--'}</td>
                    <td className="px-5 py-3 text-gray-400">{c.start_time ? new Date(c.start_time).toLocaleDateString() : '--'}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-600">No campaigns found. Connect Meta Ads API or create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Campaign */}
        {activeTab === 'create' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-xl">
            <h3 className="font-semibold mb-4">New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Campaign Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wagyu Weekend Sale"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Objective</label>
                <select
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="OUTCOME_TRAFFIC">Traffic</option>
                  <option value="OUTCOME_ENGAGEMENT">Engagement</option>
                  <option value="OUTCOME_LEADS">Leads</option>
                  <option value="OUTCOME_SALES">Sales</option>
                  <option value="OUTCOME_AWARENESS">Awareness</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Daily Budget (ZAR)</label>
                <input
                  type="number"
                  value={form.dailyBudget}
                  onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <button
                onClick={createCampaign}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Create Campaign
              </button>
              {formStatus && <p className="text-xs text-gray-400">{formStatus}</p>}
            </div>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && !loading && (
          <div className="space-y-6">
            {/* Performance Charts Placeholder */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Spend Over Time</h3>
                <div className="h-48 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-600 text-sm border border-dashed border-gray-700">
                  Chart: Daily Spend Trend
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">CTR by Campaign</h3>
                <div className="h-48 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-600 text-sm border border-dashed border-gray-700">
                  Chart: CTR Comparison
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Impressions vs Clicks</h3>
                <div className="h-48 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-600 text-sm border border-dashed border-gray-700">
                  Chart: Impressions vs Clicks
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Conversion Funnel</h3>
                <div className="h-48 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-600 text-sm border border-dashed border-gray-700">
                  Chart: Funnel View
                </div>
              </div>
            </div>

            {/* Insights Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-3">Campaign</th>
                    <th className="text-right px-5 py-3">Spend</th>
                    <th className="text-right px-5 py-3">Impressions</th>
                    <th className="text-right px-5 py-3">Clicks</th>
                    <th className="text-right px-5 py-3">CTR</th>
                    <th className="text-right px-5 py-3">CPC</th>
                    <th className="text-right px-5 py-3">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.map((i) => (
                    <tr key={i.campaign_id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-5 py-3 font-medium">{i.campaign_name}</td>
                      <td className="px-5 py-3 text-right text-gray-300">R{parseFloat(i.spend).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-400">{parseInt(i.impressions).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-400">{parseInt(i.clicks).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-400">{i.ctr}%</td>
                      <td className="px-5 py-3 text-right text-gray-400">R{i.cpc}</td>
                      <td className="px-5 py-3 text-right text-green-400">{i.conversions}</td>
                    </tr>
                  ))}
                  {insights.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-600">No insights data available. Run campaigns to see performance.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
