'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Eye, Users, Activity,
  Target, Zap, Globe, Wifi, WifiOff, Clock, RefreshCw, ChevronRight,
  AlertCircle, CheckCircle, Loader, FileText, Radio,
} from 'lucide-react';
import { marketingApi, classifyPerformance } from '@/lib/marketing-api';
import type {
  MarketingProfile, MarketingPost, MarketingReport, HookPerformance,
  MarketingAnalytics, PlatformMetrics, Platform, DiagnosticType,
} from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

// ==================== CONSTANTS ====================

const SA_TIMEZONE = 'Africa/Johannesburg';
const timeFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
const dateFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, weekday: 'short', day: 'numeric', month: 'short',
});

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#00f2ea', instagram: '#e1306c', youtube: '#ff0000', linkedin: '#0077b5',
  x: '#1da1f2', threads: '#000000', pinterest: '#e60023', reddit: '#ff4500', bluesky: '#0085ff',
};

const DIAG_VARIANTS: Record<DiagnosticType, 'success' | 'warning' | 'error' | 'info'> = {
  scale: 'success', 'fix-cta': 'warning', 'fix-hooks': 'info',
  'full-reset': 'error', 'cta-issue': 'warning', 'app-issue': 'error',
};

// ==================== HOOKS ====================

function useSATime() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(timeFmt.format(now));
      setDate(dateFmt.format(now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

type NetSpeed = { downlink: number; effectiveType: string; rtt: number } | null;

function useNetworkSpeed() {
  const [speed, setSpeed] = useState<NetSpeed>(null);
  useEffect(() => {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (!conn) return;
    const update = () => setSpeed({ downlink: conn.downlink ?? 0, effectiveType: conn.effectiveType ?? 'unknown', rtt: conn.rtt ?? 0 });
    update();
    conn.addEventListener?.('change', update);
    return () => conn.removeEventListener?.('change', update);
  }, []);
  return speed;
}

// ==================== SMALL COMPONENTS ====================

function HexCell({ label, value, sub, color, loading }: {
  label: string; value: string; sub: string; color: string; loading?: boolean;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity rounded-2xl" style={{ background: color }} />
      <div className="relative rounded-2xl border border-gray-200 bg-white/90 hover:shadow-lg transition-all text-center p-4"
        style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}>
        <div className="pt-5 pb-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">{label}</p>
          {loading ? (
            <div className="flex justify-center mt-2"><Loader size={18} className="animate-spin" style={{ color }} /></div>
          ) : (
            <p className="text-2xl sm:text-3xl font-bold font-mono mt-1" style={{ color }}>{value}</p>
          )}
          <p className="text-[10px] text-gray-500 mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformRow({ platform, metrics, postCount }: {
  platform: string;
  metrics: PlatformMetrics | null;
  postCount: number;
}) {
  const color = PLATFORM_COLORS[platform] || '#6b7280';
  const label = PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform;
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="font-mono text-sm font-bold text-gray-700">{label}</span>
        </div>
        <span className="font-mono text-xs text-gray-400">{postCount} posts</span>
      </div>
      {metrics ? (
        <div className="grid grid-cols-2 gap-1 text-center mt-1">
          <div className="bg-gray-50 rounded-lg p-1.5">
            <p className="font-mono text-xs font-bold" style={{ color }}>{metrics.followers.toLocaleString()}</p>
            <p className="font-mono text-[9px] text-gray-400">FOLLOWERS</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5">
            <p className="font-mono text-xs font-bold text-purple-600">{metrics.impressions.toLocaleString()}</p>
            <p className="font-mono text-[9px] text-gray-400">IMPRESSIONS</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5">
            <p className="font-mono text-xs font-bold text-blue-600">{metrics.reach.toLocaleString()}</p>
            <p className="font-mono text-[9px] text-gray-400">REACH</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5">
            <p className="font-mono text-xs font-bold text-green-600">{metrics.profileViews.toLocaleString()}</p>
            <p className="font-mono text-[9px] text-gray-400">PROFILE VIEWS</p>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 font-mono text-center py-1">No live data — connect via Settings</p>
      )}
    </div>
  );
}

