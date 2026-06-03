'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/storefront', label: 'Storefront', icon: '◆' },
  { href: '/store', label: 'Store', icon: '▣' },
  { href: '/ads', label: 'Ad Manager', icon: '◎' },
  { href: '/strategy', label: 'Strategy Room', icon: '◈' },
  { href: '/agent-dashboard', label: 'CashClaw Agent', icon: '⚡' },
  { href: '/meat-dashboard', label: 'Operations', icon: '▤' },
  { href: '/onboarding', label: 'KYC / Onboarding', icon: '◇' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex-col z-50">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            SM
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Studex Meat</h1>
            <p className="text-xs text-gray-500">Premium Wagyu & Meats</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-600/20 text-red-400 border border-red-800/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-600">
          <p>Studex Meat (Pty) Ltd</p>
          <p className="mt-1">Powered by CashClaw</p>
        </div>
      </div>
    </aside>
  );
}
