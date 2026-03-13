import Link from 'next/link';
import { notFound } from 'next/navigation';
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
    <div className="flex flex-col gap-6">
      <ManualArticleImportForm siteId={params.siteId} />

      <section className="section-shell">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Imported articles</p>
            <h2 className="mt-2 text-2xl font-semibold">{bundle.site.name} article queue</h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {articles.length ? (
            articles.map((article) => (
              <Link key={article.id} href={`/sites/${params.siteId}/articles/${article.id}`} className="block">
                <Card className="rounded-3xl border-border/70 transition-colors hover:border-accent/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{article.title}</p>
                      <p className="mt-2 text-sm text-text-secondary">{article.excerpt ?? 'No excerpt available.'}</p>
                      <p className="mt-3 text-xs text-text-muted">{formatRelative(article.created_at)}</p>
                    </div>
                    <StatusBadge status={article.status} />
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-text-secondary">No articles imported yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
