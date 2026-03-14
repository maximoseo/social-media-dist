import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { ManualArticleImportForm } from '@/components/social/ManualArticleImportForm';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatRelative } from '@/lib/utils';
import { requireSiteBundle } from '@/lib/social/guards';
import { listSiteArticles } from '@/lib/social/repository';

export default async function SiteArticlesPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const articles = await listSiteArticles(params.siteId);

  if (!bundle) {
    notFound();
  }

  return (
    <div className="page-stack">
      <ManualArticleImportForm siteId={params.siteId} />

      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Imported articles</p>
            <h2 className="section-subtitle mt-3">{bundle.site.name} article queue</h2>
            <p className="section-copy mt-3">
              Review what has already landed inside this site workspace, then open an article to
              generate variants, edit messaging, create images, and move approved posts onto the calendar.
            </p>
          </div>
          <div className="toolbar-chip">{articles.length} articles in queue</div>
        </div>

        <div className="mt-6 space-y-3">
          {articles.length ? (
            articles.map((article) => (
              <Link key={article.id} href={`/sites/${params.siteId}/articles/${article.id}`} className="block">
                <Card className="rounded-2xl border-border/70 transition-all hover:-translate-y-0.5 hover:border-accent/30">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="toolbar-chip">Article</span>
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
                          {formatRelative(article.created_at)}
                        </span>
                      </div>
                      <p className="mt-4 text-xl font-semibold tracking-tight">{article.title}</p>
                      <p className="mt-3 text-sm leading-6 text-text-secondary">
                        {article.excerpt ?? 'No excerpt available.'}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <StatusBadge status={article.status} />
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                        Open article
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface-overlay/60 px-5 py-16 text-center">
              <p className="text-lg font-semibold tracking-tight text-text-primary">No articles imported yet</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Use the manual import form above or configure n8n webhooks to start receiving articles.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
