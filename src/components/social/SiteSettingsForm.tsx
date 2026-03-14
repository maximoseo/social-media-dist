'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Globe2, Megaphone, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import type { SiteBundle } from '@/lib/social/types';
import { SOCIAL_PLATFORMS } from '@/lib/social/constants';

const settingsHighlights = [
  {
    title: 'Brand system',
    copy: 'Voice, CTA defaults, and prompting rules.',
    icon: Sparkles,
  },
  {
    title: 'Publishing channels',
    copy: 'Target platforms, UTM defaults, and queue behavior.',
    icon: Globe2,
  },
  {
    title: 'Governance',
    copy: 'Approval requirements, webhook rules, and moderation control.',
    icon: ShieldCheck,
  },
] as const;

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
    <form onSubmit={handleSubmit} className="page-stack">
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="section-header">
            <div className="max-w-3xl">
              <p className="eyebrow">Site settings</p>
              <h2 className="section-title mt-3">Brand, platform, and approval rules</h2>
              <p className="section-copy mt-3">
                Define how this workspace sounds, where it publishes, how image generation should be
                framed, and what approval guardrails need to exist before scheduling.
              </p>
            </div>
            <Button loading={loading} size="lg">Save changes</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {settingsHighlights.map((item) => {
              const Glyph = item.icon;
              return (
                <div key={item.title} className="data-card">
                  <Glyph className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Identity</p>
            <h3 className="section-subtitle mt-3">Workspace profile</h3>
            <p className="section-copy mt-2">Core identity settings that define how this workspace appears and operates.</p>
          </div>
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
        <label className="field-group mt-4">
          <span className="field-label">Brand voice</span>
          <textarea
            rows={4}
            value={form.brandVoice}
            onChange={(event) => setForm((current) => ({ ...current, brandVoice: event.target.value }))}
            className="field-textarea min-h-[148px]"
          />
        </label>
      </section>

      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Channel strategy</p>
            <h3 className="section-subtitle mt-3">Platforms and posting controls</h3>
          </div>
          <div className="toolbar-chip">
            <Megaphone className="h-4 w-4 text-accent" />
            {form.targetPlatforms.length} platform selections
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
        {platformOptions.map((platform) => {
          const checked = form.targetPlatforms.includes(platform);
          return (
            <label key={platform} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface-raised/60 px-4 py-3 text-sm text-text-secondary transition-all hover:border-accent/20">
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
                className="sr-only"
              />
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${checked ? 'border-accent/20 bg-accent/10 text-accent' : 'border-border/70 bg-surface text-text-muted'}`}>
                {checked ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              <span className={`font-medium capitalize ${checked ? 'text-text-primary' : ''}`}>{platform.replace(/_/g, ' ')}</span>
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
      </section>

      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Prompts and governance</p>
            <h3 className="section-subtitle mt-3">Prompt defaults and approval rules</h3>
            <p className="section-copy mt-2">Control how AI prompts are framed and what approval steps are required before publishing.</p>
          </div>
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
        <label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-surface-raised/60 px-4 py-3.5 text-sm font-medium transition-colors hover:border-accent/20 hover:bg-surface-raised/80">
        <input
          type="checkbox"
          checked={form.approvalRequired}
          onChange={(event) => setForm((current) => ({ ...current, approvalRequired: event.target.checked }))}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Require approval before scheduling/publishing
        </label>
      </section>
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
    <label className="field-group">
      <span className="field-label">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-input"
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
    <label className="field-group mt-4">
      <span className="field-label">{label}</span>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-textarea"
      />
    </label>
  );
}
