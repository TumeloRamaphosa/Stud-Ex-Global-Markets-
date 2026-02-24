'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { TrendingUp, Users, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Connect & Collaborate',
    description: 'Meet global investors and entrepreneurs in your industry',
  },
  {
    icon: Briefcase,
    title: 'Manage Deals',
    description: 'Track, negotiate, and close deals in real-time',
  },
  {
    icon: TrendingUp,
    title: 'Track Revenue',
    description: 'Monitor goals, revenue, and business metrics',
  },
  {
    icon: Zap,
    title: 'AI Deal Well',
    description: 'Get smart insights from our Gemini-powered AI',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Log hours and manage your time efficiently',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security for all communications',
  },
];

import { Briefcase, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header />

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <div className="rounded-full border border-primary-600/30 bg-primary-900/20 px-4 py-1.5 text-sm text-primary-300">
              Welcome to the Future of Global Markets
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Connect with
            <span className="text-gradient"> Global Opportunities</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Studex Global Markets connects investors and entrepreneurs worldwide.
            Manage deals, collaborate securely, and grow together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => router.push('/signup')}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
            >
              Get Started
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
            >
              Sign In
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="rounded-2xl border border-primary-600/20 bg-gradient-to-b from-primary-900/20 to-transparent p-8 mb-20">
            <div className="aspect-video bg-dark-800/50 rounded-lg border border-primary-700/30 flex items-center justify-center">
              <Globe className="w-24 h-24 text-primary-600/30 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-dark-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg">
              Everything you need to manage global business relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-primary-700/30 bg-dark-900/50 backdrop-blur-md p-6 hover:border-primary-600/50 hover:shadow-glow-primary transition-all duration-300"
                >
                  <Icon className="w-10 h-10 text-gold-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl border border-primary-600/30 bg-gradient-to-r from-primary-900/20 to-transparent p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Start connecting with investors and entrepreneurs from around the world today.
            </p>
            <Button
              onClick={() => router.push('/signup')}
              variant="primary"
              size="lg"
              fullWidth
              className="sm:w-auto sm:px-8"
            >
              Create Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-700/20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2024 Studex Global Markets. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
