'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ArrowLeft, BarChart3, TrendingUp, Eye, Users, Activity,
  Target, Zap, Globe, Wifi, WifiOff, Clock, RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { marketingApi, classifyPerformance } from '@/lib/marketing-api';
import type {
  MarketingProfile, MarketingPost, MarketingReport, HookPerformance,
} from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

const SA_TIMEZONE = 'Africa/Johannesburg';
const timeFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

function useSATime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(timeFmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

type NetSpeed = { downlink: number; effectiveType: string; rtt: number } | null;

function useNetworkSpeed() {
  const [speed, setSpeed] = useState<NetSpeed>(null);
  useEffect(() => {
    function update() {
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (conn) {
        setSpeed({
          downlink: conn.downlink ?? 0,
          effectiveType: conn.effectiveType ?? 'unknown',
          rtt: conn.rtt ?? 0,
        });
      }
    }
    update();
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) conn.addEventListener?.('change', update);
    return () => { if (conn) conn.removeEventListener?.('change', update); };
  }, []);
  return speed;
}

function HexCell({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity rounded-2xl" style={{ background: color }} />
      <div className="relative p-5 text-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
        <div className="pt-6 pb-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-mono">{label}</p>
          <p className="text-3xl font-bold font-mono mt-1" style={{ color }}>{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformBar({ platform, posted, total, color }: { platform: string; posted: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((posted / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <div className="w-2 h-8 rounded-full" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-sm font-bold text-gray-700">{PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform}</span>
          <span className="font-mono text-sm text-gray-500">{posted} posts</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#00f2ea', instagram: '#e1306c', youtube: '#ff0000', linkedin: '#0077b5',
  x: '#1da1f2', threads: '#000000', pinterest: '#e60023', reddit: '#ff4500', bluesky: '#0085ff',
};

export default function HexDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [reports, setReports] = useState<MarketingReport[]>([]);
  const [hooks, setHooks] = useState<HookPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const saTime = useSATime();
  const netSpeed = useNetworkSpeed();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await marketingApi.profile.getProfile();
      setProfile(profileData);
      if (profileData?.id) {
        const [postsData, reportsData, hooksData] = await Promise.all([
          marketingApi.posts.getPosts(profileData.id),
          marketingApi.reports.getReports(profileData.id),
          marketingApi.hooks.getHookPerformance(profileData.id),
        ]);
        setPosts(postsData);
        setReports(reportsData);
        setHooks(hooksData);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const postedPosts = posts.filter(p => p.status === 'posted');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const failedPosts = posts.filter(p => p.status === 'failed');
  const platforms = profile?.uploadPost.platforms || [];
  const totalImpressions = hooks.reduce((sum, h) => sum + h.impressions, 0);
  const totalConversions = hooks.reduce((sum, h) => sum + h.conversions, 0);
  const conversionRate = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : '0.0';

  const hooksByCategory = hooks.reduce((acc, h) => {
    acc[h.hookCategory] = (acc[h.hookCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformPostCounts = platforms.reduce((acc, p) => {
    acc[p] = posts.filter(post => post.platforms.includes(p as any)).length;
    return acc;
  }, {} as Record<string, number>);

  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 text-gray-800">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">

            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />}
                  onClick={() => router.push('/marketing')}>Back</Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-mono flex items-center gap-2">
                    <BarChart3 size={26} className="text-blue-500" />
                    Hex Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 font-mono">Real-time platform analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-sm">
                {/* SA Time */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                  <Clock size={14} />
                  <span className="font-bold">{saTime || '--:--:--'}</span>
                  <span className="text-blue-400">SAST</span>
                </div>

                {/* Internet Speed */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  netSpeed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {netSpeed ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {netSpeed ? (
                    <>
                      <span className="font-bold">{netSpeed.downlink} Mbps</span>
                      <span className="text-green-400">|</span>
                      <span>{netSpeed.effectiveType}</span>
                      <span className="text-green-400">|</span>
                      <span>{netSpeed.rtt}ms</span>
                    </>
                  ) : (
                    <span>No connection data</span>
                  )}
                </div>

                {/* Refresh */}
                <button onClick={loadData} disabled={loading}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
                  <RefreshCw size={16} className={loading ? 'animate-spin text-blue-500' : 'text-gray-500'} />
                </button>
              </div>
            </div>

            {/* Hex Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <HexCell label="Posts" value={String(posts.length)} sub="Total missions" color="#3b82f6" />
              <HexCell label="Published" value={String(postedPosts.length)} sub="Live content" color="#22c55e" />
              <HexCell label="Drafts" value={String(draftPosts.length)} sub="Queued" color="#eab308" />
              <HexCell label="Failed" value={String(failedPosts.length)} sub="Needs fix" color="#ef4444" />
              <HexCell label="Hooks" value={String(hooks.length)} sub="Tracked" color="#8b5cf6" />
              <HexCell label="CVR" value={`${conversionRate}%`} sub="Conversion rate" color="#06b6d4" />
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-12 gap-4 mb-4">

              {/* LEFT: Platform Breakdown */}
              <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" /> PLATFORM BREAKDOWN
                </h3>
                {platforms.length > 0 ? (
                  <div className="space-y-2">
                    {platforms.map(p => (
                      <PlatformBar
                        key={p}
                        platform={p}
                        posted={platformPostCounts[p] || 0}
                        total={posts.length || 1}
                        color={PLATFORM_COLORS[p] || '#6b7280'}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8 font-mono text-sm">No platforms connected</p>
                )}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">{platforms.length} platforms connected</span>
                  <button onClick={() => router.push('/marketing/settings')}
                    className="font-mono text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                    Manage <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* CENTER: Hook Performance + Impressions */}
              <div className="lg:col-span-5 space-y-4">
                {/* Impressions Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-purple-500" /> IMPRESSIONS & CONVERSIONS
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold font-mono text-purple-600">{totalImpressions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-mono">IMPRESSIONS</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-mono text-green-600">{totalConversions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-mono">CONVERSIONS</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-mono text-blue-600">{conversionRate}%</p>
                      <p className="text-xs text-gray-500 font-mono">CVR</p>
                    </div>
                  </div>
                </div>

                {/* Hook Categories */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                    <Target size={16} className="text-orange-500" /> HOOK CATEGORY MIX
                  </h3>
                  {Object.keys(hooksByCategory).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(hooksByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, count]) => {
                          const max = Math.max(...Object.values(hooksByCategory));
                          const pct = max > 0 ? (count / max) * 100 : 0;
                          return (
                            <div key={category} className="flex items-center gap-3">
                              <span className="font-mono text-xs text-gray-600 w-28 truncate">{category}</span>
                              <div className="flex-1 h-3 bg-gray-100 rounded-full">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                                  style={{ width: `${Math.max(pct, 4)}%` }} />
                              </div>
                              <span className="font-mono text-xs text-gray-500 w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-6 font-mono text-sm">No hook data yet</p>
                  )}
                </div>
              </div>

              {/* RIGHT: Diagnostics + Latest Report */}
              <div className="lg:col-span-3 space-y-4">
                {/* Diagnostic Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" /> DIAGNOSTICS
                  </h3>
                  {latestReport?.diagnosticBreakdown ? (
                    <div className="space-y-2">
                      {Object.entries(latestReport.diagnosticBreakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <span className="font-mono text-xs text-gray-600 uppercase">{key}</span>
                          <Badge variant={key === 'scale' ? 'success' : key === 'fullReset' ? 'error' : 'warning'} size="sm">
                            {value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4 font-mono text-sm">No diagnostic data</p>
                  )}
                </div>

                {/* Latest Report */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" /> LATEST REPORT
                  </h3>
                  {latestReport ? (
                    <div>
                      <p className="font-mono text-xs text-gray-400 mb-2">{latestReport.date}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{latestReport.summary}</p>
                      {latestReport.recommendations.length > 0 && (
                        <div className="space-y-1">
                          {latestReport.recommendations.slice(0, 3).map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                              <Zap size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => router.push('/marketing/analytics')}
                        className="mt-3 font-mono text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        Full reports <ChevronRight size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4 font-mono text-sm">No reports yet</p>
                  )}
                </div>

                {/* Network Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
                    {netSpeed ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-gray-400" />}
                    NETWORK STATUS
                  </h3>
                  {netSpeed ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <span className="font-mono text-xs text-gray-600">Download</span>
                        <span className="font-mono text-sm font-bold text-green-600">{netSpeed.downlink} Mbps</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <span className="font-mono text-xs text-gray-600">Type</span>
                        <span className="font-mono text-sm font-bold text-blue-600">{netSpeed.effectiveType}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <span className="font-mono text-xs text-gray-600">Latency</span>
                        <span className="font-mono text-sm font-bold text-purple-600">{netSpeed.rtt}ms</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4 font-mono text-sm">
                      Network Information API not available in this browser
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: Top Hooks Table */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm font-bold text-gray-500 tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" /> TOP PERFORMING HOOKS
                </h3>
                <button onClick={() => router.push('/marketing/analytics')}
                  className="font-mono text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              {hooks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 font-mono text-xs text-gray-400 font-medium">HOOK</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-gray-400 font-medium">CATEGORY</th>
                        <th className="text-right py-2 px-3 font-mono text-xs text-gray-400 font-medium">IMPRESSIONS</th>
                        <th className="text-right py-2 px-3 font-mono text-xs text-gray-400 font-medium">CONVERSIONS</th>
                        <th className="text-center py-2 px-3 font-mono text-xs text-gray-400 font-medium">DIAGNOSTIC</th>
                        <th className="text-center py-2 px-3 font-mono text-xs text-gray-400 font-medium">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hooks
                        .sort((a, b) => b.impressions - a.impressions)
                        .slice(0, 8)
                        .map((hook) => {
                          const diag = classifyPerformance(hook.impressions, hook.conversions);
                          return (
                            <tr key={hook.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="py-2 px-3 max-w-xs truncate text-gray-700">{hook.hookText}</td>
                              <td className="py-2 px-3">
                                <Badge variant="primary" size="sm">{hook.hookCategory}</Badge>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-gray-700">
                                {hook.impressions.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-gray-700">
                                {hook.conversions}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Badge variant={diag.diagnostic === 'scale' ? 'success' : diag.diagnostic === 'full-reset' ? 'error' : 'warning'} size="sm">
                                  {diag.diagnostic}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Badge
                                  variant={hook.status === 'doubleDown' ? 'success' : hook.status === 'dropped' ? 'error' : hook.status === 'testing' ? 'info' : 'warning'}
                                  size="sm"
                                >
                                  {hook.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Target size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-mono text-sm">No hook data yet. Post content to start tracking.</p>
                </div>
              )}
            </div>

            {/* Footer meta */}
            {lastRefresh && (
              <p className="text-center text-xs text-gray-400 font-mono mt-4">
                Last refreshed: {lastRefresh.toLocaleTimeString('en-ZA', { timeZone: SA_TIMEZONE })} SAST
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
