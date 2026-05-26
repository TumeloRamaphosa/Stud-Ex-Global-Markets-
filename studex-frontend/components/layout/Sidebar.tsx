'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Clock,
  Settings,
  Search,
  X,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/marketing', icon: Megaphone, label: 'Marketing' },
  { href: '/deals', icon: Briefcase, label: 'Deal Pipeline' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/tracker', icon: Clock, label: 'Time Tracker' },
  { href: '/settings/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-primary-100 bg-white/90 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0 pt-20 md:pt-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 text-slate-500 hover:text-slate-900"
          >
            <X size={24} />
          </button>

          {/* Search Users */}
          <div className="p-4">
            <Input
              placeholder="Search users..."
              icon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              containerClassName="mb-0"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-800 border border-primary-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-primary-50'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="border-t border-primary-100 p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-primary-50 p-3">
                <p className="text-xs text-slate-500">Active Deals</p>
                <p className="text-lg font-bold">3</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-slate-500">Messages</p>
                <p className="text-lg font-bold">12</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Last login: Today at 9:30 AM
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
