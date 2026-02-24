'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  Target,
  MessageSquare,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';

const revenueData = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 52000 },
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 61000 },
  { month: 'May', value: 55000 },
  { month: 'Jun', value: 67000 },
];

const upcomingDeals = [
  {
    id: 1,
    title: 'Series A Funding',
    company: 'TechStartup Inc',
    amount: '$2.5M',
    status: 'In Progress',
    progress: 60,
  },
  {
    id: 2,
    title: 'Partnership Deal',
    company: 'Global Partners LLC',
    amount: '$500K',
    status: 'Negotiation',
    progress: 40,
  },
  {
    id: 3,
    title: 'Acquisition Interest',
    company: 'Innovation Corp',
    amount: '$1.8M',
    status: 'Pending',
    progress: 20,
  },
];

const recentMessages = [
  { id: 1, user: 'Alice Johnson', message: 'Interested in your startup...', time: '2m ago' },
  { id: 2, user: 'Bob Smith', message: 'Let\'s discuss terms', time: '15m ago' },
  { id: 3, user: 'Carol Davis', message: 'Great presentation today!', time: '1h ago' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {user?.displayName || 'User'}!
              </h1>
              <p className="text-gray-400">Here's your business overview</p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold">$67K</p>
                  </div>
                  <div className="text-green-500">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
                <p className="text-green-500 text-sm mt-3">+12% from last month</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active Deals</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <Briefcase className="text-primary-400" size={24} />
                </div>
                <p className="text-primary-400 text-sm mt-3">$4.8M in pipeline</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Annual Goal</p>
                    <p className="text-3xl font-bold">$750K</p>
                  </div>
                  <Target className="text-gold-500" size={24} />
                </div>
                <p className="text-gray-400 text-sm mt-3">67% achieved</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Messages</p>
                    <p className="text-3xl font-bold">12</p>
                  </div>
                  <MessageSquare className="text-emerald-500" size={24} />
                </div>
                <p className="text-emerald-500 text-sm mt-3">3 new today</p>
              </Card>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={24} className="text-gold-500" />
                    Revenue Trend
                  </h2>

                  <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {revenueData.map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-gold-500 to-primary-500 rounded-t-lg hover:shadow-glow-gold transition-all"
                          style={{ height: `${(data.value / 67000) * 100}%` }}
                        />
                        <span className="text-xs text-gray-400">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* AI Deal Well */}
              <Card className="bg-gradient-to-br from-primary-900/30 to-transparent">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={24} className="text-gold-500" />
                  AI Deal Well
                </h2>

                <div className="space-y-4">
                  <div className="p-3 bg-primary-900/20 rounded-lg border border-primary-600/30">
                    <p className="text-sm text-gray-300">
                      Your Series A deal is likely to close in 2 weeks based on negotiation patterns.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-600/30">
                    <p className="text-sm text-gray-300">
                      Consider reaching out to 5 similar investors in your network.
                    </p>
                  </div>

                  <Button variant="outline" size="sm" fullWidth>
                    Get More Insights
                  </Button>
                </div>
              </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Active Deals */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase size={24} className="text-primary-500" />
                    Active Deals
                  </h2>
                  <Button variant="ghost" size="sm" icon={<Plus size={18} />} />
                </div>

                <div className="space-y-4">
                  {upcomingDeals.map((deal) => (
                    <div key={deal.id} className="border-b border-primary-700/20 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{deal.title}</h3>
                          <p className="text-sm text-gray-400">{deal.company}</p>
                        </div>
                        <Badge variant="primary" size="sm">
                          {deal.amount}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-800 rounded-full h-2">
                          <div
                            className="bg-gradient-accent h-full rounded-full"
                            style={{ width: `${deal.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{deal.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Messages */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare size={24} className="text-emerald-500" />
                    Recent Messages
                  </h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-dark-800/50 border border-primary-700/20 hover:border-primary-600/50 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{msg.user}</p>
                          <p className="text-sm text-gray-400 truncate">{msg.message}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{msg.time}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Calendar & Time Tracker */}
            <div className="mt-8 grid lg:grid-cols-2 gap-8">
              <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-primary-500" />
                  Upcoming Events
                </h2>

                <div className="space-y-3">
                  {[
                    { date: 'Today', time: '2:00 PM', title: 'Investor Call' },
                    { date: 'Tomorrow', time: '10:00 AM', title: 'Deal Review Meeting' },
                    { date: 'Friday', time: '4:00 PM', title: 'Networking Event' },
                  ].map((event, idx) => (
                    <div key={idx} className="flex gap-4 p-3 rounded-lg bg-dark-800/50 border border-primary-700/20">
                      <div className="text-primary-400 font-bold min-w-fit">{event.time}</div>
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-gray-400">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-gold-500" />
                  Time Logged
                </h2>

                <div className="space-y-3">
                  {[
                    { task: 'Client Meetings', hours: 12.5 },
                    { task: 'Deal Negotiations', hours: 18.75 },
                    { task: 'Research & Analysis', hours: 8.25 },
                    { task: 'Administrative', hours: 4.5 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-primary-700/20">
                      <span className="font-medium">{item.task}</span>
                      <span className="text-primary-400 font-bold">{item.hours}h</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
