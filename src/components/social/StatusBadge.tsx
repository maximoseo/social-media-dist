'use client';

import Badge from '@/components/ui/Badge';

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized.includes('success') || normalized.includes('publish') || normalized.includes('approved')
      ? 'success'
      : normalized.includes('fail') || normalized.includes('reject') || normalized.includes('error')
        ? 'error'
        : normalized.includes('schedule') || normalized.includes('pending')
          ? 'warning'
          : 'info';

  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
}
