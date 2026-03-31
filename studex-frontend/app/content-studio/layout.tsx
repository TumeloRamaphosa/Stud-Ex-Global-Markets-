'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/content-studio', label: 'Dashboard', icon: '🏠' },
  { href: '/content-studio/generate', label: 'Generate', icon: '🎬' },
  { href: '/content-studio/api-keys', label: 'API Keys', icon: '🔑' },
  { href: '/content-studio/guides', label: 'Guides', icon: '📖' },
];

export default function ContentStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top Header */}
      <header className="border-b border-primary-800/50 bg-primary-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                AI Content Studio
              </h1>
              <p className="text-sm text-primary-300">
                Create incredible influencer content with AI
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-primary-700 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-800"
            >
              Back to Studex
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-primary-800/30 bg-primary-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/content-studio' &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-gold-500 text-primary-950 shadow-glow-gold'
                      : 'text-primary-300 hover:bg-primary-800/50 hover:text-white'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
