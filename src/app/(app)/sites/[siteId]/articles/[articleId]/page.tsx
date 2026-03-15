import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, ImagePlus, Link2, ListChecks, MessageSquareText, Newspaper, Send, Tags } from 'lucide-react';
import { Card, Button } from '@/components/ui';
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
  const hasDrafts = detail.drafts.length > 0;
  const hasApproved = detail.drafts.some((draft) => draft.approval_status === 'approved');
  const hasScheduled = detail.drafts.some((draft) =>
    draft.variants.some((variant) => variant.status === 'scheduled')
  );

  /* ── Article pipeline steps ─────────────────── */
  const articleSteps = [
    { label: 'Imported', done: true, icon: Newspaper },
    { label: 'Drafts generated', done: hasDrafts, icon: MessageSquareText },
    { label: 'Approved', done: hasApproved, icon: CheckCircle2 },
    { label: 'Scheduled', done: hasScheduled, icon: CalendarDays },
  ];

  return (
    <div className="page-stack">
      {/* ── Article header ─────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="section-header">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <p className="eyebrow">Article detail</p>
                <Link href={`/sites/${params.siteId}/articles`} className="text-xs text-accent hover:underline">
                  Back to all articles
                </Link>
              </div>
              <h1 className="section-title mt-3">{detail.article.title}</h1>
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                {detail.article.excerpt ?? 'No excerpt stored.'}
              </p>
            </div>
            <GenerateDraftsButton siteId={params.siteId} articleId={params.articleId} />
          </div>

          {/* ── Article pipeline progress ──────────── */}
          <div className="rounded-xl border border-border/50 bg-surface-overlay/50 px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Article progress</p>
              <p className="text-xs text-text-muted">
                {articleSteps.filter((step) => step.done).length} of {articleSteps.length} steps complete
              </p>
            </div>
            <div className="flex items-center gap-1">
              {articleSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-1 flex-1">
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 flex-1 ${
                      step.done
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-surface-raised/50 border border-border/50'
                    }`}>
                      <StepIcon className={`h-3.5 w-3.5 shrink-0 ${step.done ? 'text-success' : 'text-text-muted/60'}`} />
                      <span className={`text-xs font-medium ${step.done ? 'text-success' : 'text-text-muted/70'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < articleSteps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-text-muted/30 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Article metadata ───────────────────── */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="data-card">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">URL</p>
              <div className="mt-3 flex items-start gap-3">
                <Link2 className="mt-0.5 h-4 w-4 text-accent shrink-0" />
                <p className="text-sm leading-6 text-text-primary break-all">{detail.article.url}</p>
              </div>
            </div>
            <div className="data-card">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Category</p>
              <div className="mt-3 flex items-center gap-3">
                <ListChecks className="h-4 w-4 text-accent" />
                <p className="text-sm text-text-primary">{detail.article.category ?? 'Uncategorized'}</p>
              </div>
            </div>
            <div className="data-card">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Keywords</p>
              <div className="mt-3 flex items-start gap-3">
                <Tags className="mt-0.5 h-4 w-4 text-accent shrink-0" />
                <p className="text-sm leading-6 text-text-primary">{detail.article.keywords.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Next action callout ────────────────────── */}
      {!hasDrafts && (
        <section>
          <Card className="rounded-2xl border-accent/20 bg-accent/[0.04]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent shrink-0">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Next step: Generate social drafts
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Click &quot;Generate drafts&quot; above to create AI-powered social media variants for each of your target platforms.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {hasApproved && !hasScheduled && (
        <section>
          <Card className="rounded-2xl border-accent/20 bg-accent/[0.04]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent shrink-0">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Next step: Schedule your approved drafts
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Your drafts are approved. Use the scheduling forms below each variant to pick a date and add them to the calendar.
                  </p>
                </div>
              </div>
              <Link href={`/sites/${params.siteId}/calendar`}>
                <Button variant="secondary" icon={<CalendarDays className="h-4 w-4" />}>
                  Open calendar
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* ── Drafts ─────────────────────────────────── */}
      <section className="space-y-4">
        {detail.drafts.length ? (
          detail.drafts.map((draft) => (
            <Card key={draft.id} className="rounded-2xl border-border/70">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Draft bundle</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    {draft.generation_provider} · {draft.generation_model}
                  </h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {draft.approval_status === 'approved'
                      ? 'Approved — ready to schedule individual variants below.'
                      : draft.approval_status === 'rejected'
                        ? 'Rejected — you can generate new drafts.'
                        : 'Review the variants below, then approve or reject this bundle.'}
                  </p>
                </div>
                <StatusBadge status={draft.approval_status} />
              </div>
              <div className="mt-4">
                <DraftReviewControls siteId={params.siteId} draft={draft} />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {draft.variants.map((variant) => (
                  <div key={variant.id} className="rounded-2xl border border-border/70 bg-surface-raised/60 p-5">
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
                      <div className="toolbar-chip">
                        <ImagePlus className="h-4 w-4 text-accent" />
                        Asset workflow
                      </div>
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
                    <div key={asset.id} className="rounded-xl border border-border/70 bg-surface p-3">
                      {asset.public_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.public_url} alt="Generated asset" className="h-56 w-full rounded-[20px] object-cover" />
                      ) : (
                        <div className="flex h-56 items-center justify-center rounded-[20px] bg-surface-raised text-sm text-text-secondary">
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
          <Card className="rounded-2xl border-border/70">
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-surface-raised/80 mb-4">
                <MessageSquareText className="h-6 w-6 text-text-muted" />
              </div>
              <p className="text-base font-semibold text-text-primary">No drafts generated yet</p>
              <p className="mt-2 max-w-sm text-sm text-text-secondary">
                Click &quot;Generate drafts&quot; at the top of this page to create platform-specific social media variants from this article.
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
