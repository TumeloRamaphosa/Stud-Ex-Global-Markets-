'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Link2,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  BarChart3,
  Clock,
  Hash,
  Award,
  ArrowUpRight,
  Copy,
  CheckCircle,
  Loader2,
  Instagram,
  Globe,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  analyzeInstagramPost,
  isValidInstagramUrl,
  ANALYSIS_STAGES,
  type InstagramAnalysis,
  type AnalysisStage,
} from '@/lib/instagram-analytics';

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-dark-800/80`}>{icon}</div>
      </div>
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </Card>
  );
}

export default function InstagramAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stages, setStages] = useState<AnalysisStage[]>([]);
  const [analysis, setAnalysis] = useState<InstagramAnalysis | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleAnalyze() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please paste an Instagram post URL');
      return;
    }
    if (!isValidInstagramUrl(trimmedUrl)) {
      setError('Please enter a valid Instagram post, reel, or story URL');
      return;
    }

    setError('');
    setAnalysis(null);
    setIsAnalyzing(true);

    // Initialize stages
    const initialStages: AnalysisStage[] = ANALYSIS_STAGES.map((s) => ({
      ...s,
      status: 'pending',
    }));
    setStages(initialStages);

    // Animate through stages
    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));
      setStages((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx < i ? 'complete' : idx === i ? 'active' : 'pending',
        }))
      );
    }

    // Final stage complete
    await new Promise((resolve) => setTimeout(resolve, 300));
    setStages((prev) => prev.map((s) => ({ ...s, status: 'complete' })));

    // Generate analysis
    const result = analyzeInstagramPost(trimmedUrl);
    await new Promise((resolve) => setTimeout(resolve, 200));

    setAnalysis(result);
    setIsAnalyzing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text');
    if (isValidInstagramUrl(pasted)) {
      setTimeout(() => handleAnalyze(), 100);
    }
  }

  async function copyResults() {
    if (!analysis) return;
    const text = `Instagram Analytics Report
Post: ${analysis.postUrl}
Type: ${analysis.postType}
Score: ${analysis.scores.overall}/100

Engagement:
- Likes: ${formatNumber(analysis.engagement.likes)}
- Comments: ${formatNumber(analysis.engagement.comments)}
- Shares: ${formatNumber(analysis.engagement.shares)}
- Saves: ${formatNumber(analysis.engagement.saves)}
- Engagement Rate: ${analysis.engagement.engagementRate}%
- Reach: ${formatNumber(analysis.engagement.reachEstimate)}
- Impressions: ${formatNumber(analysis.engagement.impressions)}

Performance Scores:
- Content Quality: ${analysis.scores.contentQuality}/100
- Engagement Velocity: ${analysis.scores.engagementVelocity}/100
- Audience Resonance: ${analysis.scores.audienceResonance}/100
- Virality Index: ${analysis.scores.viralityIndex}/100

Benchmark: Top ${analysis.benchmark.percentileRank}% (vs ${analysis.benchmark.comparedTo} similar posts)

