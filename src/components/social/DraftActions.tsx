'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function GenerateDraftsButton({
  siteId,
  articleId,
}: {
  siteId: string;
  articleId: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      loading={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch(`/api/sites/${siteId}/articles/${articleId}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variationCount: 2,
          }),
        });
        setLoading(false);
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          addToast(payload.error ?? 'Draft generation failed.', 'error');
          return;
        }
        addToast('Drafts generated.', 'success');
        router.refresh();
      }}
    >
      Generate drafts
    </Button>
  );
}

export function GenerateAssetButton({
  siteId,
  draftId,
  variantId,
}: {
  siteId: string;
  draftId: string;
  variantId: string | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch(`/api/sites/${siteId}/drafts/${draftId}/assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ variantId }),
        });
        setLoading(false);
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          addToast(payload.error ?? 'Asset generation failed.', 'error');
          return;
        }
        addToast('Image asset generated.', 'success');
        router.refresh();
      }}
    >
      Generate image
    </Button>
  );
}

export function ScheduleVariantForm({
  siteId,
  draftId,
  variantId,
  platform,
  timezone,
  socialAccountId,
}: {
  siteId: string;
  draftId: string;
  variantId: string;
  platform: string;
  timezone: string;
  socialAccountId: string | null;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <input
        type="datetime-local"
        value={scheduledFor}
        onChange={(event) => setScheduledFor(event.target.value)}
        className="rounded-2xl border border-input-border bg-input-bg px-3 py-2 text-sm"
      />
      <Button
        size="sm"
        loading={loading}
        disabled={!scheduledFor}
        onClick={async () => {
          setLoading(true);
          const isoValue = new Date(scheduledFor).toISOString();
          const response = await fetch(`/api/sites/${siteId}/calendar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              variantId,
              draftId,
              socialAccountId,
              platform,
              timezone,
              scheduledFor: isoValue,
            }),
          });
          setLoading(false);
          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            addToast(payload.error ?? 'Scheduling failed.', 'error');
            return;
          }
          addToast('Post added to calendar.', 'success');
          router.refresh();
        }}
      >
        Add to calendar
      </Button>
    </div>
  );
}

export function PublishSelectionButton({
  siteId,
  entryIds,
  mode,
}: {
  siteId: string;
  entryIds: string[];
  mode: 'schedule' | 'publish_now';
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={mode === 'publish_now' ? 'primary' : 'secondary'}
      loading={loading}
      disabled={!entryIds.length}
      onClick={async () => {
        setLoading(true);
        const response = await fetch(`/api/sites/${siteId}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entryIds,
            mode,
          }),
        });
        setLoading(false);
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          addToast(payload.error ?? 'Publishing failed.', 'error');
          return;
        }
        addToast(mode === 'publish_now' ? 'Publish job submitted.' : 'Schedule job submitted.', 'success');
        router.refresh();
      }}
    >
      {mode === 'publish_now' ? 'Publish now' : 'Sync schedule to Publer'}
    </Button>
  );
}

export function SyncGoogleSheetsButton({
  siteId,
  entryIds,
}: {
  siteId: string;
  entryIds: string[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      loading={loading}
      disabled={!entryIds.length}
      onClick={async () => {
        setLoading(true);
        const response = await fetch(`/api/sites/${siteId}/sync/google-sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ entryIds }),
        });
        setLoading(false);

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          addToast(payload.error ?? 'Google Sheets sync failed.', 'error');
          return;
        }

        addToast('Google Sheets sync complete.', 'success');
        router.refresh();
      }}
    >
      Sync Sheets
    </Button>
  );
}
