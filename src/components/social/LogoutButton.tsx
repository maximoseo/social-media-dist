'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <Button
      variant="ghost"
      icon={<LogOut className="h-4 w-4" />}
      onClick={async () => {
        await signOut();
        router.replace('/auth/login');
        router.refresh();
      }}
    >
      Logout
    </Button>
  );
}
