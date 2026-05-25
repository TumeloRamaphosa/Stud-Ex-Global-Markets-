'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  CheckCircle, XCircle, Clock, Send, Sparkles, Calendar, Plus,
  Loader2, Instagram, Facebook, Image as ImageIcon, Video, Edit3,
  Trash2, ChevronLeft, ChevronRight, BarChart3, Zap, Brain,
  ArrowLeft, Filter, Eye,
} from 'lucide-react';

interface Draft {
  id: string;
  status: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  platforms: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  generatedBy: string;
  abVariant: string | null;
  abGroupId: string | null;
  rejectedReason: string | null;
  createdAt: string;
}

function timeStr(ts: string) {
  return new Date(ts).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode; variant: 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
  pending: { color: 'text-amber-400', icon: <Clock size={14} />, variant: 'warning' },
  approved: { color: 'text-green-400', icon: <CheckCircle size={14} />, variant: 'success' },
  scheduled: { color: 'text-blue-400', icon: <Calendar size={14} />, variant: 'info' },
  published: { color: 'text-emerald-400', icon: <Send size={14} />, variant: 'success' },
  rejected: { color: 'text-red-400', icon: <XCircle size={14} />, variant: 'error' },
  draft: { color: 'text-gray-400', icon: <Edit3 size={14} />, variant: 'primary' },
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'queue' | 'calendar'>('queue');
  const [showCreate, setShowCreate] = useState(false);
  const [showAB, setShowAB] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newPlatforms, setNewPlatforms] = useState(['instagram']);
  const [newSchedule, setNewSchedule] = useState('');
  const [abTopic, setAbTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [calendarWeek, setCalendarWeek] = useState(0);

  async function loadDrafts() {
    setLoading(true);
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { loadDrafts(); }, []);

  async function apiAction(action: string, body: any = {}) {
    const res = await fetch('/api/drafts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await res.json();
    await loadDrafts();
    return data;
  }

  async function createDraft() {
    if (!newCaption.trim()) return;
    await apiAction('create', { caption: newCaption, mediaUrl: newMediaUrl, platforms: newPlatforms, scheduledAt: newSchedule || null, generatedBy: 'manual' });
    setNewCaption(''); setNewMediaUrl(''); setNewSchedule(''); setShowCreate(false);
  }

  async function generateABVariants() {
    if (!abTopic.trim()) return;
    setGenerating(true);
    await apiAction('generate_variants', { topic: abTopic, platforms: ['instagram'] });
    setAbTopic(''); setShowAB(false); setGenerating(false);
  }

  async function publishDraft(id: string) {
    setPublishing(id);
    try {
      const draft = drafts.find(d => d.id === id);
      if (!draft) return;
      if (draft.mediaUrl) {
        await fetch('/api/composio/post', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'post_instagram_image', platform: 'instagram', caption: draft.caption, imageUrl: draft.mediaUrl }),
        });
      }
      await apiAction('publish', { id });
    } finally { setPublishing(null); }
  }

  const filtered = filter === 'all' ? drafts : drafts.filter(d => d.status === filter);
  const counts = { all: drafts.length, pending: drafts.filter(d => d.status === 'pending').length, approved: drafts.filter(d => d.status === 'approved').length, scheduled: drafts.filter(d => d.status === 'scheduled').length, published: drafts.filter(d => d.status === 'published').length, rejected: drafts.filter(d => d.status === 'rejected').length };

  // Calendar logic
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + calendarWeek * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  function getDraftsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return drafts.filter(d => {
      const ts = d.scheduledAt || d.createdAt;
      return ts?.startsWith(dateStr);
    });
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-gray-900">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/os')} className="text-gray-500 hover:text-gray-900"><ArrowLeft size={18} /></button>
          <Zap size={18} className="text-[#D4A017]" />
          <span className="font-bold text-sm">Approval Pipeline</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Sparkles size={14} />} onClick={() => setShowAB(true)}>A/B Test</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-[#D4A017] to-amber-600 text-black border-0">New Draft</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* View Toggle + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-1 bg-white rounded-xl p-1">
            <button onClick={() => setView('queue')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'queue' ? 'bg-gray-50 text-gray-900' : 'text-gray-500'}`}>
              <Filter size={14} className="inline mr-1" /> Queue
            </button>
            <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-gray-50 text-gray-900' : 'text-gray-500'}`}>
              <Calendar size={14} className="inline mr-1" /> Calendar
            </button>
          </div>
          {view === 'queue' && (
            <div className="flex gap-1 flex-wrap">
              {(['all', 'pending', 'approved', 'scheduled', 'published', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:text-gray-400'}`}>
                  {f} ({counts[f]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === QUEUE VIEW === */}
        {view === 'queue' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16"><Loader2 size={32} className="animate-spin text-[#D4A017] mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Edit3 size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500">No drafts yet. Create one or generate A/B test variants.</p>
              </div>
            ) : (
              filtered.map(draft => {
                const st = STATUS_STYLES[draft.status] || STATUS_STYLES.draft;
                return (
                  <div key={draft.id} className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status + Meta */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={st.variant} size="sm">{st.icon} {draft.status}</Badge>
                          {draft.abVariant && <Badge variant="primary" size="sm">A/B {draft.abVariant}</Badge>}
                          {draft.platforms.map(p => (
                            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white text-gray-500">
                              {p === 'instagram' ? '📸 IG' : '📘 FB'}
                            </span>
                          ))}
                          <span className="text-[10px] text-gray-600">{timeStr(draft.createdAt)}</span>
                          {draft.generatedBy !== 'manual' && <span className="text-[10px] text-purple-400">AI Generated</span>}
                        </div>
                        {/* Caption Preview */}
                        <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{draft.caption}</p>
                        {draft.scheduledAt && <p className="text-xs text-blue-400 mt-2">Scheduled: {timeStr(draft.scheduledAt)}</p>}
                        {draft.rejectedReason && <p className="text-xs text-red-400 mt-2">Reason: {draft.rejectedReason}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {draft.status === 'pending' && (
                          <>
                            <button onClick={() => apiAction('approve', { id: draft.id })}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => { const r = prompt('Rejection reason?'); if (r !== null) apiAction('reject', { id: draft.id, reason: r }); }}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {(draft.status === 'approved' || draft.status === 'scheduled') && (
                          <button onClick={() => publishDraft(draft.id)} disabled={publishing === draft.id}
                            className="p-2 rounded-lg bg-purple-500/10 text-gold-400 hover:bg-purple-500/20 transition-colors" title="Publish Now">
                            {publishing === draft.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        )}
                        <button onClick={() => apiAction('delete', { id: draft.id })}
                          className="p-2 rounded-lg bg-white text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* === CALENDAR VIEW === */}
        {view === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalendarWeek(w => w - 1)} className="p-2 rounded-lg bg-white hover:bg-gray-50"><ChevronLeft size={18} /></button>
              <h2 className="font-bold">
                {weekDays[0].toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <button onClick={() => setCalendarWeek(w => w + 1)} className="p-2 rounded-lg bg-white hover:bg-gray-50"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-xs text-gray-600 pb-2">{d}</div>
              ))}
              {weekDays.map(day => {
                const dayDrafts = getDraftsForDate(day);
                const isToday = day.toDateString() === today.toDateString();
                const isEmpty = dayDrafts.length === 0;
                return (
                  <div key={day.toISOString()} className={`min-h-[120px] p-2 rounded-xl border transition-colors ${
                    isToday ? 'border-[#D4A017]/30 bg-purple-500/5' : isEmpty ? 'border-amber-500/10 bg-amber-500/5' : 'border-gray-200 bg-white'
                  }`}>
                    <p className={`text-xs font-bold mb-2 ${isToday ? 'text-gold-400' : 'text-gray-500'}`}>
                      {day.getDate()}
                    </p>
                    {dayDrafts.map(d => {
                      const st = STATUS_STYLES[d.status] || STATUS_STYLES.draft;
                      return (
                        <div key={d.id} className={`text-[10px] p-1.5 rounded-lg mb-1 border ${
                          d.platforms.includes('instagram') ? 'bg-pink-500/10 border-pink-500/20' : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex items-center gap-1">
                            <span className={st.color}>{st.icon}</span>
                            <span className="truncate">{d.caption.slice(0, 30)}...</span>
                          </div>
                        </div>
                      );
                    })}
                    {isEmpty && <p className="text-[10px] text-amber-500/40 text-center mt-4">No content</p>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">Amber days = no content scheduled. Click "New Draft" to fill gaps.</p>
          </div>
        )}
      </main>

      {/* === CREATE DRAFT MODAL === */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-md" onClick={() => setShowCreate(false)}>
          <div className="bg-[#111118] border border-gray-200 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20} className="text-[#D4A017]" /> New Content Draft</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Platform</label>
                <div className="flex gap-2">
                  {['instagram', 'facebook'].map(p => (
                    <button key={p} onClick={() => setNewPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      className={`px-3 py-2 rounded-lg border text-sm ${newPlatforms.includes(p) ? (p === 'instagram' ? 'border-pink-500 bg-pink-500/10 text-pink-300' : 'border-blue-500 bg-blue-500/10 text-blue-300') : 'border-gray-200 text-gray-500'}`}>
                      {p === 'instagram' ? '📸 Instagram' : '📘 Facebook'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Media URL</label>
                <input type="url" value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-600 focus:border-[#D4A017]/40 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Caption</label>
                <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)}
                  placeholder="Write your caption..." rows={5}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-600 focus:border-[#D4A017]/40 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Schedule (optional)</label>
                <input type="datetime-local" value={newSchedule} onChange={e => setNewSchedule(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#D4A017]/40 focus:outline-none" />
              </div>

              <Button fullWidth onClick={createDraft} disabled={!newCaption.trim()}
                icon={<Send size={16} />} className="bg-gradient-to-r from-[#D4A017] to-amber-600 text-black border-0 font-bold">
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === A/B TEST MODAL === */}
      {showAB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-md" onClick={() => setShowAB(false)}>
          <div className="bg-[#111118] border border-gray-200 rounded-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Brain size={20} className="text-purple-400" /> Create A/B Test</h2>
            <p className="text-sm text-gray-400 mb-4">AI will generate 3 caption variants with different hooks. You approve the best one.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Topic / Theme</label>
                <input type="text" value={abTopic} onChange={e => setAbTopic(e.target.value)}
                  placeholder="e.g., New Wagyu product launch, crypto market update..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-600 focus:border-[#D4A017]/40 focus:outline-none" />
              </div>

              <Button fullWidth onClick={generateABVariants} disabled={!abTopic.trim() || generating}
                icon={generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 font-bold">
                {generating ? 'Generating 3 Variants...' : 'Generate A/B Variants'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
