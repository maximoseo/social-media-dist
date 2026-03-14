'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export function LogoutButton() {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      icon={<LogOut className="h-4 w-4" />}
      loading={pending}
      disabled={pending}
      onClick={async () => {
        if (pending) return;

        setPending(true);
        try {
          await signOut();
        } finally {
          window.location.assign('/auth/logout');
        }
      }}
    >
      {pending ? 'Signing out...' : 'Logout'}
    </Button>
  );
}
