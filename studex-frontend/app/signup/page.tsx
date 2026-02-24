'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { isValidEmail } from '@/lib/utils';

type UserRole = 'investor' | 'entrepreneur';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'role' | 'details'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('investor');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setStep('role');
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, displayName, role);
      toast.success('Account created successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      if (errorMessage.includes('already-in-use')) {
        toast.error('Email already registered. Please login instead.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Account created with Google');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Google signup failed');
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
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-400">
                {step === 'email' && 'Enter your email to get started'}
                {step === 'role' && 'What best describes you?'}
                {step === 'details' && 'Complete your profile'}
              </p>
            </div>

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />

                <Button type="submit" variant="primary" fullWidth>
                  Continue
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-700/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-900 text-gray-400">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  isLoading={isGoogleLoading}
                  icon={<Chrome size={18} />}
                  onClick={handleGoogleSignup}
                >
                  Google
                </Button>
              </form>
            )}

            {/* Step 2: Role Selection */}
            {step === 'role' && (
              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('investor')}
                  className="w-full rounded-lg border-2 border-primary-700/30 bg-dark-800/50 p-4 text-left hover:border-primary-600/50 hover:bg-dark-800 transition-all"
                >
                  <h3 className="font-bold mb-1">Investor</h3>
                  <p className="text-sm text-gray-400">
                    Looking to invest in startups and business opportunities
                  </p>
                </button>

                <button
                  onClick={() => handleRoleSelect('entrepreneur')}
                  className="w-full rounded-lg border-2 border-primary-700/30 bg-dark-800/50 p-4 text-left hover:border-primary-600/50 hover:bg-dark-800 transition-all"
                >
                  <h3 className="font-bold mb-1">Entrepreneur</h3>
                  <p className="text-sm text-gray-400">
                    Building a business and seeking investment or partnerships
                  </p>
                </button>

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 'details' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={<User size={18} />}
                  required
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  helper="At least 6 characters"
                  required
                />

                <div className="rounded-lg bg-primary-900/20 border border-primary-700/30 p-3 text-sm">
                  <p className="text-gray-300">
                    I agree to the <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
                    <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Create Account
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep('role')}
                >
                  Back
                </Button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-400 hover:text-primary-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
