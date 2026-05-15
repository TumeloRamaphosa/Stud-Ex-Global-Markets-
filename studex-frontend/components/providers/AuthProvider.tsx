'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error?: Error;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
});

function isFirebaseConfigured(): boolean {
  try {
    const { auth } = require('@/lib/firebase');
    return auth && typeof auth.onAuthStateChanged === 'function';
  } catch {
    return false;
  }
}

function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const { useAuthState } = require('react-firebase-hooks/auth');
  const { auth } = require('@/lib/firebase');
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    const publicRoutes = ['/', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/marketing/instagram-analytics') || pathname.startsWith('/preview');
    if (!user && !isPublicRoute) router.push('/login');
    if (user && (pathname === '/login' || pathname === '/signup')) router.push('/dashboard');
  }, [user, loading, pathname, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: user || null, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

function NoAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [hasFirebase, setHasFirebase] = useState<boolean | null>(null);

  useEffect(() => {
    setHasFirebase(isFirebaseConfigured());
  }, []);

  if (hasFirebase === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasFirebase) {
    return <NoAuthProvider>{children}</NoAuthProvider>;
  }

  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
