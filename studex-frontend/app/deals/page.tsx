'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
} from 'lucide-react';

const deals = [
  {
    id: 1,
    title: 'Series A Funding Round',
    company: 'TechStartup Inc',
    amount: '$2.5M',
    status: 'in-progress',
    stage: 'Due Diligence',
    participants: ['Alice J.', 'Bob S.', '+2'],
    lastUpdate: '2 hours ago',
    progress: 60,
  },
  {
    id: 2,
    title: 'Strategic Partnership',
    company: 'Global Partners LLC',
    amount: '$500K',
    status: 'negotiation',
    stage: 'Term Negotiation',
    participants: ['Carol D.', 'Dave W.'],
    lastUpdate: '5 hours ago',
    progress: 40,
  },
  {
    id: 3,
    title: 'Acquisition Interest',
    company: 'Innovation Corp',
    amount: '$1.8M',
    status: 'pending',
    stage: 'Initial Discussions',
    participants: ['Eve M.'],
    lastUpdate: '1 day ago',
    progress: 20,
  },
  {
    id: 4,
    title: 'Joint Venture',
    company: 'Future Ventures',
    amount: '$3.2M',
    status: 'closed',
    stage: 'Completed',
    participants: ['Frank L.', 'Grace H.', 'Henry I.'],
    lastUpdate: '3 days ago',
    progress: 100,
  },
];

const statusColors = {
  'in-progress': { badge: 'primary', icon: Clock, text: 'In Progress' },
  negotiation: { badge: 'warning', icon: AlertCircle, text: 'Negotiation' },
  pending: { badge: 'warning', icon: Clock, text: 'Pending' },
  closed: { badge: 'success', icon: CheckCircle, text: 'Closed' },
};

export default function DealsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || deal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                <p className="text-gray-400">{filteredDeals.length} deals in progress</p>
              </div>

              <Button variant="primary" icon={<Plus size={20} />}>
                New Deal
              </Button>
            </div>

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
                    <option value="in-progress">In Progress</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Deals Grid */}
            <div className="grid gap-6">
              {filteredDeals.map((deal) => {
                const statusConfig = statusColors[deal.status as keyof typeof statusColors];
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={deal.id} clickable className="hover:shadow-glow-primary">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                      {/* Deal Info */}
                      <div>
                        <h3 className="text-lg font-bold mb-1">{deal.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{deal.company}</p>
                        <Badge variant="primary" size="sm">
                          {deal.amount}
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
                        <p className="text-sm text-gray-400">{deal.stage}</p>
                        <p className="text-xs text-gray-500">Updated {deal.lastUpdate}</p>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Progress</p>
                          <span className="text-sm font-bold text-primary-400">{deal.progress}%</span>
                        </div>
                        <div className="bg-dark-800 rounded-full h-2">
                          <div
                            className="bg-gradient-accent h-full rounded-full transition-all"
                            style={{ width: `${deal.progress}%` }}
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
                    <div className="mt-4 pt-4 border-t border-primary-700/20">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Team:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {deal.participants.map((participant, idx) => (
                            <span key={idx} className="text-xs bg-primary-900/30 px-2 py-1 rounded-full">
                              {participant}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredDeals.length === 0 && (
              <Card className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No deals found</p>
                <Button variant="primary">Create First Deal</Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
