'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { Mail, Lock, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Logged in with Google');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-primary-700/30 bg-dark-900/50 backdrop-blur-md p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Studex account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-700/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              isLoading={isGoogleLoading}
              icon={<Chrome size={18} />}
              onClick={handleGoogleLogin}
              className="mb-6"
            >
              Google
            </Button>

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary-400 hover:text-primary-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-6 rounded-lg bg-primary-900/20 border border-primary-700/30 p-4">
            <p className="text-sm text-gray-300">
              <strong>Demo Account:</strong> Use any email with password "password123" to test the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
