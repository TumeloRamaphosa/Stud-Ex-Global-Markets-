'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import {
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const timeEntries = [
  {
    id: 1,
    task: 'Client Meeting - Series A Discussion',
    project: 'TechStartup Inc',
    duration: 2.5,
    date: new Date(),
    category: 'Meetings',
  },
  {
    id: 2,
    task: 'Due Diligence Review',
    project: 'TechStartup Inc',
    duration: 3.75,
    date: new Date(Date.now() - 86400000),
    category: 'Analysis',
  },
  {
    id: 3,
    task: 'Contract Negotiation',
    project: 'Global Partners LLC',
    duration: 1.5,
    date: new Date(Date.now() - 172800000),
    category: 'Legal',
  },
  {
    id: 4,
    task: 'Pitch Preparation',
    project: 'Innovation Corp',
    duration: 4.25,
    date: new Date(Date.now() - 259200000),
    category: 'Meetings',
  },
];

const categories = ['All', 'Meetings', 'Analysis', 'Legal', 'Administrative'];

export default function TrackerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newTaskName, setNewTaskName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const filteredEntries = selectedCategory === 'All'
    ? timeEntries
    : timeEntries.filter((entry) => entry.category === selectedCategory);

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const averagePerDay = totalHours / 7; // Assuming weekly

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      console.log('Add task:', { task: newTaskName, project: newProjectName });
      setNewTaskName('');
      setNewProjectName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                <Clock size={32} className="text-primary-500" />
                Time Tracker
              </h1>
              <p className="text-gray-400">Track your time across projects and tasks</p>
            </div>

            {/* Timer Section */}
            <Card className="mb-8 bg-gradient-to-r from-primary-900/30 to-transparent">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Timer */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold mb-4">Active Timer</h2>

                  <form onSubmit={handleAddTask} className="space-y-4 mb-6">
                    <Input
                      placeholder="What are you working on?"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      icon={<Clock size={18} />}
                    />

                    <Input
                      placeholder="Project name (optional)"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isRunning ? 'secondary' : 'primary'}
                        icon={isRunning ? <Pause size={18} /> : <Play size={18} />}
                        onClick={() => setIsRunning(!isRunning)}
                        className="flex-1"
                      >
                        {isRunning ? 'Pause' : 'Start'} Timer
                      </Button>
                      <Button type="submit" variant="secondary" icon={<Plus size={18} />}>
                        Save & Start New
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Timer Display */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gold-500 font-mono mb-2">
                      {Math.floor(elapsed / 3600)}:{String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                    </div>
                    <p className="text-gray-400">Time elapsed</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Hours (This Week)</p>
                    <p className="text-3xl font-bold">{totalHours.toFixed(2)}h</p>
                  </div>
                  <Clock className="text-primary-500" size={24} />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Average Per Day</p>
                    <p className="text-3xl font-bold">{averagePerDay.toFixed(1)}h</p>
                  </div>
                  <BarChart3 className="text-gold-500" size={24} />
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Tasks Logged</p>
                    <p className="text-3xl font-bold">{filteredEntries.length}</p>
                  </div>
                  <Calendar className="text-emerald-500" size={24} />
                </div>
              </Card>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-400 hover:text-white border border-primary-700/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Time Entries List */}
            <Card>
              <h2 className="text-2xl font-bold mb-6">Time Entries</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-700/20">
                      <th className="text-left py-3 px-4 font-semibold">Task</th>
                      <th className="text-left py-3 px-4 font-semibold">Project</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-primary-700/10 hover:bg-dark-800/50 transition-colors">
                        <td className="py-3 px-4">{entry.task}</td>
                        <td className="py-3 px-4">{entry.project}</td>
                        <td className="py-3 px-4">
                          <Badge variant="primary" size="sm">
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">{entry.duration.toFixed(2)}h</td>
                        <td className="py-3 px-4 text-gray-400">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Weekly Breakdown */}
            <Card className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Weekly Breakdown</h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const hours = [8.5, 7.25, 9, 6.75, 8.25, 2, 1.25][idx];
                  return (
                    <div key={day} className="text-center">
                      <p className="text-sm font-medium mb-2">{day}</p>
                      <div className="bg-dark-800 rounded-lg p-3">
                        <p className="text-2xl font-bold text-gold-500">{hours.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">hours</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
