import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { getAuthenticatedUser } from '@/lib/social/guards';
import { sanitizeRedirectPath } from '@/lib/supabase/auth';

export const metadata = {
  title: 'Create Account | Social Media Dist',
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { redirect?: string; next?: string };
}) {
  const redirectTo = sanitizeRedirectPath(
    searchParams?.redirect ?? searchParams?.next,
    '/dashboard',
  );
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(redirectTo);
  }

  return <AuthForm mode="register" redirectTo={redirectTo} />;
}
