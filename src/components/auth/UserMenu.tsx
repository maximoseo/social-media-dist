'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-surface-raised animate-pulse" />;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-2 text-body-sm font-medium text-accent hover:text-accent-hover transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    await signOut();
    // Small delay to ensure auth state is cleared before redirect
    setTimeout(() => {
      router.push('/');
      setIsLoggingOut(false);
    }, 500);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold hover:bg-accent-hover transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-body-sm font-medium text-text-primary truncate">
              {displayName}
            </p>
            <p className="text-caption text-text-muted truncate">{user?.email}</p>
          </div>
          <Link
            href="/templates"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-body-sm text-text-secondary hover:bg-surface-raised transition-colors"
          >
            My Templates
          </Link>
          <Link
            href="/analytics"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-body-sm text-text-secondary hover:bg-surface-raised transition-colors"
          >
            Analytics
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 text-body-sm text-destructive hover:bg-surface-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}
