'use client';

import { useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { AuditReport } from '@/lib/audit-types';
import ScoreGauge from './components/ScoreGauge';
import CategoryScores from './components/CategoryScores';
import IssueCard from './components/IssueCard';
import SEOTable from './components/SEOTable';
import DataTable from './components/DataTable';
import ActionPlan from './components/ActionPlan';
import RadarChart from './components/RadarChart';
import ImpactChart from './components/ImpactChart';
import {
  Search,
  Globe,
  Download,
  Share2,
  AlertTriangle,
  TrendingUp,
  Eye,
  BarChart3,
  Target,
  Mail,
  Lightbulb,
  CheckCircle,
  Loader2,
  Sparkles,
  History,
  ExternalLink,
  Zap,
  Layout,
  Users,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ANALYSIS_STEPS = [
  { label: 'Fetching website content...', icon: Globe },
  { label: 'Analyzing page structure...', icon: Layout },
  { label: 'Evaluating SEO elements...', icon: Search },
  { label: 'Checking social proof signals...', icon: Users },
  { label: 'Scoring conversion mechanics...', icon: TrendingUp },
  { label: 'Generating recommendations...', icon: Sparkles },
];

export default function MarketAuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ url: string; score: number; date: string }>>([]);
  const [activeSection, setActiveSection] = useState('overview');
  const dashboardRef = useRef<HTMLDivElement>(null);

  const runAudit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setReport(data);
      setHistory((prev) => [
        { url: data.url, score: data.scores.overall, date: new Date().toLocaleDateString() },
        ...prev.slice(0, 9),
      ]);
      toast.success('Audit complete!');

      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze website';
      setError(message);
      toast.error(message);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Market Audit - ${report.domain}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: #0284c7; border-bottom: 3px solid #0284c7; padding-bottom: 10px; }
          h2 { color: #1e293b; margin-top: 30px; border-left: 4px solid #0284c7; padding-left: 12px; }
          h3 { color: #475569; }
          .score-big { font-size: 64px; color: ${report.scores.overall >= 70 ? '#2ea043' : report.scores.overall >= 50 ? '#e6a01e' : '#dc3c3c'}; text-align: center; font-weight: bold; }
          .score-label { text-align: center; color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #1e293b; color: #fff; padding: 10px 14px; text-align: left; font-size: 13px; }
          td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .critical { background: #fef2f2; color: #dc2626; }
          .high { background: #fffbeb; color: #d97706; }
          .medium { background: #eff6ff; color: #2563eb; }
          .solid { background: #f0fdf4; color: #16a34a; }
          .issue-box { border-left: 4px solid #dc2626; padding: 12px 16px; margin: 12px 0; background: #fef2f2; border-radius: 0 8px 8px 0; }
          .fix-box { border-left: 4px solid #2ea043; padding: 12px 16px; margin: 12px 0; background: #f0fdf4; border-radius: 0 8px 8px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #9ca3af; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Market Audit Report</h1>
        <p><strong>URL:</strong> ${report.url}</p>
        <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
        <p><strong>Domain:</strong> ${report.domain}</p>

        <div class="score-big">${report.scores.overall} / 100</div>
        <div class="score-label">Overall Score</div>

        <h2>Category Scores</h2>
        <table>
          <tr><th>Category</th><th>Score</th><th>Priority</th></tr>
          ${report.scores.categories.map((c) => `
            <tr>
              <td>${c.name}</td>
              <td><strong>${c.score} / ${c.maxScore}</strong></td>
              <td><span class="badge ${c.priority === 'Critical' ? 'critical' : c.priority === 'Needs Work' ? 'high' : 'solid'}">${c.priority}</span></td>
            </tr>
          `).join('')}
        </table>

        <h2>Critical Issues</h2>
        ${report.criticalIssues.map((issue) => `
          <div class="issue-box">
            <strong>${issue.title}</strong> <span class="badge ${issue.severity}">${issue.severity.toUpperCase()}</span>
            <p>${issue.description}</p>
            <div class="fix-box">
              <strong>Fix:</strong> ${issue.fix}
              ${issue.fixSteps ? `<ol>${issue.fixSteps.map((s) => `<li>${s}</li>`).join('')}</ol>` : ''}
            </div>
          </div>
        `).join('')}

        <h2>SEO Analysis</h2>
        <table>
          <tr><th>Element</th><th>Status</th><th>Details</th></tr>
          ${report.seoItems.map((item) => `
            <tr>
              <td>${item.issue}</td>
              <td><span class="badge ${item.status === 'good' ? 'solid' : item.status === 'needs-fix' ? 'high' : 'critical'}">${item.status}</span></td>
              <td>${item.fix}</td>
            </tr>
          `).join('')}
        </table>

        <h2>Conversion Optimizations</h2>
        ${report.conversionOptimizations.map((opt) => `
          <div class="fix-box">
            <strong>${opt.title}</strong>
            <p>${opt.recommendation}</p>
            <p><em>Estimated lift: ${opt.estimatedLift}</em></p>
          </div>
        `).join('')}

        <h2>Projected Impact</h2>
        <table>
          <tr><th>Optimization</th><th>Est. Conversion Lift</th><th>Revenue Impact</th></tr>
          ${report.projectedImpacts.map((p) => `
            <tr><td>${p.optimization}</td><td>${p.conversionLift}</td><td><span class="badge ${p.revenueImpact === 'High' ? 'solid' : p.revenueImpact === 'Medium' ? 'high' : 'medium'}">${p.revenueImpact}</span></td></tr>
          `).join('')}
        </table>

        <h2>30-Day Action Plan</h2>
        ${report.actionPlan.map((week) => `
          <h3>Week ${week.week}: ${week.title}</h3>
          <ul>${week.items.map((item) => `<li>${item.task}</li>`).join('')}</ul>
        `).join('')}

        <h2>Content Strategy — Hook Ideas</h2>
        <ul>${report.hookIdeas.map((h) => `<li>"${h.text}"</li>`).join('')}</ul>

        <h2>Email Marketing Flows</h2>
        <table>
          <tr><th>Flow</th><th>Emails</th><th>Description</th></tr>
          ${report.emailFlows.map((f) => `<tr><td>${f.name}</td><td>${f.emails}</td><td>${f.description}</td></tr>`).join('')}
        </table>

        <p class="footer">Generated by AI Market Audit Platform</p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'conversion', label: 'Conversion', icon: TrendingUp },
    { id: 'content', label: 'Content', icon: Lightbulb },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
    { id: 'action', label: 'Action Plan', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <header className="border-b border-primary-700/20 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-gold-500/20">
              <Sparkles size={24} className="text-gold-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Market Audit</h1>
              <p className="text-xs text-gray-500">Website Marketing &amp; Conversion Analysis</p>
            </div>
          </div>
          <a
            href="https://github.com/TumeloRamaphosa/ai-market-audit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5"
          >
            <ExternalLink size={14} />
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero Section */}
        {!report && !loading && (
          <div className="text-center mb-10 pt-8">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Audit any website in <span className="text-gradient">seconds</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get instant scores, critical issues, SEO analysis, content strategy, and a downloadable report — powered by AI.
            </p>
          </div>
        )}

        {/* URL Input Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary-950/80 to-dark-900/80 border-primary-700/40">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Globe size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && runAudit()}
                placeholder="Enter any website URL (e.g. https://example.com/products/...)"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-dark-800/80 border-primary-700/30 text-white placeholder-gray-500 text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                disabled={loading}
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={runAudit}
              isLoading={loading}
              icon={loading ? undefined : <Zap size={20} />}
              className="bg-gradient-accent text-dark-900 font-bold hover:shadow-glow-gold px-8 whitespace-nowrap"
            >
              {loading ? 'Analyzing...' : 'Run Audit'}
            </Button>
          </div>

          {/* Analysis progress */}
          {loading && (
            <div className="mt-6 space-y-3">
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-accent rounded-full transition-all duration-700"
                  style={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-3">
                {ANALYSIS_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  const isActive = i === analysisStep;
                  const isDone = i < analysisStep;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${
                        isActive ? 'text-gold-400' : isDone ? 'text-green-400' : 'text-gray-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle size={14} />
                      ) : isActive ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <StepIcon size={14} />
                      )}
                      <span className="hidden lg:inline">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={24} />
              <div>
                <p className="font-semibold text-red-300">Analysis Failed</p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Audits */}
        {!report && !loading && history.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <History size={20} className="text-primary-400" />
              Recent Audits
            </h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setUrl(item.url)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-primary-700/20 hover:border-primary-600/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{item.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <Badge variant={item.score >= 70 ? 'success' : item.score >= 50 ? 'warning' : 'error'} size="sm">
                      {item.score}/100
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* ==================== DASHBOARD ==================== */}
        {report && (
          <div ref={dashboardRef} className="animate-fade-in">

            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Audit Complete</span>
                </div>
                <h2 className="text-2xl font-bold">{report.domain}</h2>
                <p className="text-sm text-gray-400">{report.url}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={downloadPDF}>
                  Download PDF
                </Button>
                <Button variant="secondary" size="sm" icon={<Share2 size={16} />} onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}>
                  Share
                </Button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
              {sections.map((sec) => {
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeSection === sec.id
                        ? 'bg-primary-600 text-white shadow-glow-primary'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <SecIcon size={14} />
                    {sec.label}
                  </button>
                );
              })}
            </div>

            {/* ---- OVERVIEW ---- */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="flex items-center justify-center">
                    <ScoreGauge score={report.scores.overall} />
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Performance Radar</h3>
                    <RadarChart categories={report.scores.categories} />
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Category Breakdown</h3>
                    <CategoryScores categories={report.scores.categories} />
                  </Card>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issues Found</p>
                    <p className="text-3xl font-bold text-red-400">{report.criticalIssues.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {report.criticalIssues.filter((i) => i.severity === 'critical').length} critical
                    </p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SEO Score</p>
                    <p className="text-3xl font-bold text-amber-400">
                      {report.seoItems.filter((i) => i.status === 'good').length}/{report.seoItems.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">elements passing</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Optimizations</p>
                    <p className="text-3xl font-bold text-primary-400">{report.conversionOptimizations.length}</p>
                    <p className="text-xs text-gray-500 mt-1">opportunities found</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Lift</p>
                    <p className="text-3xl font-bold text-green-400">35-50%</p>
                    <p className="text-xs text-gray-500 mt-1">conversion increase</p>
                  </Card>
                </div>
                <Card>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-primary-400" />
                    Page Analysis
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(report.productPage).map(([key, value]) => (
                      <div key={key} className="flex flex-col p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-gray-300">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ---- ISSUES ---- */}
            {activeSection === 'issues' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-400" />
                    Critical Issues ({report.criticalIssues.length})
                  </h3>
                  <div className="flex gap-2">
                    {['critical', 'high', 'medium'].map((sev) => {
                      const count = report.criticalIssues.filter((i) => i.severity === sev).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={sev} variant={sev === 'critical' ? 'error' : sev === 'high' ? 'warning' : 'info'} size="sm">
                          {count} {sev}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                {report.criticalIssues.map((issue, i) => (
                  <IssueCard key={issue.id} issue={issue} index={i} />
                ))}
              </div>
            )}

            {/* ---- SEO ---- */}
            {activeSection === 'seo' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Search size={20} className="text-primary-400" />
                  SEO &amp; Discoverability
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {['good', 'needs-fix', 'missing'].map((status) => {
                    const count = report.seoItems.filter((i) => i.status === status).length;
                    const config: Record<string, { label: string; color: string }> = {
                      'good': { label: 'Passing', color: 'text-green-400' },
                      'needs-fix': { label: 'Needs Fix', color: 'text-amber-400' },
                      'missing': { label: 'Missing', color: 'text-red-400' },
                    };
                    const c = config[status];
                    return (
                      <Card key={status}>
                        <p className="text-xs text-gray-500 uppercase mb-1">{c.label}</p>
                        <p className={`text-3xl font-bold ${c.color}`}>{count}</p>
                      </Card>
                    );
                  })}
                </div>
                <SEOTable items={report.seoItems} />
              </div>
            )}

            {/* ---- CONVERSION ---- */}
            {activeSection === 'conversion' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Conversion Optimizations
                </h3>
                {report.conversionOptimizations.map((opt) => (
                  <Card key={opt.id} className="border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white">{opt.title}</h4>
                      <Badge variant="success" size="sm">{opt.estimatedLift}</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{opt.currentState}</p>
                    <p className="text-sm text-gray-300 mb-3">{opt.recommendation}</p>
                    <div className="space-y-2 mt-3">
                      {opt.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-primary-400 font-mono mt-0.5 w-5">{i + 1}.</span>
                          <p className="text-sm text-gray-400">{step}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                <h3 className="text-lg font-semibold flex items-center gap-2 mt-8">
                  <Users size={20} className="text-primary-400" />
                  Competitive Landscape
                </h3>
                <DataTable
                  columns={[
                    { key: 'name', header: 'Competitor', width: '25%' },
                    { key: 'strengths', header: 'Strengths' },
                    { key: 'weaknesses', header: 'Weaknesses' },
                  ]}
                  data={report.competitors as unknown as Record<string, unknown>[]}
                />
                <Card>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Advantages</h4>
                  <div className="space-y-2">
                    {report.competitiveAdvantages.map((adv, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-white">{adv.title}</span>
                          <span className="text-sm text-gray-400"> — {adv.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ---- CONTENT ---- */}
            {activeSection === 'content' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb size={20} className="text-gold-400" />
                  Content Strategy
                </h3>
                <DataTable
                  columns={[
                    { key: 'pillar', header: 'Pillar', width: '20%' },
                    { key: 'ideas', header: 'Content Ideas' },
                    { key: 'platform', header: 'Platform', width: '25%' },
                  ]}
                  data={report.contentPillars as unknown as Record<string, unknown>[]}
                />
                <Card>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Hook Ideas for Short-Form Video</h4>
                  <div className="space-y-3">
                    {report.hookIdeas.map((hook, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-gold-400 font-mono text-sm mt-0.5">#{i + 1}</span>
                        <div>
                          <p className="text-sm text-gray-200 font-medium">&ldquo;{hook.text}&rdquo;</p>
                          <Badge variant="primary" size="sm" className="mt-1">{hook.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ---- EMAIL ---- */}
            {activeSection === 'email' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail size={20} className="text-primary-400" />
                  Email Marketing Flows
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.emailFlows.map((flow, i) => (
                    <Card key={i}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{flow.name}</h4>
                        <Badge variant="primary" size="sm">{flow.emails} emails</Badge>
                      </div>
                      <p className="text-sm text-gray-400">{flow.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ---- IMPACT ---- */}
            {activeSection === 'impact' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 size={20} className="text-green-400" />
                  Projected Impact
                </h3>
                <Card>
                  <ImpactChart impacts={report.projectedImpacts} />
                  <div className="flex items-center gap-4 mt-4 justify-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-green-500/80" />
                      <span className="text-xs text-gray-400">High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-500/80" />
                      <span className="text-xs text-gray-400">Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-blue-500/80" />
                      <span className="text-xs text-gray-400">Long-term</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-red-500/80" />
                      <span className="text-xs text-gray-400">Prevents bounce</span>
                    </div>
                  </div>
                </Card>
                <DataTable
                  columns={[
                    { key: 'optimization', header: 'Optimization' },
                    { key: 'conversionLift', header: 'Est. Conversion Lift' },
                    {
                      key: 'revenueImpact', header: 'Revenue Impact',
                      render: (value) => {
                        const v = value as string;
                        const variant = v === 'High' ? 'success' : v === 'Medium' ? 'warning' : v === 'Long-term' ? 'info' : 'error';
                        return <Badge variant={variant} size="sm">{v}</Badge>;
                      },
                    },
                  ]}
                  data={report.projectedImpacts as unknown as Record<string, unknown>[]}
                />
                <Card className="bg-gradient-to-r from-green-900/20 to-primary-900/20 border-green-700/30">
                  <p className="text-sm text-gray-300 font-medium">{report.summaryEstimate}</p>
                </Card>
              </div>
            )}

            {/* ---- ACTION PLAN ---- */}
            {activeSection === 'action' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target size={20} className="text-gold-400" />
                  30-Day Action Plan
                </h3>
                <ActionPlan weeks={report.actionPlan} />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-primary-700/20 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>AI Market Audit Platform — Open source website marketing analysis tool</p>
        </div>
      </footer>
    </div>
  );
}
