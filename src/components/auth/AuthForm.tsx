'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { hasBrowserSupabaseConfig } from '@/lib/social/env';

interface AuthFormProps {
  mode: 'login' | 'register';
  redirectTo?: string;
}

export default function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated } = useAuth();
  const isSupabaseConfigured = hasBrowserSupabaseConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError('Supabase auth is not configured yet. Add the required environment variables first.');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Display name is required');
        setLoading(false);
        return;
      }
      const { error: signUpError } = await signUp(email, password, displayName.trim());
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setSuccess('Account created! Check your email to confirm, or sign in directly.');
      setLoading(false);
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      // Show success message and mark for redirect
      setSuccess('Signed in successfully! Redirecting...');
      setShouldRedirect(true);
    }
  };

  // Redirect after auth state is synced
  useEffect(() => {
    if (shouldRedirect && isAuthenticated && mode === 'login') {
      const redirectDelay = setTimeout(() => {
        router.push(redirectTo || '/templates');
      }, 800); // Small delay to show success message
      return () => clearTimeout(redirectDelay);
    }
  }, [shouldRedirect, isAuthenticated, mode, router, redirectTo]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface/90 border border-border rounded-3xl p-8 shadow-[0_32px_120px_-48px_rgba(15,23,42,0.45)]">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-body text-text-secondary mb-6">
          {mode === 'login'
            ? 'Sign in to access your article pipeline, calendar, and publishing workspaces.'
            : 'Create an account to manage sites, approvals, and scheduling.'}
        </p>

        {!isSupabaseConfigured && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 mb-4 text-body text-warning">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable auth.
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-4 text-body text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/30 rounded-lg px-4 py-3 mb-4 text-body text-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-input-focus focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-input-focus focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-input-focus focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading || shouldRedirect}
            disabled={loading || shouldRedirect || !isSupabaseConfigured}
            className="w-full"
          >
            {shouldRedirect ? 'Redirecting...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-body-sm text-text-secondary">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-accent hover:underline font-medium">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
