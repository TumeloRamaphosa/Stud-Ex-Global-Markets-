'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Brain, Search, RefreshCw, Loader2, Plus, ArrowLeft, Zap, Eye,
  Instagram, Mail, MessageCircle, FileText, Globe, Sparkles, Database,
  X, ExternalLink, Heart,
} from 'lucide-react';

interface BrainNode {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  score?: number;
  likes?: number;
  comments?: number;
  permalink?: string;
  createdAt: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

function seededPosition(id: string, axis: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash + axis * 17) + id.charCodeAt(i); hash |= 0; }
  return ((hash % 1000) / 1000) * 20 - 10;
}

const TYPE_COLORS: Record<string, string> = {
  instagram_post: '#ec4899',
  email: '#ef4444',
  discord: '#6366f1',
  note: '#22c55e',
  idea: '#f59e0b',
  memory: '#8b5cf6',
  default: '#64748b',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  instagram_post: <Instagram size={12} />,
  email: <Mail size={12} />,
  discord: <MessageCircle size={12} />,
  note: <FileText size={12} />,
  idea: <Sparkles size={12} />,
  memory: <Brain size={12} />,
};

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  gmail: 'Gmail',
  discord: 'Discord',
  obsidian: 'Obsidian',
  manual: 'Manual',
};

