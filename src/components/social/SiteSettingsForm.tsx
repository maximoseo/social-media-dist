'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import type { SiteBundle } from '@/lib/social/types';
import { SOCIAL_PLATFORMS } from '@/lib/social/constants';

export function SiteSettingsForm({ bundle }: { bundle: SiteBundle }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: bundle.site.name,
    domain: bundle.site.domain,
    brandVoice: bundle.site.brand_voice ?? '',
    targetPlatforms: bundle.settings?.target_platforms ?? ['linkedin', 'facebook'],
    postingRules: (bundle.settings?.posting_rules ?? []).join('\n'),
    defaultHashtags: (bundle.settings?.default_hashtags ?? []).join(', '),
    imageStylePrompt: bundle.settings?.image_style_prompt ?? '',
    ctaDefaults: (bundle.settings?.cta_defaults ?? []).join('\n'),
    utmCampaign: bundle.settings?.utm_campaign ?? '',
    timezone: bundle.settings?.timezone ?? bundle.site.timezone,
    approvalRequired: bundle.settings?.approval_required ?? true,
    webhookSecret: '',
  });

  const platformOptions = useMemo(() => SOCIAL_PLATFORMS, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/sites/${bundle.site.id}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        postingRules: form.postingRules.split('\n').map((value) => value.trim()).filter(Boolean),
        defaultHashtags: form.defaultHashtags.split(',').map((value) => value.trim()).filter(Boolean),
        ctaDefaults: form.ctaDefaults.split('\n').map((value) => value.trim()).filter(Boolean),
      }),
    });

    setLoading(false);
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      addToast(payload.error ?? 'Failed to save settings.', 'error');
      return;
    }

    addToast('Settings updated.', 'success');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="section-shell">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Site settings</p>
          <h2 className="mt-2 text-2xl font-semibold">Brand, platform, and approval rules</h2>
        </div>
        <Button loading={loading}>Save changes</Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Site name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
        <Field label="Domain" value={form.domain} onChange={(domain) => setForm((current) => ({ ...current, domain }))} />
        <Field
          label="Timezone"
          value={form.timezone}
          onChange={(timezone) => setForm((current) => ({ ...current, timezone }))}
        />
        <Field
          label="UTM campaign"
          value={form.utmCampaign}
          onChange={(utmCampaign) => setForm((current) => ({ ...current, utmCampaign }))}
        />
      </div>
      <label className="mt-4 block text-sm font-medium text-text-primary">
        Brand voice
        <textarea
          rows={4}
          value={form.brandVoice}
          onChange={(event) => setForm((current) => ({ ...current, brandVoice: event.target.value }))}
          className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm"
        />
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {platformOptions.map((platform) => {
          const checked = form.targetPlatforms.includes(platform);
          return (
            <label key={platform} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface-raised/60 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetPlatforms: event.target.checked
                      ? [...current.targetPlatforms, platform]
                      : current.targetPlatforms.filter((item) => item !== platform),
                  }))
                }
              />
              <span>{platform.replace(/_/g, ' ')}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Textarea
          label="Posting rules"
          value={form.postingRules}
          onChange={(postingRules) => setForm((current) => ({ ...current, postingRules }))}
        />
        <Textarea
          label="CTA defaults"
          value={form.ctaDefaults}
          onChange={(ctaDefaults) => setForm((current) => ({ ...current, ctaDefaults }))}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Default hashtags"
          value={form.defaultHashtags}
          onChange={(defaultHashtags) => setForm((current) => ({ ...current, defaultHashtags }))}
        />
        <Field
          label="Webhook secret"
          value={form.webhookSecret}
          onChange={(webhookSecret) => setForm((current) => ({ ...current, webhookSecret }))}
          placeholder="Optional site-specific secret"
        />
      </div>
      <Textarea
        label="Image prompt template"
        value={form.imageStylePrompt}
        onChange={(imageStylePrompt) => setForm((current) => ({ ...current, imageStylePrompt }))}
      />
      <label className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-surface-raised/60 px-4 py-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.approvalRequired}
          onChange={(event) => setForm((current) => ({ ...current, approvalRequired: event.target.checked }))}
        />
        Require approval before scheduling/publishing
      </label>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-medium text-text-primary">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-text-primary">
      {label}
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm"
      />
    </label>
  );
}