function SparkBar({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return <div className="h-8 flex items-end gap-0.5 opacity-30"><div className="flex-1 bg-gray-200 h-full rounded-sm" /></div>;
  const max = Math.max(...values, 1);
  return (
    <div className="h-8 flex items-end gap-0.5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{ height: `${Math.max((v / max) * 100, 4)}%`, background: color, opacity: i === values.length - 1 ? 1 : 0.5 + (i / values.length) * 0.5 }} />
      ))}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function HexDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // All data state
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [reports, setReports] = useState<MarketingReport[]>([]);
  const [hooks, setHooks] = useState<HookPerformance[]>([]);
  const [analytics, setAnalytics] = useState<MarketingAnalytics[]>([]);
  const [liveAnalytics, setLiveAnalytics] = useState<Record<string, unknown> | null>(null);
  const [uploadHistory, setUploadHistory] = useState<Record<string, unknown> | null>(null);

  // Loading states per source
  const [loadingFirestore, setLoadingFirestore] = useState(true);
  const [loadingLive, setLoadingLive] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const { time, date } = useSATime();
  const netSpeed = useNetworkSpeed();

  // Load Firestore data
  const loadFirestoreData = useCallback(async () => {
    if (!user) return;
    setLoadingFirestore(true);
    const errs: string[] = [];
    try {
      const profileData = await marketingApi.profile.getProfile();
      setProfile(profileData);
      if (profileData?.id) {
        const [postsData, reportsData, hooksData, analyticsData] = await Promise.all([
          marketingApi.posts.getPosts(profileData.id).catch(e => { errs.push(`Posts: ${e.message}`); return [] as MarketingPost[]; }),
          marketingApi.reports.getReports(profileData.id).catch(e => { errs.push(`Reports: ${e.message}`); return [] as MarketingReport[]; }),
          marketingApi.hooks.getHookPerformance(profileData.id).catch(e => { errs.push(`Hooks: ${e.message}`); return [] as HookPerformance[]; }),
          marketingApi.analytics.getAnalytics(profileData.id, 7).catch(e => { errs.push(`Analytics: ${e.message}`); return [] as MarketingAnalytics[]; }),
        ]);
        setPosts(postsData);
        setReports(reportsData);
        setHooks(hooksData);
        setAnalytics(analyticsData);
      }
    } catch (e: any) {
      errs.push(`Profile: ${e.message}`);
    } finally {
      setLoadingFirestore(false);
      setErrors(errs);
      setLastRefresh(new Date());
    }
  }, [user]);

  // Load live Upload-Post API data
  const loadLiveData = useCallback(async () => {
    if (!profile?.uploadPost?.apiKey || !profile?.uploadPost?.profile) return;
    setLoadingLive(true);
    try {
      const [liveData, historyData] = await Promise.all([
        marketingApi.uploadPost.getAnalytics(profile.uploadPost.apiKey, profile.uploadPost.profile, profile.uploadPost.platforms),
        marketingApi.uploadPost.getUploadHistory(profile.uploadPost.apiKey, profile.uploadPost.profile),
      ]);
      setLiveAnalytics(liveData);
      setUploadHistory(historyData);
    } catch (e: any) {
      setErrors(prev => [...prev, `Live API: ${e.message}`]);
    } finally {
      setLoadingLive(false);
    }
  }, [profile]);

  useEffect(() => { loadFirestoreData(); }, [loadFirestoreData]);
  useEffect(() => { if (profile) loadLiveData(); }, [profile, loadLiveData]);

  const refresh = useCallback(() => {
    loadFirestoreData();
  }, [loadFirestoreData]);

  // ── Derived values ──
  const postedPosts = posts.filter(p => p.status === 'posted');
  const draftPosts  = posts.filter(p => p.status === 'draft');
  const failedPosts = posts.filter(p => p.status === 'failed');
  const platforms   = profile?.uploadPost.platforms || [];

  const totalImpressions = hooks.reduce((s, h) => s + h.impressions, 0);
  const totalConversions = hooks.reduce((s, h) => s + h.conversions, 0);
  const cvr = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : '0.0';

  const winningHooks = hooks.filter(h => h.status === 'doubleDown').length;
  const latestReport = reports[0];

  // Platform post counts from Firestore posts
  const platformPostCounts = platforms.reduce<Record<string, number>>((acc, p) => {
    acc[p] = posts.filter(post => post.platforms.includes(p)).length;
    return acc;
  }, {});

  // Latest analytics metrics per platform from Firestore time-series
  const latestAnalytics = analytics[0]?.platforms ?? {};

  // 7-day impression sparkline from Firestore analytics
  const impressionSpark = analytics
    .slice()
    .reverse()
    .map(a => Object.values(a.platforms).reduce((s, m) => s + m.impressions, 0));

  // Hook category breakdown
  const hooksByCategory = hooks.reduce<Record<string, number>>((acc, h) => {
    acc[h.hookCategory] = (acc[h.hookCategory] || 0) + 1;
    return acc;
  }, {});

  // Diagnostic summary across all hooks
  const diagCounts = hooks.reduce<Record<string, number>>((acc, h) => {
    const d = classifyPerformance(h.impressions, h.conversions).diagnostic;
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  // Total followers across all platforms from Firestore analytics
  const totalFollowers = Object.values(latestAnalytics).reduce((s, m) => s + m.followers, 0);
  const totalReach     = Object.values(latestAnalytics).reduce((s, m) => s + m.reach, 0);

  const loading = loadingFirestore;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 text-gray-800">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto w-full">

            {/* ── TOP BAR ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => router.push('/marketing')}>Back</Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-mono flex items-center gap-2">
                    <BarChart3 size={22} className="text-blue-500" />
                    Hex Analytics Command Centre
                  </h1>
                  <p className="text-xs text-gray-400 font-mono">All data sources · Firestore + Upload-Post API</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* SA Time */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                  <Clock size={13} />
                  <span className="font-bold">{time || '--:--:--'}</span>
                  <span className="text-blue-400">SAST</span>
                  <span className="text-blue-300 hidden sm:inline">|</span>
                  <span className="hidden sm:inline">{date}</span>
                </div>

                {/* Network */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${netSpeed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {netSpeed ? <Wifi size={13} /> : <WifiOff size={13} />}
                  {netSpeed ? (
                    <span>{netSpeed.downlink} Mbps · {netSpeed.effectiveType} · {netSpeed.rtt}ms</span>
                  ) : <span>No speed data</span>}
                </div>

                {/* Live indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200">
                  {loadingLive ? (
                    <Loader size={13} className="animate-spin text-blue-500" />
                  ) : liveAnalytics ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                  <span className="text-gray-500">{loadingLive ? 'Fetching live...' : liveAnalytics ? 'API Live' : 'No API key'}</span>
                </div>

                <button onClick={refresh} disabled={loading}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <RefreshCw size={14} className={loading ? 'animate-spin text-blue-500' : 'text-gray-500'} />
                </button>
              </div>
            </div>

            {/* ── ERRORS ── */}
            {errors.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="font-mono text-xs font-bold text-red-600">Data source errors</span>
                </div>
                <div className="space-y-0.5">
                  {errors.map((e, i) => <p key={i} className="font-mono text-xs text-red-500">{e}</p>)}
                </div>
              </div>
            )}

            {/* ── HEX METRIC CELLS ── */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-5">
              <HexCell label="Posts" value={String(posts.length)} sub="All missions" color="#3b82f6" loading={loading} />
              <HexCell label="Published" value={String(postedPosts.length)} sub="Live" color="#22c55e" loading={loading} />
              <HexCell label="Drafts" value={String(draftPosts.length)} sub="Queued" color="#eab308" loading={loading} />
              <HexCell label="Failed" value={String(failedPosts.length)} sub="Fix needed" color="#ef4444" loading={loading} />
              <HexCell label="Hooks" value={String(hooks.length)} sub="Tracked" color="#8b5cf6" loading={loading} />
              <HexCell label="Winning" value={String(winningHooks)} sub="Double down" color="#06b6d4" loading={loading} />
              <HexCell label="Followers" value={totalFollowers > 0 ? `${(totalFollowers / 1000).toFixed(1)}K` : '—'} sub="Total" color="#f97316" loading={loading} />
              <HexCell label="CVR" value={`${cvr}%`} sub="Conversion" color="#ec4899" loading={loading} />
            </div>

            {/* ── MAIN 3-COLUMN GRID ── */}
            <div className="grid lg:grid-cols-12 gap-4 mb-4">

              {/* ── LEFT: Platform Breakdown (live + Firestore) ── */}
              <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider flex items-center gap-2">
                    <Globe size={14} className="text-blue-500" /> PLATFORM TELEMETRY
                  </h3>
                  <div className="flex items-center gap-1">
                    {loadingLive && <Loader size={11} className="animate-spin text-blue-400" />}
                    <span className="font-mono text-[9px] text-gray-400">{platforms.length} connected</span>
                  </div>
                </div>

                {platforms.length > 0 ? (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {platforms.map(p => (
                      <PlatformRow
                        key={p}
                        platform={p}
                        metrics={latestAnalytics[p] ?? null}
                        postCount={platformPostCounts[p] || 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Globe size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-mono text-xs text-gray-400">No platforms connected</p>
                    <button onClick={() => router.push('/marketing/settings')}
                      className="mt-2 font-mono text-xs text-blue-500 hover:text-blue-700">
                      Go to Settings →
                    </button>
                  </div>
                )}

                {liveAnalytics && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="font-mono text-[9px] text-gray-400 flex items-center gap-1">
                      <CheckCircle size={10} className="text-green-500" />
                      Live data from Upload-Post API
                    </p>
                  </div>
                )}
              </div>

              {/* ── CENTER: Metrics + Trends ── */}
              <div className="lg:col-span-5 space-y-4">

                {/* Impressions + CVR summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    <Eye size={14} className="text-purple-500" /> PERFORMANCE SUMMARY
                  </h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold font-mono text-purple-600">{totalImpressions.toLocaleString()}</p>
                      <p className="font-mono text-[9px] text-gray-400 uppercase">Impressions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-green-600">{totalConversions.toLocaleString()}</p>
                      <p className="font-mono text-[9px] text-gray-400 uppercase">Conversions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-blue-600">{cvr}%</p>
                      <p className="font-mono text-[9px] text-gray-400 uppercase">CVR</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-orange-600">{totalReach > 0 ? `${(totalReach / 1000).toFixed(1)}K` : '—'}</p>
                      <p className="font-mono text-[9px] text-gray-400 uppercase">Reach</p>
                    </div>
                  </div>

                  {/* 7-day impressions spark */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[9px] text-gray-400">7-DAY IMPRESSIONS TREND</span>
                      <span className="font-mono text-[9px] text-gray-400">{analytics.length} days of data</span>
                    </div>
                    <SparkBar values={impressionSpark} color="#8b5cf6" />
                  </div>
                </div>

                {/* Hook category mix */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    <Target size={14} className="text-orange-500" /> HOOK CATEGORY MIX
                  </h3>
                  {Object.keys(hooksByCategory).length > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(hooksByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, count]) => {
                          const max = Math.max(...Object.values(hooksByCategory));
                          return (
                            <div key={cat} className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-gray-600 w-28 truncate capitalize">{cat}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                                  style={{ width: `${(count / max) * 100}%` }} />
                              </div>
                              <span className="font-mono text-[10px] text-gray-500 w-4 text-right">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 font-mono text-xs py-4">No hook data tracked yet</p>
                  )}
                </div>

                {/* Upload History (live API) */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    <Radio size={14} className="text-blue-500" /> UPLOAD HISTORY (LIVE API)
                    {loadingLive && <Loader size={11} className="animate-spin text-blue-400 ml-auto" />}
                  </h3>
                  {uploadHistory ? (
                    <div className="text-xs font-mono text-gray-600 bg-gray-50 rounded-lg p-3 max-h-28 overflow-auto">
                      <pre className="whitespace-pre-wrap text-[10px]">{JSON.stringify(uploadHistory, null, 2).slice(0, 800)}</pre>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 font-mono text-xs py-4">
                      {profile?.uploadPost?.apiKey ? 'Loading...' : 'Add Upload-Post API key in Settings to pull live history'}
                    </p>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Diagnostics + Report + Network ── */}
              <div className="lg:col-span-3 space-y-4">

                {/* Diagnostics from all hooks */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> HOOK DIAGNOSTICS
                  </h3>
                  {Object.keys(diagCounts).length > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(diagCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <span className="font-mono text-[10px] text-gray-600 uppercase">{type}</span>
                          <Badge variant={DIAG_VARIANTS[type as DiagnosticType] || 'info'} size="sm">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 font-mono text-xs py-3">No diagnostics yet</p>
                  )}
                </div>

                {/* Latest AI report */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-amber-500" /> LATEST REPORT
                    {latestReport && <span className="ml-auto font-mono text-[9px] text-gray-400">{latestReport.date}</span>}
                  </h3>
                  {latestReport ? (
                    <>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-4">{latestReport.summary}</p>
                      {latestReport.recommendations.length > 0 && (
                        <ul className="space-y-1 mb-2">
                          {latestReport.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-500 font-mono">
                              <Zap size={9} className="text-amber-400 mt-0.5 flex-shrink-0" />{rec}
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* Diagnostic breakdown from report */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(latestReport.diagnosticBreakdown)
                          .filter(([, v]) => v > 0)
                          .map(([k, v]) => (
                            <Badge key={k} variant={k === 'scale' ? 'success' : k === 'fullReset' ? 'error' : 'warning'} size="sm">
                              {k} {v}
                            </Badge>
                          ))}
                      </div>
                      <button onClick={() => router.push('/marketing/analytics')}
                        className="mt-2 font-mono text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        Full analytics <ChevronRight size={10} />
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-gray-400 font-mono text-xs py-4">
                      Reports auto-generate at 07:00 SAST
                    </p>
                  )}
                </div>

                {/* Network status */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                    {netSpeed ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-gray-400" />}
                    NETWORK STATUS
                  </h3>
                  {netSpeed ? (
                    <div className="space-y-1.5">
                      {[
                        { label: 'DOWNLOAD', value: `${netSpeed.downlink} Mbps`, color: 'text-green-600' },
                        { label: 'TYPE', value: netSpeed.effectiveType.toUpperCase(), color: 'text-blue-600' },
                        { label: 'LATENCY', value: `${netSpeed.rtt}ms`, color: `${netSpeed.rtt < 50 ? 'text-green-600' : netSpeed.rtt < 150 ? 'text-amber-600' : 'text-red-600'}` },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="font-mono text-[10px] text-gray-500">{row.label}</span>
                          <span className={`font-mono text-xs font-bold ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-mono text-[10px] text-gray-400 text-center py-3">Network Information API unavailable</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── BOTTOM: Top Hooks Full Table ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs font-bold text-gray-500 tracking-wider flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" /> ALL HOOKS — SORTED BY IMPRESSIONS
                </h3>
                <button onClick={() => router.push('/marketing/analytics')}
                  className="font-mono text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  Full analytics <ChevronRight size={10} />
                </button>
              </div>

              {hooks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['HOOK', 'CATEGORY', 'IMPRESSIONS', 'CONVERSIONS', 'CVR%', 'DIAGNOSTIC', 'STATUS'].map(h => (
                          <th key={h} className={`py-2 px-2 font-mono text-[9px] text-gray-400 font-medium ${h === 'HOOK' ? 'text-left' : 'text-center'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hooks
                        .slice()
                        .sort((a, b) => b.impressions - a.impressions)
                        .map(hook => {
                          const diag = classifyPerformance(hook.impressions, hook.conversions);
                          const hookCvr = hook.impressions > 0 ? ((hook.conversions / hook.impressions) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={hook.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                              <td className="py-2 px-2 max-w-[200px] truncate text-gray-700 font-mono">{hook.hookText}</td>
                              <td className="py-2 px-2 text-center"><Badge variant="primary" size="sm">{hook.hookCategory}</Badge></td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-purple-600">{hook.impressions.toLocaleString()}</td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-green-600">{hook.conversions}</td>
                              <td className="py-2 px-2 text-center font-mono text-blue-600">{hookCvr}%</td>
                              <td className="py-2 px-2 text-center">
                                <Badge variant={DIAG_VARIANTS[diag.diagnostic]} size="sm">{diag.diagnostic}</Badge>
                              </td>
                              <td className="py-2 px-2 text-center">
                                <Badge variant={hook.status === 'doubleDown' ? 'success' : hook.status === 'dropped' ? 'error' : hook.status === 'testing' ? 'info' : 'warning'} size="sm">
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
                <div className="text-center py-8 text-gray-400">
                  <Target size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="font-mono text-xs">No hooks tracked yet. Post content to begin.</p>
                </div>
              )}
            </div>

            {/* ── Footer meta ── */}
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="font-mono text-[9px] text-gray-400">
                {lastRefresh ? `Firestore refreshed: ${lastRefresh.toLocaleTimeString('en-ZA', { timeZone: SA_TIMEZONE })} SAST` : 'Loading...'}
              </p>
              <p className="font-mono text-[9px] text-gray-400">
                {profile?.appName} · {platforms.length} platforms · {posts.length} posts · {hooks.length} hooks
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