export default function BrainPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [nodes, setNodes] = useState<BrainNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedNode, setSelectedNode] = useState<BrainNode | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [absorbing, setAbsorbing] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const mouseRef = useRef({ down: false, lastX: 0, lastY: 0 });

  async function loadBrain() {
    setLoading(true);
    try {
      const [statsRes, searchRes] = await Promise.all([
        fetch('/api/brain?action=stats'),
        fetch('/api/brain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'search', query: 'business content social media marketing', limit: 50 }) }),
      ]);
      const statsData = await statsRes.json();
      const searchData = await searchRes.json();
      setStats(statsData.stats);

      const brainNodes: BrainNode[] = (searchData.results || []).map((r: any) => ({
        ...r,
        x: seededPosition(r.id, 1),
        y: seededPosition(r.id, 2),
        z: seededPosition(r.id, 3),
        vx: 0, vy: 0, vz: 0,
      }));
      setNodes(brainNodes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function searchBrain() {
    if (!searchQuery.trim()) { loadBrain(); return; }
    setSearching(true);
    try {
      const res = await fetch('/api/brain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'search', query: searchQuery, limit: 30 }) });
      const data = await res.json();
      setNodes((data.results || []).map((r: any) => ({
        ...r,
        x: seededPosition(r.id, 1),
        y: seededPosition(r.id, 2),
        z: seededPosition(r.id, 3),
        vx: 0, vy: 0, vz: 0,
      })));
    } catch {} finally { setSearching(false); }
  }

  async function absorbInstagram() {
    setAbsorbing(true);
    try {
      await fetch('/api/brain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'absorb_instagram' }) });
      await loadBrain();
    } catch {} finally { setAbsorbing(false); }
  }

  async function addNote() {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    await fetch('/api/brain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'absorb', content: `${noteTitle}: ${noteContent}`, type: 'note', source: 'manual', title: noteTitle }) });
    setNoteTitle(''); setNoteContent(''); setAddingNote(false);
    await loadBrain();
  }

  useEffect(() => { loadBrain(); }, []);

  // Canvas 3D rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    }
    resize();
    window.addEventListener('resize', resize);

    function project(x: number, y: number, z: number) {
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      let nx = x * cosY - z * sinY;
      let nz = x * sinY + z * cosY;
      let ny = y * cosX - nz * sinX;
      nz = y * sinX + nz * cosX;
      const perspective = 30 / (30 + nz * zoom);
      return {
        sx: (canvas!.width / 2) + nx * perspective * 40 * zoom,
        sy: (canvas!.height / 2) + ny * perspective * 40 * zoom,
        scale: perspective,
        z: nz,
      };
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const projected = nodes.map(n => ({ ...n, ...project(n.x, n.y, n.z) }));
      projected.sort((a, b) => a.z - b.z);

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j];
          if (a.type === b.type || a.source === b.source) {
            const dist = Math.sqrt((a.sx - b.sx) ** 2 + (a.sy - b.sy) ** 2);
            if (dist < 200) {
              ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 200)})`;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      for (const n of projected) {
        const color = TYPE_COLORS[n.type] || TYPE_COLORS.default;
        const size = Math.max(4, (n.score || 0.5) * 16 * n.scale);

        // Glow
        const gradient = ctx.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, size * 3);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size * 3, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(n.sx, n.sy, size, 0, Math.PI * 2); ctx.fill();

        // Label
        if (n.scale > 0.5) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, n.scale)})`;
          ctx.font = `${Math.max(10, 14 * n.scale)}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(n.title?.slice(0, 25) || '', n.sx, n.sy + size + 14 * n.scale);
        }
      }

      // Slowly rotate
      setRotation(prev => ({ x: prev.x, y: prev.y + 0.001 }));
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [nodes, rotation, zoom]);

  // Mouse interaction
  function handleMouseDown(e: React.MouseEvent) { mouseRef.current = { down: true, lastX: e.clientX, lastY: e.clientY }; }
  function handleMouseUp() { mouseRef.current.down = false; }
  function handleMouseMove(e: React.MouseEvent) {
    if (!mouseRef.current.down) return;
    const dx = e.clientX - mouseRef.current.lastX;
    const dy = e.clientY - mouseRef.current.lastY;
    setRotation(prev => ({ x: prev.x + dy * 0.005, y: prev.y + dx * 0.005 }));
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
  }
  function handleWheel(e: React.WheelEvent) { setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001))); }

  function handleCanvasClick(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * 2;
    const my = (e.clientY - rect.top) * 2;

    for (const n of nodes) {
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      let nx = n.x * cosY - n.z * sinY;
      let nz = n.x * sinY + n.z * cosY;
      let ny = n.y * cosX - nz * sinX;
      nz = n.y * sinX + nz * cosX;
      const perspective = 30 / (30 + nz * zoom);
      const sx = (canvasRef.current.width / 2) + nx * perspective * 40 * zoom;
      const sy = (canvasRef.current.height / 2) + ny * perspective * 40 * zoom;
      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
      if (dist < 20) { setSelectedNode(n); return; }
    }
    setSelectedNode(null);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/os')} className="text-gray-500 hover:text-white"><ArrowLeft size={18} /></button>
          <Brain size={18} className="text-purple-400" />
          <span className="font-bold text-sm">Second Brain</span>
          {stats && <span className="text-xs text-gray-600">{stats.totalRecordCount || 0} memories</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={absorbing ? <Loader2 size={14} className="animate-spin" /> : <Instagram size={14} />}
            onClick={absorbInstagram} disabled={absorbing}>
            {absorbing ? 'Absorbing...' : 'Absorb IG'}
          </Button>
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddingNote(true)}>Add Note</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 3D Canvas */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-400">Loading Second Brain...</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Brain size={64} className="mx-auto text-gray-700 mb-4" />
                <h2 className="text-xl font-bold mb-2">Your Brain is Empty</h2>
                <p className="text-gray-500 mb-6">Start absorbing data to build your knowledge graph. Click "Absorb IG" to pull your Instagram posts into the brain.</p>
                <Button icon={<Instagram size={16} />} onClick={absorbInstagram} disabled={absorbing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                  {absorbing ? 'Absorbing...' : 'Absorb Instagram Data'}
                </Button>
              </div>
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp} onWheel={handleWheel} onClick={handleCanvasClick} />
          )}

          {/* Search overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchBrain()}
                  placeholder="Search your brain..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none" />
              </div>
              <button onClick={searchBrain} disabled={searching}
                className="px-3 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm">
                {searching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2">
            {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-400">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          {/* Node count */}
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-gray-500">
            {nodes.length} nodes • Drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* Selected Node Panel */}
        {selectedNode && (
          <div className="w-80 border-l border-white/5 bg-[#0c0c14] p-4 overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="primary" size="sm">
                {TYPE_ICONS[selectedNode.type] || <Globe size={12} />}
                {selectedNode.type?.replace('_', ' ')}
              </Badge>
              <button onClick={() => setSelectedNode(null)} className="text-gray-600 hover:text-white"><X size={16} /></button>
            </div>
            <h3 className="font-bold mb-2">{selectedNode.title}</h3>
            <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap">{selectedNode.content}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Source</span>
                <span className="text-gray-300">{SOURCE_LABELS[selectedNode.source] || selectedNode.source}</span>
              </div>
              {selectedNode.score && (
                <div className="flex justify-between text-gray-500">
                  <span>Relevance</span>
                  <span className="text-purple-400">{(selectedNode.score * 100).toFixed(0)}%</span>
                </div>
              )}
              {selectedNode.likes !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Engagement</span>
                  <span className="text-pink-400"><Heart size={10} className="inline" /> {selectedNode.likes} / <MessageCircle size={10} className="inline" /> {selectedNode.comments}</span>
                </div>
              )}
              {selectedNode.permalink && (
                <a href={selectedNode.permalink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-400 hover:underline mt-2">
                  View original <ExternalLink size={10} />
                </a>
              )}
              <p className="text-gray-600 pt-2">{new Date(selectedNode.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {addingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setAddingNote(false)}>
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Brain size={20} className="text-purple-400" /> Add to Brain</h2>
            <div className="space-y-3">
              <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                placeholder="Title" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none" />
              <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                placeholder="What do you want to remember?" rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none" />
              <Button fullWidth onClick={addNote} icon={<Plus size={16} />}
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 font-bold">
                Add to Brain
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
