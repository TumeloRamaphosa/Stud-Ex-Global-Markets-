'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Type,
  Bot,
  Trash2,
  Eye,
  Calendar,
} from 'lucide-react';
import {
  PLATFORM_CONFIG,
  HOOK_FORMULAS,
  type BlotaPlatform,
  type HookCategory,
  type ContentPost,
} from '@/lib/types';

const NAV_LINKS = [
  { href: '/content-hub', label: 'Content Hub' },
  { href: '/scheduler', label: 'Scheduler' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/automations', label: 'Automations' },
];

type View = 'list' | 'create';
type CreateStep = 'hook' | 'media' | 'caption' | 'platforms' | 'preview';

const STEPS: { id: CreateStep; label: string; icon: React.ReactNode }[] = [
  { id: 'hook', label: 'Hook', icon: <Sparkles size={16} /> },
  { id: 'media', label: 'Media', icon: <ImageIcon size={16} /> },
  { id: 'caption', label: 'Caption', icon: <Type size={16} /> },
  { id: 'platforms', label: 'Platforms', icon: <Send size={16} /> },
  { id: 'preview', label: 'Preview', icon: <Eye size={16} /> },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: 'bg-dark-700/50', text: 'text-dark-300', dot: 'bg-dark-400' },
  scheduled: { bg: 'bg-brand-900/20', text: 'text-brand-400', dot: 'bg-brand-400' },
  posting: { bg: 'bg-amber-900/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  posted: { bg: 'bg-emerald-900/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  failed: { bg: 'bg-rose-900/20', text: 'text-rose-400', dot: 'bg-rose-400' },
};

export default function ContentHubPage() {
  const [view, setView] = useState<View>('list');
  const [step, setStep] = useState<CreateStep>('hook');
  const [posts, setPosts] = useState<ContentPost[]>([]);

  // Create form state
  const [hookCategory, setHookCategory] = useState<HookCategory>('person-conflict');
  const [hookText, setHookText] = useState('');
  const [slideTexts, setSlideTexts] = useState<string[]>(['', '', '', '', '', '']);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [cta, setCta] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<BlotaPlatform[]>(['tiktok', 'instagram']);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [posting, setPosting] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handlePost = async (mode: 'now' | 'schedule' | 'draft') => {
    setPosting(true);
    try {
      // Save to Airtable first
      const airtableRes = await fetch('/api/airtable/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Title: hookText.slice(0, 50),
          'Hook Text': hookText,
          'Hook Category': hookCategory,
          Caption: caption,
          CTA: cta,
          'Slide Texts': JSON.stringify(slideTexts.filter(Boolean)),
          'Media URLs': JSON.stringify(mediaUrls),
          Platforms: selectedPlatforms.join(', '),
          Status: mode === 'draft' ? 'Draft' : mode === 'schedule' ? 'Scheduled' : 'Posted',
          'Scheduled Date': scheduledDate || new Date().toISOString().split('T')[0],
          'Scheduled Time': scheduledTime || '',
        }),
      });

      const airtableData = await airtableRes.json();

      if (mode === 'now') {
        // Post via Blotato immediately
        const postRes = await fetch('/api/blotato/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: caption,
            mediaUrls,
            platforms: selectedPlatforms,
            airtableRecordId: airtableData.id,
          }),
        });

        const postData = await postRes.json();

        if (postData.results) {
          const successCount = postData.results.filter((r: any) => !r.error).length;
          toast.success(`Posted to ${successCount}/${selectedPlatforms.length} platforms!`);
        }
      } else if (mode === 'schedule') {
        toast.success('Content scheduled! n8n will post it at the scheduled time.');
      } else {
        toast.success('Draft saved to Airtable!');
      }

      // Reset and go back to list
      resetForm();
      setView('list');
    } catch (err) {
      toast.error('Failed to save content');
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    setHookCategory('person-conflict');
    setHookText('');
    setSlideTexts(['', '', '', '', '', '']);
    setMediaUrls([]);
    setCaption('');
    setCta('');
    setSelectedPlatforms(['tiktok', 'instagram']);
    setScheduledDate('');
    setScheduledTime('');
    setStep('hook');
  };

  const slideLabels = ['Hook', 'Problem', 'Discovery', 'Transform 1', 'Transform 2', 'CTA'];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-brand-700/20 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <Bot size={20} className="text-dark-900" />
                </div>
                <span className="text-xl font-bold">Go<span className="text-brand-400">Bot</span></span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    link.href === '/content-hub' ? 'text-brand-400 font-medium' : 'text-dark-400 hover:text-brand-400'
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
        {view === 'list' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Megaphone size={28} className="text-brand-400" />
                  Content Hub
                </h1>
                <p className="text-dark-400 mt-1">Create and manage multi-platform content</p>
              </div>
              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-gold text-dark-900 font-bold hover:shadow-glow-gold transition-all"
              >
                <Plus size={18} />
                New Post
              </button>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="card-glass rounded-xl p-16 text-center">
                <Megaphone size={48} className="mx-auto text-dark-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">No content yet</h2>
                <p className="text-dark-400 mb-6">Create your first post to get started with multi-platform marketing.</p>
                <button
                  onClick={() => setView('create')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-gold text-dark-900 font-bold"
                >
                  <Plus size={18} /> Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const style = STATUS_STYLES[post.status] || STATUS_STYLES.draft;
                  return (
                    <div key={post.id} className="card-glass rounded-xl p-5 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{post.hookText || 'Untitled'}</h3>
                        <p className="text-sm text-dark-400 mt-1">
                          {post.platforms.map((p) => PLATFORM_CONFIG[p].label).join(', ')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {post.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Create View */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => { setView('list'); resetForm(); }} className="text-dark-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Create Post</h1>
                <p className="text-dark-400 text-sm">Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}</p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    step === s.id
                      ? 'bg-brand-900/30 text-brand-400 border border-brand-700/50'
                      : i < stepIndex
                      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/30'
                      : 'text-dark-400 bg-dark-800/50 border border-dark-700/30'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="card-glass rounded-xl p-6 mb-6">
              {step === 'hook' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Hook & Strategy</h2>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Hook Category</label>
                    <select
                      value={hookCategory}
                      onChange={(e) => setHookCategory(e.target.value as HookCategory)}
                      className="w-full rounded-lg border border-brand-700/30 bg-dark-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                    >
                      <option value="person-conflict">Person Conflict (Highest Performing)</option>
                      <option value="budget">Budget Transformation</option>
                      <option value="self-discovery">Self Discovery</option>
                      <option value="before-after">Before / After</option>
                      <option value="pov">POV Format</option>
                      <option value="listicle">Listicle</option>
                      <option value="tutorial">Tutorial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Templates</label>
                    <div className="space-y-2">
                      {HOOK_FORMULAS[hookCategory].map((t, i) => (
                        <button
                          key={i}
                          onClick={() => setHookText(t)}
                          className="block w-full text-left p-3 rounded-lg bg-dark-800/50 border border-dark-700/30 hover:border-brand-700/50 transition-all text-sm"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Your Hook Text</label>
                    <textarea
                      value={hookText}
                      onChange={(e) => setHookText(e.target.value)}
                      placeholder="Write your hook..."
                      rows={3}
                      className="w-full rounded-lg border border-brand-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 'media' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Slide Text & Media</h2>
                  <p className="text-dark-400 text-sm">6-slide format: Hook → Problem → Discovery → Transform → Transform → CTA</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {slideLabels.map((label, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Slide {i + 1}: {label}</label>
                        <textarea
                          value={slideTexts[i]}
                          onChange={(e) => {
                            const updated = [...slideTexts];
                            updated[i] = e.target.value;
                            setSlideTexts(updated);
                          }}
                          placeholder={i === 0 ? hookText || 'Hook text...' : `${label} text...`}
                          rows={3}
                          className="w-full rounded-lg border border-dark-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none resize-none text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Media URLs (publicly accessible)</label>
                    <textarea
                      value={mediaUrls.join('\n')}
                      onChange={(e) => setMediaUrls(e.target.value.split('\n').filter(Boolean))}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      rows={4}
                      className="w-full rounded-lg border border-dark-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none resize-none text-sm font-mono"
                    />
                    <p className="text-dark-500 text-xs mt-1">One URL per line. Blotato handles media transfer automatically. Instagram creates carousels from multiple images.</p>
                  </div>
                </div>
              )}

              {step === 'caption' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Caption & CTA</h2>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder={`${hookText}\n\n[Problem]\n\n[Discovery]\n\n[Result]\n\n#hashtag1 #hashtag2 #hashtag3`}
                      rows={8}
                      className="w-full rounded-lg border border-brand-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none resize-none"
                    />
                    <p className="text-dark-500 text-xs mt-1">Storytelling captions get 3x more views. Hook → Problem → Discovery → Result → max 5 hashtags.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">CTA (Call to Action)</label>
                    <input
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      placeholder="Download [App] — link in bio"
                      className="w-full rounded-lg border border-brand-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {step === 'platforms' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Target Platforms & Schedule</h2>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">Platforms (via Blotato)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.entries(PLATFORM_CONFIG) as [BlotaPlatform, typeof PLATFORM_CONFIG[BlotaPlatform]][]).map(
                        ([key, config]) => (
                          <button
                            key={key}
                            onClick={() =>
                              setSelectedPlatforms((prev) =>
                                prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
                              )
                            }
                            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                              selectedPlatforms.includes(key)
                                ? 'bg-brand-900/30 text-brand-300 border border-brand-700/50'
                                : 'bg-dark-800/50 text-dark-400 border border-dark-700/30 hover:border-dark-600'
                            }`}
                          >
                            {selectedPlatforms.includes(key) ? (
                              <CheckCircle size={16} className="text-brand-400" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-dark-500" />
                            )}
                            {config.label}
                            {config.requiresPageId && (
                              <span className="text-xs text-dark-500">(needs pageId)</span>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Schedule Date (optional)</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full rounded-lg border border-dark-700/30 bg-dark-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Schedule Time (optional)</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full rounded-lg border border-dark-700/30 bg-dark-800/50 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-dark-500 text-xs">Leave empty to post immediately, or set a date/time for n8n to handle scheduling via Airtable.</p>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Preview & Publish</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Hook</span>
                        <p className="font-bold mt-1">{hookText || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Category</span>
                        <p className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-brand-900/30 text-brand-400 text-sm">{hookCategory}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Caption</span>
                        <p className="text-sm text-dark-300 mt-1 whitespace-pre-line">{caption || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">CTA</span>
                        <p className="text-brand-400 font-medium mt-1">{cta || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Platforms</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPlatforms.map((p) => (
                            <span key={p} className="px-2 py-1 rounded-full bg-emerald-900/20 text-emerald-400 text-xs font-semibold">
                              {PLATFORM_CONFIG[p].label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Slides</span>
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                          {slideTexts.filter(Boolean).map((text, i) => (
                            <div key={i} className="flex-shrink-0 w-24 h-36 rounded-lg bg-dark-800/50 border border-dark-700/30 flex items-center justify-center p-2">
                              <p className="text-[10px] text-center text-dark-300 leading-tight">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {scheduledDate && (
                        <div>
                          <span className="text-xs font-medium text-dark-500 uppercase">Scheduled</span>
                          <p className="text-sm mt-1">{scheduledDate} {scheduledTime}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-dark-500 uppercase">Media</span>
                        <p className="text-sm text-dark-400 mt-1">{mediaUrls.length} file(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-700/30">
                    <button
                      onClick={() => handlePost('draft')}
                      disabled={posting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dark-700/30 text-dark-300 font-medium hover:bg-dark-800/50 transition-all disabled:opacity-50"
                    >
                      <Clock size={18} /> Save Draft
                    </button>
                    {scheduledDate ? (
                      <button
                        onClick={() => handlePost('schedule')}
                        disabled={posting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-900/30 border border-brand-700/50 text-brand-400 font-bold hover:bg-brand-900/50 transition-all disabled:opacity-50"
                      >
                        <Calendar size={18} /> Schedule
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePost('now')}
                        disabled={posting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-gold text-dark-900 font-bold hover:shadow-glow-gold transition-all disabled:opacity-50"
                      >
                        <Send size={18} /> Post to {selectedPlatforms.length} Platforms
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)].id)}
                disabled={stepIndex === 0}
                className="px-4 py-2 rounded-lg border border-dark-700/30 text-dark-400 font-medium hover:bg-dark-800/50 transition-all disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].id)}
                disabled={stepIndex === STEPS.length - 1}
                className="px-4 py-2 rounded-lg bg-brand-900/30 border border-brand-700/50 text-brand-400 font-medium hover:bg-brand-900/50 transition-all disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
