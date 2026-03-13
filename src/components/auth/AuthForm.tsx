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
    <div className="w-full max-w-[520px] mx-auto">
      <div className="rounded-[32px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--surface))/0.98,hsl(var(--surface-raised))/0.96)] p-7 shadow-[0_40px_120px_-64px_rgba(0,0,0,0.9)] sm:p-8">
        <div className="toolbar-chip w-fit border-accent/20 bg-accent/10 text-accent">
          {mode === 'login' ? 'Secure sign in' : 'Create operator account'}
        </div>
        <h2 className="mt-5 text-[2rem] font-semibold tracking-tight text-text-primary">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mt-3 text-body text-text-secondary mb-6 leading-6">
          {mode === 'login'
            ? 'Sign in to access your article pipeline, calendar, and publishing workspaces.'
            : 'Create an account to manage sites, approvals, and scheduling.'}
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-[22px] border border-warning/25 bg-warning/[0.12] px-4 py-3 text-body text-warning">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable auth.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-[22px] border border-destructive/25 bg-destructive/[0.12] px-4 py-3 text-body text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-[22px] border border-success/25 bg-success/[0.12] px-4 py-3 text-body text-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="field-group">
              <label className="field-label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="field-input"
              />
            </div>
          )}

          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="field-input"
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

        <div className="subtle-divider mt-6 pt-5 text-center text-body-sm text-text-secondary">
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
