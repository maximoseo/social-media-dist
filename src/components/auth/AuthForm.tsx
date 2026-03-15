'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { getSupabasePublicConfigStatus } from '@/lib/social/env';

interface AuthFormProps {
  mode: 'login' | 'register';
  redirectTo?: string;
}

export default function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated } = useAuth();
  const supabaseConfig = getSupabasePublicConfigStatus();
  const isSupabaseConfigured = supabaseConfig.configured;
  const targetPath = redirectTo || '/dashboard';
  const redirectQuery = redirectTo ? `?redirect=${encodeURIComponent(targetPath)}` : '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured. Please contact support.');
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
      setSuccess('Welcome back! Redirecting...');
      setShouldRedirect(true);
    }
  };

  useEffect(() => {
    if (shouldRedirect && isAuthenticated && mode === 'login') {
      router.replace(targetPath);
      router.refresh();
    }
  }, [shouldRedirect, isAuthenticated, mode, router, targetPath]);

  useEffect(() => {
    if (mode === 'login' && isAuthenticated && !shouldRedirect) {
      router.replace(redirectTo || '/dashboard');
    }
  }, [isAuthenticated, mode, redirectTo, router, shouldRedirect]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface))/0.99,hsl(var(--surface-raised))/0.97)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/3 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        
        <div className="relative p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-accent/25 bg-accent/10 mb-5">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {mode === 'login'
                ? 'Sign in to access your publishing workspace'
                : 'Get started with your social media distribution'}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-warning mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-warning">Authentication unavailable</p>
                  <p className="mt-1 text-xs text-warning/80">Please contact support if this issue persists.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 animate-slide-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-destructive mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-success/30 bg-success/10 px-4 py-3.5 animate-slide-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-success">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium text-text-primary">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-input-border/90 bg-input-bg/85 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/70 focus:border-accent focus:bg-surface focus:ring-[3px] focus:ring-accent/15"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-input-border/90 bg-input-bg/85 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/70 focus:border-accent focus:bg-surface focus:ring-[3px] focus:ring-accent/15"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-input-border/90 bg-input-bg/85 px-4 py-3 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/70 focus:border-accent focus:bg-surface focus:ring-[3px] focus:ring-accent/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading || shouldRedirect}
              disabled={loading || shouldRedirect || !isSupabaseConfigured}
              className="w-full mt-6"
            >
              {shouldRedirect ? 'Redirecting...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-text-secondary">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/auth/register${redirectQuery}`}
                    className="font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    href={`/auth/login${redirectQuery}`}
                    className="font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
