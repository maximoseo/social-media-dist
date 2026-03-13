import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import {
  GenerateAssetButton,
  GenerateDraftsButton,
  ScheduleVariantForm,
} from '@/components/social/DraftActions';
import { DraftReviewControls, VariantEditor } from '@/components/social/DraftReviewPanel';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { getArticleDetail, getSiteBundle } from '@/lib/social/repository';

export default async function ArticleDetailPage({
  params,
}: {
  params: { siteId: string; articleId: string };
}) {
  const [detail, bundle] = await Promise.all([
    getArticleDetail(params.siteId, params.articleId),
    getSiteBundle(params.siteId),
  ]);

  if (!detail || !bundle) {
    notFound();
  }

  const defaultSocialAccountId = bundle.socialAccounts[0]?.id ?? null;

  return (
    <div className="flex flex-col gap-6">
      <section className="section-shell">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="eyebrow">Article detail</p>
            <h1 className="mt-2 text-3xl font-semibold">{detail.article.title}</h1>
            <p className="mt-4 text-sm text-text-secondary">{detail.article.excerpt ?? 'No excerpt stored.'}</p>
          </div>
          <GenerateDraftsButton siteId={params.siteId} articleId={params.articleId} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">URL</p>
            <p className="mt-2 text-sm text-text-primary">{detail.article.url}</p>
          </div>
          <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Category</p>
            <p className="mt-2 text-sm text-text-primary">{detail.article.category ?? 'Uncategorized'}</p>
          </div>
          <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Keywords</p>
            <p className="mt-2 text-sm text-text-primary">{detail.article.keywords.join(', ') || 'None'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {detail.drafts.length ? (
          detail.drafts.map((draft) => (
            <Card key={draft.id} className="rounded-3xl border-border/70">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Draft bundle</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {draft.generation_provider} · {draft.generation_model}
                  </h2>
                </div>
                <StatusBadge status={draft.approval_status} />
              </div>
              <div className="mt-4">
                <DraftReviewControls siteId={params.siteId} draft={draft} />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {draft.variants.map((variant) => (
                  <div key={variant.id} className="rounded-3xl border border-border/70 bg-surface-raised/60 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize">{variant.platform.replace(/_/g, ' ')}</p>
                        <p className="mt-1 text-xs text-text-secondary">{variant.hook ?? 'No hook supplied'}</p>
                      </div>
                      <StatusBadge status={variant.status} />
                    </div>
                    <VariantEditor siteId={params.siteId} variant={variant} />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <GenerateAssetButton siteId={params.siteId} draftId={draft.id} variantId={variant.id} />
                    </div>
                    <ScheduleVariantForm
                      siteId={params.siteId}
                      draftId={draft.id}
                      variantId={variant.id}
                      platform={variant.platform}
                      timezone={bundle.settings?.timezone ?? bundle.site.timezone}
                      socialAccountId={defaultSocialAccountId}
                    />
                  </div>
                ))}
              </div>

              {!!draft.assets.length && (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {draft.assets.map((asset) => (
                    <div key={asset.id} className="rounded-2xl border border-border/70 bg-surface p-3">
                      {asset.public_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.public_url} alt="Generated asset" className="h-48 w-full rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-2xl bg-surface-raised text-sm text-text-secondary">
                          Asset pending
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <StatusBadge status={asset.status} />
                        <span className="text-xs text-text-secondary">{formatDateTime(asset.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="rounded-3xl border-border/70">
            <p className="text-sm text-text-secondary">
              No drafts yet. Generate platform variants for this article to start the workflow.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
