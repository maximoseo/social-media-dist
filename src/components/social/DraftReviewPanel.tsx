'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import type { PostDraft, PostVariant } from '@/lib/social/types';

export function DraftReviewControls({
  siteId,
  draft,
}: {
  siteId: string;
  draft: PostDraft;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);

  async function review(approvalStatus: 'approved' | 'rejected') {
    setLoading(approvalStatus);
    const response = await fetch(`/api/sites/${siteId}/drafts/${draft.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approvalStatus }),
    });
    setLoading(null);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      addToast(payload.error ?? 'Failed to update draft review status.', 'error');
      return;
    }

    addToast(`Draft ${approvalStatus}.`, 'success');
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        loading={loading === 'approved'}
        onClick={() => review('approved')}
      >
        Approve draft
      </Button>
      <Button
        variant="ghost"
        loading={loading === 'rejected'}
        onClick={() => review('rejected')}
      >
        Reject draft
      </Button>
    </div>
  );
}

export function VariantEditor({
  siteId,
  variant,
}: {
  siteId: string;
  variant: PostVariant;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hook: variant.hook ?? '',
    body: variant.body,
    cta: variant.cta ?? '',
    hashtags: variant.hashtags.join(', '),
  });

  return (
    <div className="mt-5 space-y-4">
      <input
        value={form.hook}
        onChange={(event) => setForm((current) => ({ ...current, hook: event.target.value }))}
        placeholder="Hook"
        className="field-input"
      />
      <textarea
        rows={6}
        value={form.body}
        onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
        className="field-textarea min-h-[168px]"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.cta}
          onChange={(event) => setForm((current) => ({ ...current, cta: event.target.value }))}
          placeholder="CTA"
          className="field-input"
        />
        <input
          value={form.hashtags}
          onChange={(event) => setForm((current) => ({ ...current, hashtags: event.target.value }))}
          placeholder="seo, contentmarketing"
          className="field-input"
        />
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          loading={saving}
          onClick={async () => {
            setSaving(true);
            const response = await fetch(`/api/sites/${siteId}/variants/${variant.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                hook: form.hook || null,
                body: form.body,
                cta: form.cta || null,
                hashtags: form.hashtags
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              }),
            });
            setSaving(false);

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              addToast(payload.error ?? 'Failed to save variant changes.', 'error');
              return;
            }

            addToast('Variant updated.', 'success');
            router.refresh();
          }}
        >
          Save variant
        </Button>
      </div>
    </div>
  );
}
