'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import LarrySkillChat from '@/components/LarrySkillChat';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Play,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  getLarryWorkflowManager,
  type LarryWorkflowSession,
} from '@/lib/larry-workflow';

type Step = 'intro' | 'setup' | 'workflow' | 'report';

export default function LarrySkillPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [expandedSections, setExpandedSections] = useState({
    whatIs: true,
    how: false,
    workflow: false,
  });

  // Setup form state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  // Workflow state
  const [session, setSession] = useState<LarryWorkflowSession | null>(null);
  const [running, setRunning] = useState(false);
  const [reportText, setReportText] = useState('');
  const manager = getLarryWorkflowManager();

  const handleStartCampaign = () => {
    if (!campaignTitle || !niche) {
      alert('Please fill in campaign title and niche');
      return;
    }

    const newSession = manager.createSession(campaignTitle, niche);
    setSession(newSession);
    setCurrentStep('workflow');
  };

  const handleRunWorkflow = async () => {
    if (!session) return;

    setRunning(true);
    const sessionId = session.id;
    const contextInfo = `Campaign: ${campaignTitle}, Niche: ${niche}, Audience: ${targetAudience}`;

    try {
      // Step 1: Generate Hook
      manager.updateStepStatus(sessionId, 'hook', 'in_progress');
      await simulateDelay(1000);

      const hookResponse = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate ONE compelling hook using the Larry Skill methodology for: ${campaignTitle} in the ${niche} niche targeting ${targetAudience}. Use one of these formulas: person-conflict, budget, self-discovery, before-after, or POV. Return ONLY the hook text.`,
            },
          ],
          context: contextInfo,
        }),
      });

      const hookData = await hookResponse.json();
      const hook = hookData.content || 'Hook generated';
      manager.updateReportData(sessionId, { hookFormula: hook });
      manager.updateStepStatus(sessionId, 'hook', 'completed', hook);

      // Step 2: Create Slides
      manager.updateStepStatus(sessionId, 'slides', 'in_progress');
      await simulateDelay(1500);

      const slidesResponse = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Create 6 slide texts for a carousel post with this hook: "${hook}". Format as numbered list. Slides: 1=Hook, 2=Problem, 3=Discovery, 4=Transformation, 5=Result, 6=CTA. Be specific and compelling.`,
            },
          ],
          context: contextInfo,
        }),
      });

      const slidesData = await slidesResponse.json();
      const slideTexts = slidesData.content
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 6);
      manager.updateReportData(sessionId, { slides: slideTexts });
      manager.updateStepStatus(sessionId, 'slides', 'completed', `${slideTexts.length} slides created`);

      // Step 3: Write Caption & CTA
      manager.updateStepStatus(sessionId, 'caption', 'in_progress');
      await simulateDelay(1000);

      const captionResponse = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a compelling social media caption (max 150 chars) and a CTA for this campaign about "${campaignTitle}" targeting "${targetAudience}". Format as: CAPTION: ... CTA: ...`,
            },
          ],
          context: contextInfo,
        }),
      });

      const captionData = await captionResponse.json();
      const captionMatch = captionData.content.match(/CAPTION:\s*(.+?)(?=CTA:|$)/s);
      const ctaMatch = captionData.content.match(/CTA:\s*(.+?)$/s);

      const caption = captionMatch ? captionMatch[1].trim() : captionData.content;
      const cta = ctaMatch ? ctaMatch[1].trim() : 'Check it out!';

      manager.updateReportData(sessionId, { caption, cta });
      manager.updateStepStatus(sessionId, 'caption', 'completed', `Caption & CTA created`);

      // Step 4: Schedule Posts
      manager.updateStepStatus(sessionId, 'schedule', 'in_progress');
      await simulateDelay(800);

      const scheduledTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      manager.updateReportData(sessionId, { scheduledTime });
      manager.addMemory(sessionId, 'successFormulas', hook);
      manager.updateStepStatus(sessionId, 'schedule', 'completed', `Posted to TikTok, Instagram`);

      // Step 5: Monitor & Report
      manager.updateStepStatus(sessionId, 'monitor', 'in_progress');
      await simulateDelay(1200);

      const mockEngagement = {
        views: Math.floor(Math.random() * 50000) + 1000,
        likes: Math.floor(Math.random() * 2000),
        shares: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 300),
      };

      manager.updateReportData(sessionId, { engagement: mockEngagement });
      manager.addMemory(sessionId, 'performancePatterns', `${niche} audience responds to ${hook.substring(0, 30)}...`);
      manager.addMemory(sessionId, 'optimizations', `Try best posting time: ${scheduledTime.getHours()}:00`);
      manager.updateStepStatus(sessionId, 'monitor', 'completed', 'Campaign live, tracking enabled');

      // Generate final report
      const finalReport = manager.generateReport(sessionId);
      setReportText(finalReport);
      setSession(manager.getSession(sessionId) || null);
      setCurrentStep('report');
    } catch (error) {
      console.error('Workflow error:', error);
      manager.updateStepStatus(sessionId, 'hook', 'failed', '', 'Error generating content');
    } finally {
      setRunning(false);
    }
  };

  const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `larry-skill-report-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            {currentStep === 'intro' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-2 text-4xl font-bold mb-3">
                      <Sparkles className="text-amber-500" size={40} />
                      Larry Skill Marketing Platform
                      <Sparkles className="text-amber-500" size={40} />
                    </div>
                    <p className="text-xl text-slate-600">
                      AI-Powered Automated Content Pipeline for Viral Growth
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/larry-skill/campaigns')}
                    className="bg-slate-600 hover:bg-slate-700"
                  >
                    View All Campaigns
                  </Button>
                </div>

                {/* What Is Section */}
                <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div
                    className="flex items-center justify-between cursor-pointer p-4"
                    onClick={() => toggleSection('whatIs')}
                  >
                    <h2 className="text-2xl font-bold text-blue-900">What is the Larry Skill?</h2>
                    {expandedSections.whatIs ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {expandedSections.whatIs && (
                    <div className="px-4 pb-4 space-y-4 border-t border-blue-200 pt-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp className="text-amber-500" size={20} />
                            Proven Results
                          </h3>
                          <p className="text-sm">
                            7M+ views, 1M+ TikTok followers, $670/month MRR
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold flex items-center gap-2">
                            <Zap className="text-amber-500" size={20} />
                            Automated Pipeline
                          </h3>
                          <p className="text-sm">
                            From hook creation to multi-platform posting to analytics
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold flex items-center gap-2">
                            <Sparkles className="text-amber-500" size={20} />
                            Data-Driven
                          </h3>
                          <p className="text-sm">
                            Real-time tracking, optimization, and memory-based learning
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded p-4 space-y-2">
                        <h4 className="font-semibold">The Complete Funnel</h4>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>🎣 <strong>Hook:</strong> Viral formulas (person-conflict, budget, POV, etc.)</li>
                          <li>📸 <strong>Create:</strong> 6-slide carousel posts with AI</li>
                          <li>🚀 <strong>Post:</strong> Auto-distribute to TikTok, Instagram, LinkedIn</li>
                          <li>📊 <strong>Track:</strong> Real-time engagement metrics</li>
                          <li>🎯 <strong>Optimize:</strong> Learn patterns and improve</li>
                          <li>🔄 <strong>Repeat:</strong> Scale what works</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </Card>

                {/* How It Works */}
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                  <div
                    className="flex items-center justify-between cursor-pointer p-4"
                    onClick={() => toggleSection('how')}
                  >
                    <h2 className="text-2xl font-bold text-green-900">Step-by-Step Guide</h2>
                    {expandedSections.how ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {expandedSections.how && (
                    <div className="px-4 pb-4 space-y-3 border-t border-green-200 pt-4">
                      <div className="space-y-3">
                        {[
                          {
                            num: 1,
                            title: 'Set Up Campaign',
                            desc: 'Define your niche, target audience, and goals',
                          },
                          {
                            num: 2,
                            title: 'AI Generates Hook',
                            desc: 'Claude AI creates a viral hook formula for your niche',
                          },
                          {
                            num: 3,
                            title: 'Create 6-Slide Content',
                            desc: 'AI designs carousel slides: Hook → Problem → Discovery → Transformation → Result → CTA',
                          },
                          {
                            num: 4,
                            title: 'Caption & Call-to-Action',
                            desc: 'AI writes engaging captions optimized for each platform',
                          },
                          {
                            num: 5,
                            title: 'Auto-Post & Schedule',
                            desc: 'Posts go live across TikTok, Instagram, LinkedIn simultaneously',
                          },
                          {
                            num: 6,
                            title: 'Monitor & Report',
                            desc: 'Real-time analytics, engagement tracking, and performance insights',
                          },
                        ].map((item) => (
                          <div key={item.num} className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                              {item.num}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{item.title}</h4>
                              <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Setup Section */}
                <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="p-4 space-y-4">
                    <h2 className="text-2xl font-bold text-purple-900">Start Your Campaign</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Campaign Title
                        </label>
                        <Input
                          placeholder="e.g., 'AI Design Tips for Entrepreneurs'"
                          value={campaignTitle}
                          onChange={(e) => setCampaignTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Niche
                        </label>
                        <Input
                          placeholder="e.g., 'AI Tools', 'Freelancing', 'Crypto'"
                          value={niche}
                          onChange={(e) => setNiche(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Target Audience
                      </label>
                      <Textarea
                        placeholder="Describe your target audience (e.g., 'Young entrepreneurs aged 18-35 interested in AI and automation')"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleStartCampaign}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Play size={18} />
                      Start Campaign
                    </Button>
                  </div>
                </Card>

                {/* AI Advisor Sidebar */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2" />
                  <div className="md:col-span-1">
                    <LarrySkillChat context="Preparing to launch campaign" />
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Section */}
            {currentStep === 'workflow' && session && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">
                    Campaign: {session.title}
                  </h1>
                  <Button
                    onClick={() => setCurrentStep('intro')}
                    className="bg-slate-600"
                  >
                    Back
                  </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Workflow Progress */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="p-4">
                      <h2 className="text-xl font-bold mb-4">Campaign Execution</h2>

                      <div className="space-y-3">
                        {session.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200"
                          >
                            <div className="flex-shrink-0 mt-1">
                              {step.status === 'completed' && (
                                <CheckCircle className="text-green-600" size={24} />
                              )}
                              {step.status === 'in_progress' && (
                                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                              )}
                              {step.status === 'failed' && (
                                <AlertTriangle className="text-red-600" size={24} />
                              )}
                              {step.status === 'pending' && (
                                <Clock className="text-slate-400" size={24} />
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{step.name}</h3>
                              <p className="text-sm text-slate-600">{step.description}</p>
                              {step.result && (
                                <p className="text-xs text-green-700 mt-2 font-mono bg-green-50 p-2 rounded">
                                  {step.result.substring(0, 100)}...
                                </p>
                              )}
                              {step.error && (
                                <p className="text-xs text-red-700 mt-2">{step.error}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleRunWorkflow}
                        disabled={running}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      >
                        {running ? 'Running Campaign...' : 'Launch Campaign'}
                      </Button>
                    </Card>
                  </div>

                  {/* Chat Assistant */}
                  <div>
                    <LarrySkillChat context={`Campaign: ${session.title}, Niche: ${session.niche}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Report Section */}
            {currentStep === 'report' && session && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">Campaign Report</h1>
                  <div className="flex gap-2">
                    <Button onClick={downloadReport} className="bg-blue-600">
                      <Download size={18} />
                      Download
                    </Button>
                    <Button onClick={() => setCurrentStep('intro')} className="bg-slate-600">
                      New Campaign
                    </Button>
                  </div>
                </div>

                <Card className="p-6">
                  <pre className="bg-slate-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                    {reportText}
                  </pre>

                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(reportText)}
                      className="bg-slate-600"
                    >
                      <Copy size={18} />
                      Copy Report
                    </Button>
                  </div>
                </Card>

                {/* Report Breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  {session.reportData.hookFormula && (
                    <Card className="p-4">
                      <h3 className="font-bold mb-2">🎣 Hook Formula</h3>
                      <p className="text-sm text-slate-700">{session.reportData.hookFormula}</p>
                    </Card>
                  )}

                  {session.reportData.engagement && (
                    <Card className="p-4">
                      <h3 className="font-bold mb-2">📊 Engagement</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Views</p>
                          <p className="font-bold text-lg">
                            {session.reportData.engagement.views.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Likes</p>
                          <p className="font-bold text-lg">
                            {session.reportData.engagement.likes.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Shares</p>
                          <p className="font-bold text-lg">
                            {session.reportData.engagement.shares.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Comments</p>
                          <p className="font-bold text-lg">
                            {session.reportData.engagement.comments.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
