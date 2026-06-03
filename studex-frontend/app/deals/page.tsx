'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import type { Deal } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
  X,
} from 'lucide-react';

const statusColors: Record<string, { badge: string; icon: typeof Clock; text: string }> = {
  draft: { badge: 'warning', icon: Clock, text: 'Draft' },
  active: { badge: 'primary', icon: Clock, text: 'Active' },
  negotiation: { badge: 'warning', icon: AlertCircle, text: 'Negotiation' },
  closed: { badge: 'success', icon: CheckCircle, text: 'Closed' },
  cancelled: { badge: 'danger', icon: AlertCircle, text: 'Cancelled' },
};

const pipelineProgress: Record<string, number> = {
  initial: 10,
  review: 25,
  negotiation: 50,
  due_diligence: 70,
  closing: 90,
  completed: 100,
};

const pipelineLabels: Record<string, string> = {
  initial: 'Initial Discussions',
  review: 'Review',
  negotiation: 'Term Negotiation',
  due_diligence: 'Due Diligence',
  closing: 'Closing',
  completed: 'Completed',
};

export default function DealsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    value: '',
    currency: 'USD',
    status: 'draft' as Deal['status'],
    pipeline_stage: 'initial' as Deal['pipeline_stage'],
  });

  useEffect(() => {
    if (!user) return;

    async function fetchDeals() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.deals.getDeals();
        setDeals(data);
      } catch (err) {
        console.error('Failed to fetch deals:', err);
        setError('Failed to load deals. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [user]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title.trim()) return;

    try {
      setCreating(true);
      await api.deals.createDeal({
        title: newDeal.title,
        description: newDeal.description,
        value: parseFloat(newDeal.value) || 0,
        currency: newDeal.currency,
        status: newDeal.status,
        pipeline_stage: newDeal.pipeline_stage,
        participant_ids: [],
        collaborative_notes: '',
      });

      // Refresh deals list
      const data = await api.deals.getDeals();
      setDeals(data);

      // Reset form
      setNewDeal({
        title: '',
        description: '',
        value: '',
        currency: 'USD',
        status: 'draft',
        pipeline_stage: 'initial',
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create deal:', err);
      setError('Failed to create deal. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || deal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                  <Briefcase className="text-primary-500" />
                  Deal Pipeline
                </h1>
                <p className="text-gray-400">
                  {loading ? 'Loading deals...' : `${filteredDeals.length} deal${filteredDeals.length !== 1 ? 's' : ''} in pipeline`}
                </p>
              </div>

              <Button variant="primary" icon={<Plus size={20} />} onClick={() => setShowCreateForm(true)}>
                New Deal
              </Button>
            </div>

            {/* Create Deal Form */}
            {showCreateForm && (
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Create New Deal</h2>
                  <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateDeal} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Deal Title"
                      placeholder="e.g. Series A Funding Round"
                      value={newDeal.title}
                      onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                      required
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          label="Value"
                          type="number"
                          placeholder="0"
                          value={newDeal.value}
                          onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                        <select
                          value={newDeal.currency}
                          onChange={(e) => setNewDeal({ ...newDeal, currency: e.target.value })}
                          className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-3 py-2.5 text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="ZAR">ZAR</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      placeholder="Describe the deal..."
                      value={newDeal.description}
                      onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        value={newDeal.status}
                        onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value as Deal['status'] })}
                        className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="negotiation">Negotiation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Pipeline Stage</label>
                      <select
                        value={newDeal.pipeline_stage}
                        onChange={(e) => setNewDeal({ ...newDeal, pipeline_stage: e.target.value as Deal['pipeline_stage'] })}
                        className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="initial">Initial Discussions</option>
                        <option value="review">Review</option>
                        <option value="negotiation">Term Negotiation</option>
                        <option value="due_diligence">Due Diligence</option>
                        <option value="closing">Closing</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setShowCreateForm(false)} type="button">
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={creating || !newDeal.title.trim()}>
                      {creating ? 'Creating...' : 'Create Deal'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Error Banner */}
            {error && (
              <Card className="mb-6 border-red-500/30">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={18} />
                  <p>{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              </Card>
            )}

            {/* Search & Filter */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={18} />}
                    containerClassName="mb-0"
                  />
                </div>

                <div className="sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 mt-4">Loading deals...</p>
              </div>
            )}

            {/* Deals Grid */}
            {!loading && (
              <div className="grid gap-6">
                {filteredDeals.map((deal) => {
                  const statusConfig = statusColors[deal.status] || statusColors.draft;
                  const StatusIcon = statusConfig.icon;
                  const progress = pipelineProgress[deal.pipeline_stage] || 0;
                  const stageLabel = pipelineLabels[deal.pipeline_stage] || deal.pipeline_stage;

                  return (
                    <Card key={deal.id} clickable className="hover:shadow-glow-primary">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        {/* Deal Info */}
                        <div>
                          <h3 className="text-lg font-bold mb-1">{deal.title}</h3>
                          <p className="text-gray-400 text-sm mb-2 line-clamp-1">{deal.description || 'No description'}</p>
                          <Badge variant="primary" size="sm">
                            {formatCurrency(deal.value, deal.currency)}
                          </Badge>
                        </div>

                        {/* Stage & Status */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon size={18} />
                            <Badge variant={statusConfig.badge as any} size="sm">
                              {statusConfig.text}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{stageLabel}</p>
                          <p className="text-xs text-gray-500">
                            {deal.updated_at ? `Updated ${formatTimeAgo(deal.updated_at)}` : ''}
                          </p>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Progress</p>
                            <span className="text-sm font-bold text-primary-400">{progress}%</span>
                          </div>
                          <div className="bg-dark-800 rounded-full h-2">
                            <div
                              className="bg-gradient-accent h-full rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" icon={<FileText size={16} />}>
                            Documents
                          </Button>
                          <Button variant="secondary" size="sm" icon={<MessageSquare size={16} />}>
                            Chat
                          </Button>
                        </div>
                      </div>

                      {/* Participants */}
                      {deal.participant_ids && deal.participant_ids.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-primary-700/20">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-400">Team:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {deal.participant_ids.map((participantId, idx) => (
                                <span key={idx} className="text-xs bg-primary-900/30 px-2 py-1 rounded-full">
                                  {participantId === user?.uid ? 'You' : participantId.slice(0, 8)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredDeals.length === 0 && (
              <Card className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">
                  {deals.length === 0 ? 'No deals yet' : 'No deals match your search'}
                </p>
                <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                  Create First Deal
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
