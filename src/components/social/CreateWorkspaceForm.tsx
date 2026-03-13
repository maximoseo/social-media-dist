'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

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
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-border/70 bg-surface/90 p-5">
      <div>
        <p className="eyebrow">Create workspace</p>
        <h2 className="mt-2 text-xl font-semibold">Add a new site or brand</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Organization"
          value={form.organizationName}
          onChange={(value) => setForm((current) => ({ ...current, organizationName: value }))}
          placeholder="Maximo SEO"
        />
        <Input
          label="Site name"
          value={form.siteName}
          onChange={(value) => setForm((current) => ({ ...current, siteName: value }))}
          placeholder="HTML Improvement"
        />
      </div>
      <Input
        label="Domain"
        value={form.domain}
        onChange={(value) => setForm((current) => ({ ...current, domain: value }))}
        placeholder="https://example.com"
      />
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Input
          label="Timezone"
          value={form.timezone}
          onChange={(value) => setForm((current) => ({ ...current, timezone: value }))}
          placeholder="America/Chicago"
        />
        <label className="text-sm font-medium text-text-primary">
          Brand voice
          <textarea
            value={form.brandVoice}
            onChange={(event) =>
              setForm((current) => ({ ...current, brandVoice: event.target.value }))
            }
            rows={4}
            placeholder="Direct, practical, and premium. Avoid hype and anchor every post to tangible value."
            className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary outline-none ring-0 transition-colors focus:border-input-focus"
          />
        </label>
      </div>
      <div className="flex justify-end">
        <Button loading={loading}>Create workspace</Button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="text-sm font-medium text-text-primary">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary outline-none ring-0 transition-colors focus:border-input-focus"
      />
    </label>
  );
}
