import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/social/guards';

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  redirect(user ? '/dashboard' : '/auth/login');
}
