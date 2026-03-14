'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Bot, Clock3, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';

const workspaceHighlights = [
  { label: 'n8n intake ready', icon: Bot },
  { label: 'Timezone aware', icon: Clock3 },
  { label: 'Approval capable', icon: BadgeCheck },
] as const;


export function CreateWorkspaceForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organizationName: '',
    siteName: '',
    domain: '',
    timezone: 'America/Chicago',
    brandVoice: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      addToast(payload.error ?? 'Failed to create workspace.', 'error');
      return;
    }

    addToast('Workspace created.', 'success');
    setForm({
      organizationName: '',
      siteName: '',
      domain: '',
      timezone: 'America/Chicago',
      brandVoice: '',
    });
    router.refresh();
  }

  return (
    <form
      id="create-workspace"
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-2xl border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface))/0.98,hsl(var(--surface-raised))/0.95)] p-6 sm:p-7"
    >
      <div className="section-header">
        <div className="max-w-xl">
          <p className="eyebrow">Create workspace</p>
          <h2 className="section-subtitle mt-3 sm:text-[1.9rem]">
            Add a new site or brand with operational defaults built in
          </h2>
          <p className="section-copy mt-3">
            This creates the protected workspace shell, publishing profile, and brand context used by
            article intake, draft generation, calendar scheduling, and channel sync.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
          {workspaceHighlights.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface-raised/65 px-4 py-3 text-sm text-text-secondary"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                <item.icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-xs font-bold text-accent">1</span>
            <span className="text-sm font-semibold text-text-primary">Identity</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Organization"
              description="Owning client, business group, or internal org."
              value={form.organizationName}
              onChange={(value) => setForm((current) => ({ ...current, organizationName: value }))}
              placeholder="Maximo SEO"
              required
            />
            <Input
              label="Site name"
              description="The brand or site label shown across the dashboard."
              value={form.siteName}
              onChange={(value) => setForm((current) => ({ ...current, siteName: value }))}
              placeholder="HTML Improvement"
              required
            />
          </div>
        </div>

        <div className="border-t border-border/50 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-xs font-bold text-accent">2</span>
            <span className="text-sm font-semibold text-text-primary">Configuration</span>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <Input
              label="Domain"
              description="Canonical site URL used for article source matching and UTM defaults."
              value={form.domain}
              onChange={(value) => setForm((current) => ({ ...current, domain: value }))}
              placeholder="https://example.com"
              icon={<Globe2 className="h-4 w-4" />}
              required
            />
            <Input
              label="Timezone"
              description="Base timezone for scheduling, calendar defaults, and publish windows."
              value={form.timezone}
              onChange={(value) => setForm((current) => ({ ...current, timezone: value }))}
              placeholder="America/Chicago"
            />
          </div>
        </div>

        <div className="border-t border-border/50 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-xs font-bold text-accent">3</span>
            <span className="text-sm font-semibold text-text-primary">Brand</span>
          </div>
          <label className="field-group">
            <span className="field-label">Brand voice</span>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Give the generator tone constraints, messaging guardrails, and what to avoid.
            </p>
            <textarea
              value={form.brandVoice}
              onChange={(event) =>
                setForm((current) => ({ ...current, brandVoice: event.target.value }))
              }
              rows={5}
              placeholder="Direct, practical, and premium. Avoid hype. Anchor every post to tangible value and keep CTAs clear."
              className={cn('field-input mt-2 rounded-xl', 'min-h-[136px] resize-y')}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-text-secondary">
          The new workspace will appear in the dashboard immediately and inherit secure server-side
          integrations.
        </p>
        <Button loading={loading} size="lg">
          Create workspace
        </Button>
      </div>
    </form>
  );
}

function Input({
  label,
  description,
  value,
  onChange,
  placeholder,
  icon,
  required,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="field-group">
      <span className="field-label">{label}{required && <span className="ml-1 text-accent">*</span>}</span>
      {description ? <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
            {icon}
          </span>
        ) : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn('field-input mt-2', icon ? 'pl-11' : '')}
        />
      </div>
    </label>
  );
}
