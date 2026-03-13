'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function ManualArticleImportForm({ siteId }: { siteId: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    url: '',
    slug: '',
    excerpt: '',
    bodyMarkdown: '',
    featuredImageUrl: '',
    keywords: '',
    tags: '',
    category: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/sites/${siteId}/articles/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId,
        article: {
          ...form,
          keywords: form.keywords.split(',').map((value) => value.trim()).filter(Boolean),
          tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean),
        },
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      addToast(payload.error ?? 'Failed to import article.', 'error');
      return;
    }

    addToast('Article imported.', 'success');
    setForm({
      title: '',
      url: '',
      slug: '',
      excerpt: '',
      bodyMarkdown: '',
      featuredImageUrl: '',
      keywords: '',
      tags: '',
      category: '',
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="section-shell">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Manual import</p>
          <h3 className="mt-2 text-xl font-semibold">Receive an article without waiting for n8n</h3>
        </div>
        <Button loading={loading}>Import article</Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} />
        <Input label="URL" value={form.url} onChange={(url) => setForm((current) => ({ ...current, url }))} />
        <Input label="Slug" value={form.slug} onChange={(slug) => setForm((current) => ({ ...current, slug }))} />
        <Input
          label="Featured image URL"
          value={form.featuredImageUrl}
          onChange={(featuredImageUrl) => setForm((current) => ({ ...current, featuredImageUrl }))}
        />
        <Input
          label="Keywords"
          value={form.keywords}
          onChange={(keywords) => setForm((current) => ({ ...current, keywords }))}
          placeholder="seo, html, conversion"
        />
        <Input
          label="Tags"
          value={form.tags}
          onChange={(tags) => setForm((current) => ({ ...current, tags }))}
          placeholder="automation, content"
        />
        <Input
          label="Category"
          value={form.category}
          onChange={(category) => setForm((current) => ({ ...current, category }))}
          placeholder="Content strategy"
        />
      </div>
      <label className="mt-4 block text-sm font-medium text-text-primary">
        Excerpt
        <textarea
          value={form.excerpt}
          onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
          rows={3}
          className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 text-sm"
        />
      </label>
      <label className="mt-4 block text-sm font-medium text-text-primary">
        Body markdown
        <textarea
          value={form.bodyMarkdown}
          onChange={(event) => setForm((current) => ({ ...current, bodyMarkdown: event.target.value }))}
          rows={8}
          className="mt-1.5 w-full rounded-2xl border border-input-border bg-input-bg px-3 py-2.5 font-mono text-sm"
        />
      </label>
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