Analyzed by Stud-Ex Proprietary Analytics Engine`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const impactColors = {
    high: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

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
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                    <Instagram size={24} className="text-white" />
                  </div>
                  Instagram Analytics
                </h1>
                <p className="text-gray-400">
                  Powered by Stud-Ex Proprietary Data Science Engine
                </p>
              </div>
            </div>

            {/* URL Input Section */}
            <Card className="mb-8 border-primary-600/40 bg-gradient-to-br from-dark-900/80 to-primary-950/20">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">Analyze Any Instagram Post</h2>
                <p className="text-gray-400 text-sm">
                  Paste any Instagram post, reel, or story URL below and our proprietary
                  analysis engine will generate comprehensive performance intelligence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Link2 size={18} />
                  </div>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="https://www.instagram.com/p/... or /reel/..."
                    className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 pl-10 pr-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={isAnalyzing}
                  />
                </div>
                <Button
                  size="lg"
                  icon={
                    isAnalyzing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Sparkles size={20} />
                    )
                  }
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url.trim()}
                  className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Post'}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-400 text-sm justify-center">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold">Running Proprietary Analysis</h3>
                    <p className="text-sm text-gray-400">
                      Our data science engine is processing your post...
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {stages.map((stage) => (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        stage.status === 'active'
                          ? 'bg-primary-600/10 border border-primary-600/30'
                          : stage.status === 'complete'
                          ? 'bg-green-900/10 border border-green-600/20'
                          : 'bg-dark-800/30 border border-transparent'
                      }`}
                    >
                      {stage.status === 'complete' ? (
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                      ) : stage.status === 'active' ? (
                        <Loader2 size={18} className="text-primary-400 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border border-gray-600 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          stage.status === 'active'
                            ? 'text-primary-300'
                            : stage.status === 'complete'
                            ? 'text-green-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        analysis.postType === 'reel'
                          ? 'primary'
                          : analysis.postType === 'carousel'
                          ? 'info'
                          : 'success'
                      }
                    >
                      {analysis.postType.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-400 truncate max-w-md">
                      {analysis.postUrl}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    onClick={copyResults}
                  >
                    {copied ? 'Copied!' : 'Copy Report'}
                  </Button>
                </div>

                {/* Overall Score + Sub-scores */}
                <Card className="border-primary-600/40">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award size={22} className="text-gold-500" />
                    Proprietary Performance Score
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                    <ScoreRing score={analysis.scores.overall} size={140} label="Overall Score" />
                    <div className="flex flex-wrap gap-6 justify-center">
                      <ScoreRing
                        score={analysis.scores.contentQuality}
                        size={90}
                        label="Content Quality"
                      />
                      <ScoreRing
                        score={analysis.scores.engagementVelocity}
                        size={90}
                        label="Eng. Velocity"
                      />
                      <ScoreRing
                        score={analysis.scores.audienceResonance}
                        size={90}
                        label="Audience Resonance"
                      />
                      <ScoreRing
                        score={analysis.scores.viralityIndex}
                        size={90}
                        label="Virality Index"
                      />
                    </div>
                  </div>
                </Card>

                {/* Engagement Metrics Grid */}
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary-400" />
                    Engagement Metrics
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      icon={<Heart size={20} className="text-red-400" />}
                      label="Likes"
                      value={formatNumber(analysis.engagement.likes)}
                      color="bg-red-500"
                    />
                    <MetricCard
                      icon={<MessageCircle size={20} className="text-blue-400" />}
                      label="Comments"
                      value={formatNumber(analysis.engagement.comments)}
                      color="bg-blue-500"
                    />
                    <MetricCard
                      icon={<Share2 size={20} className="text-green-400" />}
                      label="Shares"
                      value={formatNumber(analysis.engagement.shares)}
                      color="bg-green-500"
                    />
                    <MetricCard
                      icon={<Bookmark size={20} className="text-amber-400" />}
                      label="Saves"
                      value={formatNumber(analysis.engagement.saves)}
                      color="bg-amber-500"
                    />
                    <MetricCard
                      icon={<TrendingUp size={20} className="text-emerald-400" />}
                      label="Engagement Rate"
                      value={`${analysis.engagement.engagementRate}%`}
                      subtext={analysis.engagement.engagementRate > 3 ? 'Above average' : 'Room to improve'}
                      color="bg-emerald-500"
                    />
                    <MetricCard
                      icon={<Eye size={20} className="text-purple-400" />}
                      label="Est. Reach"
                      value={formatNumber(analysis.engagement.reachEstimate)}
                      color="bg-purple-500"
                    />
                    <MetricCard
                      icon={<Globe size={20} className="text-cyan-400" />}
                      label="Impressions"
                      value={formatNumber(analysis.engagement.impressions)}
                      color="bg-cyan-500"
                    />
                    <MetricCard
                      icon={<Users size={20} className="text-pink-400" />}
                      label="Profile Visits"
                      value={formatNumber(analysis.engagement.profileVisits)}
                      color="bg-pink-500"
                    />
                  </div>
                </div>

                {/* Two Column: Audience + Benchmark */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Audience Insights */}
                  <Card>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Users size={20} className="text-emerald-400" />
                      Audience Intelligence
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm text-gray-400">Est. Followers</span>
                        <span className="font-bold">
                          {formatNumber(analysis.audience.estimatedFollowers)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm text-gray-400">Active Audience</span>
                        <span className="font-bold text-green-400">
                          {analysis.audience.activeAudiencePercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm text-gray-400">Top Demographic</span>
                        <Badge variant="primary" size="sm">
                          {analysis.audience.topDemographic}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm text-gray-400 block mb-2">Peak Active Hours</span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.audience.peakActiveHours.map((h) => (
                            <span
                              key={h}
                              className="text-xs px-2 py-1 rounded-full bg-primary-600/20 text-primary-300 border border-primary-600/30"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800/50">
                        <span className="text-sm text-gray-400 flex items-center gap-1 mb-2">
                          <MapPin size={14} /> Top Locations
                        </span>
                        <div className="space-y-2">
                          {analysis.audience.topLocations.slice(0, 4).map((loc) => (
                            <div key={loc.city} className="flex items-center gap-2">
                              <span className="text-sm flex-1">{loc.city}</span>
                              <div className="flex-1 h-1.5 bg-dark-700 rounded-full">
                                <div
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${loc.percent * 3}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 w-8 text-right">
                                {loc.percent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Competitive Benchmark + Optimization */}
                  <div className="space-y-6">
                    <Card>
                      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Target size={20} className="text-gold-500" />
                        Competitive Benchmark
                      </h2>
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-gold-400 mb-1">
                          Top {analysis.benchmark.percentileRank}%
                        </div>
                        <p className="text-sm text-gray-400">
                          vs {formatNumber(analysis.benchmark.comparedTo)} similar posts
                        </p>
                      </div>
                      <div className="w-full h-3 bg-dark-800 rounded-full mb-4">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 transition-all duration-1000"
                          style={{ width: `${analysis.benchmark.percentileRank}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>Bottom</span>
                        <span>Average</span>
                        <span>Top</span>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800/50 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Niche Avg Engagement</span>
                        <span className="font-bold">{analysis.benchmark.nicheAvgEngagement}%</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-4 p-3 rounded-lg bg-primary-900/10 border border-primary-700/20">
                        {analysis.benchmark.verdict}
                      </p>
                    </Card>

                    <Card>
                      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-amber-400" />
                        Posting Optimization
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                          <Calendar size={18} className="mx-auto text-amber-400 mb-1" />
                          <p className="text-xs text-gray-400">Best Day</p>
                          <p className="font-bold text-sm">{analysis.optimization.bestDay}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                          <Clock size={18} className="mx-auto text-primary-400 mb-1" />
                          <p className="text-xs text-gray-400">Best Time</p>
                          <p className="font-bold text-sm">{analysis.optimization.bestTime}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                          <TrendingUp size={18} className="mx-auto text-green-400 mb-1" />
                          <p className="text-xs text-gray-400">Frequency</p>
                          <p className="font-bold text-sm">{analysis.optimization.optimalFrequency}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                          <FileText size={18} className="mx-auto text-purple-400 mb-1" />
                          <p className="text-xs text-gray-400">Caption</p>
                          <p className="font-bold text-sm">Optimized</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3 p-2 rounded bg-dark-800/30">
                        {analysis.optimization.captionLengthAdvice}
                      </p>
                    </Card>
                  </div>
                </div>

                {/* Hashtag Analysis */}
                <Card>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Hash size={20} className="text-blue-400" />
                    Hashtag Analysis
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {analysis.hashtags.topPerforming.map((ht) => (
                      <div
                        key={ht.tag}
                        className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-primary-700/10"
                      >
                        <div>
                          <span className="text-sm font-medium text-primary-300">{ht.tag}</span>
                          <p className="text-xs text-gray-500">
                            {formatNumber(ht.reach)} reach
                          </p>
                        </div>
                        <Badge
                          variant={
                            ht.competition === 'low'
                              ? 'success'
                              : ht.competition === 'medium'
                              ? 'warning'
                              : 'error'
                          }
                          size="sm"
                        >
                          {ht.competition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-primary-900/10 border border-primary-700/20 flex items-start gap-2">
                    <Zap size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{analysis.hashtags.recommendation}</p>
                  </div>
                </Card>

                {/* AI Recommendations */}
                <Card className="border-gold-500/20">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-gold-500" />
                    AI-Powered Recommendations
                  </h2>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-dark-800/40 border border-primary-700/10 hover:border-primary-600/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${impactColors[rec.impact]}`}
                            >
                              {rec.impact.toUpperCase()} IMPACT
                            </span>
                            <Badge variant="primary" size="sm">
                              {rec.category}
                            </Badge>
                          </div>
                          <ArrowUpRight size={16} className="text-gray-500" />
                        </div>
                        <h3 className="font-bold text-sm mb-1">{rec.title}</h3>
                        <p className="text-sm text-gray-400">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Footer Disclaimer */}
                <div className="text-center py-4">
                  <p className="text-xs text-gray-600">
                    Analysis generated by Stud-Ex Proprietary Data Science Engine.
                    Results are based on advanced algorithmic modeling of publicly available data.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!analysis && !isAnalyzing && (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10 border border-purple-500/20 mb-6">
                  <Instagram size={48} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  Paste any Instagram post URL above and our proprietary data science engine
                  will deliver comprehensive performance intelligence in seconds.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-xl bg-dark-800/30 border border-primary-700/10">
                    <BarChart3 size={24} className="mx-auto text-primary-400 mb-2" />
                    <p className="text-sm font-medium">Deep Engagement Metrics</p>
                    <p className="text-xs text-gray-500 mt-1">Likes, shares, saves & more</p>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800/30 border border-primary-700/10">
                    <Award size={24} className="mx-auto text-gold-500 mb-2" />
                    <p className="text-sm font-medium">Performance Scoring</p>
                    <p className="text-xs text-gray-500 mt-1">Proprietary 0-100 score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-800/30 border border-primary-700/10">
                    <Sparkles size={24} className="mx-auto text-purple-400 mb-2" />
                    <p className="text-sm font-medium">AI Recommendations</p>
                    <p className="text-xs text-gray-500 mt-1">Actionable growth insights</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
