'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, UploadCloud, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

const importHighlights = [
  {
    title: 'Structured metadata',
    copy: 'Title, slug, tags, and content body are stored immediately.',
    icon: FileText,
  },
  {
    title: 'Same generation path',
    copy: 'Imported articles can go through the same draft and image pipeline.',
    icon: WandSparkles,
  },
  {
    title: 'No hidden shortcuts',
    copy: 'This uses the same site-aware API path as automated ingestion.',
    icon: UploadCloud,
  },
] as const;

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
    <form onSubmit={handleSubmit} className="page-hero">
      <div className="page-hero-inner">
        <div className="section-header">
          <div className="max-w-2xl">
            <p className="eyebrow">Manual import</p>
            <h3 className="section-subtitle mt-3">Receive an article without waiting for n8n</h3>
            <p className="section-copy mt-3">
              Use this when editorial or SEO teams need to push a single article directly into the
              workspace, keeping the same metadata and downstream draft workflow as webhook imports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="toolbar-chip">
              <UploadCloud className="h-4 w-4 text-accent" />
              Manual intake
            </div>
            <Button loading={loading} size="lg">
              Import article
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {importHighlights.map((item) => {
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

        <div className="grid gap-4 md:grid-cols-2">
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

        <label className="field-group">
          <span className="field-label">Excerpt</span>
          <textarea
            value={form.excerpt}
            onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
            rows={3}
            className="field-textarea min-h-[120px]"
          />
        </label>
        <label className="field-group">
          <span className="field-label">Body markdown</span>
          <textarea
            value={form.bodyMarkdown}
            onChange={(event) => setForm((current) => ({ ...current, bodyMarkdown: event.target.value }))}
            rows={8}
            className="field-textarea min-h-[240px] font-mono"
          />
        </label>
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
