import AuthForm from '@/components/auth/AuthForm';
import { sanitizeRedirectPath } from '@/lib/supabase/auth';

export const metadata = {
  title: 'Sign In · Social Media Dist',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirectTo = sanitizeRedirectPath(searchParams?.redirect, '/dashboard');
  return <AuthForm mode="login" redirectTo={redirectTo} />;
}
