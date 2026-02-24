'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X, LogOut, Settings, Bell, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { signOut } from '@/lib/auth';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary-700/20 bg-dark-900/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center font-bold text-dark-900">
              S
            </div>
            <span className="hidden sm:inline font-bold text-lg">Studex</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/deals" className="text-gray-400 hover:text-white transition-colors">
                Deals
              </Link>
              <Link href="/messages" className="text-gray-400 hover:text-white transition-colors">
                Messages
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* Search Icon (Mobile) */}
                <button className="md:hidden text-gray-400 hover:text-white transition-colors">
                  <Search size={20} />
                </button>

                {/* Notifications */}
                <button className="relative text-gray-400 hover:text-white transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-primary-700/30 bg-dark-900 shadow-xl">
                      <div className="p-2">
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-red-400"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="hidden sm:flex"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                onMenuToggle?.();
              }}
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && user && (
          <nav className="md:hidden py-4 border-t border-primary-700/20">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/deals"
              className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Deals
            </Link>
            <Link
              href="/messages"
              className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Messages
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
