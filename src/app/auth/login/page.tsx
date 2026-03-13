import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In · Social Media Dist',
};

export default function LoginPage() {
  return <AuthForm mode="login" redirectTo="/dashboard" />;
}
