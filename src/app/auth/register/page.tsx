import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create Account · Social Media Dist',
};

export default function RegisterPage() {
  return <AuthForm mode="register" redirectTo="/dashboard" />;
}
