'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  UserPlus,
  Activity,
  Target,
  Zap,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { marketingApi, classifyPerformance } from '@/lib/marketing-api';
import type {
  MarketingProfile,
  MarketingPost,
  MarketingReport,
  HookPerformance,
  DiagnosticType,
} from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

const DIAGNOSTIC_STYLES: Record<DiagnosticType, { label: string; color: string; variant: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
  scale: { label: 'SCALE', color: 'text-green-400', variant: 'success' },
  'fix-cta': { label: 'FIX CTA', color: 'text-amber-400', variant: 'warning' },
  'fix-hooks': { label: 'FIX HOOKS', color: 'text-blue-400', variant: 'info' },
  'full-reset': { label: 'FULL RESET', color: 'text-red-400', variant: 'error' },
  'cta-issue': { label: 'CTA ISSUE', color: 'text-amber-400', variant: 'warning' },
  'app-issue': { label: 'APP ISSUE', color: 'text-red-400', variant: 'error' },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [reports, setReports] = useState<MarketingReport[]>([]);
  const [hooks, setHooks] = useState<HookPerformance[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
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
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadData();
  }, [user]);

  const postedPosts = posts.filter((p) => p.status === 'posted');
  const hookCategories = hooks.reduce(
    (acc, h) => {
      acc[h.hookCategory] = (acc[h.hookCategory] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const hooksByStatus = hooks.reduce(
    (acc, h) => {
      acc[h.status] = (acc[h.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'hooks', label: 'Hook Performance', icon: <Target size={16} /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Activity size={16} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={18} />}
                onClick={() => router.push('/marketing')}
              >
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BarChart3 size={28} className="text-primary-400" />
                  Analytics & Intelligence
                </h1>
                <p className="text-gray-400">
                  Data-driven insights for your marketing pipeline
                </p>
              </div>
            </div>

            <Tabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Platform Metrics */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Total Posts</p>
                          <p className="text-3xl font-bold">{postedPosts.length}</p>
                        </div>
                        <TrendingUp className="text-green-400" size={24} />
                      </div>
                      <p className="text-green-400 text-sm mt-3">
                        <ArrowUpRight size={14} className="inline" /> Published
                      </p>
                    </Card>

                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Hooks Tracked</p>
                          <p className="text-3xl font-bold">{hooks.length}</p>
                        </div>
                        <Target className="text-primary-400" size={24} />
                      </div>
                      <p className="text-primary-400 text-sm mt-3">
                        {hooksByStatus['doubleDown'] || 0} winning
                      </p>
                    </Card>

                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Platforms</p>
                          <p className="text-3xl font-bold">
                            {profile?.uploadPost.platforms.length || 0}
                          </p>
                        </div>
                        <Users className="text-emerald-400" size={24} />
                      </div>
                      <p className="text-emerald-400 text-sm mt-3">Connected</p>
                    </Card>

                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Reports</p>
                          <p className="text-3xl font-bold">{reports.length}</p>
                        </div>
                        <FileText className="text-amber-400" size={24} />
                      </div>
                      <p className="text-amber-400 text-sm mt-3">Daily diagnostics</p>
                    </Card>
                  </div>

                  {/* Hook Category Breakdown */}
                  <Card>
                    <h2 className="text-xl font-bold mb-6">Hook Category Performance</h2>
                    <div className="space-y-3">
                      {Object.entries(hookCategories).length > 0 ? (
                        Object.entries(hookCategories)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, count]) => (
                            <div
                              key={category}
                              className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="primary" size="sm">
                                  {category}
                                </Badge>
                                <span className="text-sm text-gray-300">
                                  {count} post{count !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex-1 mx-4 max-w-xs">
                                <div className="h-2 bg-dark-800 rounded-full">
                                  <div
                                    className="h-full bg-gradient-accent rounded-full"
                                    style={{
                                      width: `${
                                        (count / Math.max(...Object.values(hookCategories))) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No hook data yet. Start posting to track performance!
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Hook Performance Tab */}
              {activeTab === 'hooks' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-bold mb-6">Hook Performance Tracker</h2>
                    {hooks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-primary-700/20">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Hook Text
                              </th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                Category
                              </th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">
                                Impressions
                              </th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">
                                Conversions
                              </th>
                              <th className="text-center py-3 px-4 text-gray-400 font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {hooks.map((hook) => (
                              <tr
                                key={hook.id}
                                className="border-b border-primary-700/10 hover:bg-dark-800/30"
                              >
                                <td className="py-3 px-4 max-w-xs truncate">
                                  {hook.hookText}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="primary" size="sm">
                                    {hook.hookCategory}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                  {hook.impressions.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                  {hook.conversions}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge
                                    variant={
                                      hook.status === 'doubleDown'
                                        ? 'success'
                                        : hook.status === 'dropped'
                                        ? 'error'
                                        : hook.status === 'testing'
                                        ? 'info'
                                        : 'warning'
                                    }
                                    size="sm"
                                  >
                                    {hook.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Target size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No hook performance data yet.</p>
                        <p className="text-sm mt-2">
                          Post content and track results to see hook analytics.
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Decision Rules */}
                  <Card>
                    <h2 className="text-xl font-bold mb-4">Decision Rules</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-900/10 border border-green-600/20">
                        <h3 className="font-bold text-green-400 mb-2">
                          Growing (5K+/day)
                        </h3>
                        <p className="text-sm text-gray-300">
                          DOUBLE DOWN - Create 3 variations immediately
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-600/20">
                        <h3 className="font-bold text-blue-400 mb-2">
                          Steady (1K-5K/day)
                        </h3>
                        <p className="text-sm text-gray-300">
                          Keep in rotation with minor adjustments
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-900/10 border border-amber-600/20">
                        <h3 className="font-bold text-amber-400 mb-2">
                          Declining (&lt;1K/day)
                        </h3>
                        <p className="text-sm text-gray-300">
                          Try 1 more variation, then consider dropping
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-900/10 border border-red-600/20">
                        <h3 className="font-bold text-red-400 mb-2">
                          Consistently Low
                        </h3>
                        <p className="text-sm text-gray-300">
                          DROP - Try a radically different approach
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Diagnostics Tab */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-xl font-bold mb-6">
                      Two-Axis Diagnostic Framework
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Based on Upload-Post impressions + conversion data. This framework guides content optimization.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {(
                        Object.entries(DIAGNOSTIC_STYLES) as [
                          DiagnosticType,
                          (typeof DIAGNOSTIC_STYLES)[DiagnosticType],
                        ][]
                      ).map(([type, style]) => {
                        const result = classifyPerformance(
                          type === 'scale' || type === 'fix-cta' || type === 'cta-issue'
                            ? 10000
                            : 500,
                          type === 'scale' || type === 'fix-hooks' ? 50 : 2,
                          type === 'app-issue' ? 100 : undefined,
                          type === 'app-issue' ? 2 : undefined
                        );

                        return (
                          <div
                            key={type}
                            className="p-4 rounded-lg bg-dark-800/50 border border-primary-700/20"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant={style.variant}>{style.label}</Badge>
                              <Zap size={16} className={style.color} />
                            </div>
                            <p className="text-sm text-gray-300">{result.action}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Performance Benchmarks */}
                  <Card>
                    <h2 className="text-xl font-bold mb-4">Conversion Benchmarks</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm">Views-to-Download Baseline</span>
                        <span className="font-bold text-gray-300">1%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm">Solid Performance</span>
                        <span className="font-bold text-green-400">1.5-3%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm">Exceptional Results</span>
                        <span className="font-bold text-gold-400">3%+</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <Card key={report.id}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold">
                              Daily Report — {report.date}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Period: {report.period.start} to {report.period.end}
                            </p>
                          </div>
                          <Badge variant="info" size="sm">
                            <FileText size={12} />
                            Report
                          </Badge>
                        </div>

                        <div className="prose prose-invert max-w-none text-sm mb-4">
                          <p className="text-gray-300 whitespace-pre-line">
                            {report.summary}
                          </p>
                        </div>

                        {report.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-bold text-sm text-gray-400 mb-2">
                              Recommendations
                            </h4>
                            <ul className="space-y-1">
                              {report.recommendations.map((rec, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-300 flex items-start gap-2"
                                >
                                  <Zap
                                    size={14}
                                    className="text-primary-400 mt-0.5 flex-shrink-0"
                                  />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Diagnostic Breakdown */}
                        <div className="mt-4 flex gap-3">
                          {Object.entries(report.diagnosticBreakdown).map(
                            ([key, value]) =>
                              value > 0 && (
                                <Badge key={key} variant="primary" size="sm">
                                  {key}: {value}
                                </Badge>
                              )
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <div className="text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No reports generated yet.</p>
                        <p className="text-sm mt-2">
                          Daily reports are generated automatically at 7:00 AM based on your posting activity.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
