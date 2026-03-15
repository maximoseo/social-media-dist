import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MessageSquareText,
  Newspaper,
  Radar,
  Send,
  Settings2,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { MetricCard } from '@/components/social/MetricCard';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatDateTime, formatRelative } from '@/lib/utils';
import { requireSiteBundle } from '@/lib/social/guards';
import { getSiteOverview } from '@/lib/social/repository';

export default async function SiteOverviewPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const overview = await getSiteOverview(params.siteId);

  if (!bundle || !overview) {
    notFound();
  }

  const metrics = overview.metrics;

  /* ── Workflow step calculation ──────────────────────── */
  const steps = [
    {
      number: 1,
      label: 'Import articles',
      description: 'Add editorial content via webhook or manual import',
      count: metrics.totalArticles,
      countLabel: 'articles',
      href: `/sites/${bundle.site.id}/articles`,
      icon: Newspaper,
      done: metrics.totalArticles > 0,
    },
    {
      number: 2,
      label: 'Generate drafts',
      description: 'Create AI-powered social variants per platform',
      count: metrics.readyDrafts,
      countLabel: 'approved drafts',
      href: `/sites/${bundle.site.id}/articles`,
      icon: MessageSquareText,
      done: metrics.readyDrafts > 0,
    },
    {
      number: 3,
      label: 'Schedule posts',
      description: 'Pick dates and add variants to the publishing calendar',
      count: metrics.scheduledPosts,
      countLabel: 'scheduled',
      href: `/sites/${bundle.site.id}/calendar`,
      icon: CalendarDays,
      done: metrics.scheduledPosts > 0,
    },
    {
      number: 4,
      label: 'Publish',
      description: 'Push to Publer and monitor delivery across channels',
      count: metrics.publishedPosts,
      countLabel: 'published',
      href: `/sites/${bundle.site.id}/history`,
      icon: Send,
      done: metrics.publishedPosts > 0,
    },
  ];

  // Determine current step (first incomplete step)
  const currentStepIndex = steps.findIndex((step) => !step.done);
  const activeStep = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <div className="page-stack">
      {/* ── Site header ────────────────────────────────── */}
      <section>
        <Card padding="none" className="rounded-2xl border-border/70">
          <div className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-accent/8 blur-3xl" />
            <div className="relative">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <p className="eyebrow">Site workspace</p>
                    <StatusBadge status={bundle.site.status} />
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.85rem]">
                    {bundle.site.name}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">{bundle.site.domain}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                    {bundle.site.brand_voice ?? 'Define the site voice inside settings to improve generation quality.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/sites/${bundle.site.id}/articles`}>
                    <Button size="lg" icon={<Newspaper className="h-4 w-4" />}>Open articles</Button>
                  </Link>
                  <Link href={`/sites/${bundle.site.id}/calendar`}>
                    <Button variant="secondary" icon={<CalendarDays className="h-4 w-4" />}>Calendar</Button>
                  </Link>
                  <Link href={`/sites/${bundle.site.id}/settings`}>
                    <Button variant="ghost" icon={<Settings2 className="h-4 w-4" />}>Settings</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Workflow stepper ──────────────────────────── */}
      <section>
        <Card padding="none" className="rounded-2xl border-border/70 overflow-hidden">
          <div className="px-6 py-5 sm:px-8 border-b border-border/50">
            <p className="eyebrow">Publishing pipeline</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              How it works — 4 steps from article to published post
            </h3>
            <p className="mt-1.5 text-sm text-text-secondary">
              Follow this workflow to turn imported articles into scheduled social posts across all your platforms.
            </p>
          </div>
          <div className="grid gap-0 md:grid-cols-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              const isFuture = index > activeStep;

              return (
                <Link
                  key={step.number}
                  href={step.href}
                  className={`group relative flex flex-col gap-3 px-6 py-5 transition-all border-b md:border-b-0 md:border-r border-border/50 last:border-r-0 last:border-b-0 hover:bg-surface-raised/50 ${
                    isActive ? 'bg-accent/[0.06]' : ''
                  }`}
                >
                  {/* Step indicator bar on top for active */}
                  {isActive && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-accent" />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                        isPast
                          ? 'border-success/25 bg-success/10 text-success'
                          : isActive
                            ? 'border-accent/30 bg-accent/15 text-accent shadow-[0_0_12px_-4px_hsl(var(--accent-glow)/0.4)]'
                            : 'border-border/70 bg-surface-raised/70 text-text-muted'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        isActive ? 'text-accent' : isPast ? 'text-text-primary' : 'text-text-muted'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {isActive && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        Current
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-5 ${isFuture ? 'text-text-muted/70' : 'text-text-secondary'}`}>
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-lg font-semibold ${
                      isActive ? 'text-accent' : isPast ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {step.count}
                      <span className="ml-1.5 text-xs font-normal text-text-muted">{step.countLabel}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-accent' : 'text-text-muted/50'
                    }`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Key metrics ──────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Articles" value={metrics.totalArticles} helper="Imported and ready for drafting." icon={<Newspaper className="h-5 w-5" />} tone="info" />
        <MetricCard label="Approved drafts" value={metrics.readyDrafts} helper="Ready to add to the calendar." icon={<MessageSquareText className="h-5 w-5" />} tone="accent" />
        <MetricCard label="Scheduled" value={metrics.scheduledPosts} helper="Queued and waiting to publish." icon={<CalendarDays className="h-5 w-5" />} tone="warning" />
        <MetricCard label="Published" value={metrics.publishedPosts} helper="Successfully pushed live." icon={<Send className="h-5 w-5" />} tone="success" />
        <MetricCard label="Failed jobs" value={metrics.failedJobs} helper="Check history to retry." icon={<Radar className="h-5 w-5" />} tone="neutral" />
      </section>

      {/* ── Next action callout ──────────────────────── */}
      {activeStep < steps.length && (
        <section>
          <Card className="rounded-2xl border-accent/20 bg-accent/[0.04]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent shrink-0">
                  {(() => {
                    const NextIcon = steps[activeStep].icon;
                    return <NextIcon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Next step: {steps[activeStep].label}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {steps[activeStep].description}. Click to continue the workflow.
                  </p>
                </div>
              </div>
              <Link href={steps[activeStep].href}>
                <Button icon={<ArrowRight className="h-4 w-4" />}>
                  Go to {steps[activeStep].label.toLowerCase()}
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* ── Configuration snapshot ────────────────────── */}
      <section>
        <Card className="rounded-2xl border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Configuration</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">Current operational rules</h3>
              <p className="mt-1 text-xs text-text-muted">These settings control how drafts are generated and posts are published.</p>
            </div>
            <Link href={`/sites/${bundle.site.id}/settings`}>
              <Button variant="ghost" size="sm" icon={<Settings2 className="h-3.5 w-3.5" />}>Edit</Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            {[
              { label: 'Platforms', value: (bundle.settings?.target_platforms ?? []).map((item: string) => item.replace(/_/g, ' ')).join(', ') || 'Not configured' },
              { label: 'Timezone', value: bundle.settings?.timezone ?? bundle.site.timezone },
              { label: 'Approval required', value: bundle.settings?.approval_required ? 'Yes — drafts need manual review' : 'No — auto-approved' },
              { label: 'Hashtags', value: (bundle.settings?.default_hashtags ?? []).join(', ') || 'None configured' },
            ].map((item) => (
              <div key={item.label} className="data-card">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-text-primary capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── Schedule + Activity ───────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Upcoming schedule</p>
              <h3 className="mt-2 text-lg font-semibold">Next queued items</h3>
              <p className="mt-1 text-xs text-text-muted">Posts scheduled and waiting to be published.</p>
            </div>
            <Link href={`/sites/${bundle.site.id}/calendar`} className="text-sm font-medium text-accent hover:underline">
              Open calendar
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.upcoming.length ? (
              overview.upcoming.map((entry) => (
                <div key={entry.id} className="list-card hover:border-accent/25 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                        {formatDateTime(entry.scheduled_for)}
                      </p>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface-raised/30 px-4 py-6 text-center">
                <p className="text-sm text-text-muted">Nothing scheduled yet.</p>
                <p className="mt-1 text-xs text-text-muted/70">Schedule approved drafts from the article detail page.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3 className="mt-2 text-lg font-semibold">Operational log</h3>
              <p className="mt-1 text-xs text-text-muted">Latest events from imports, drafts, and publishing.</p>
            </div>
            <Link href={`/sites/${bundle.site.id}/activity`} className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.recentActivity.length ? (
              overview.recentActivity.map((activity) => (
                <div key={activity.id} className="list-card">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      activity.severity === 'error' ? 'bg-destructive' :
                      activity.severity === 'warning' ? 'bg-warning' :
                      'bg-success'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">{activity.message}</p>
                          <p className="mt-1 text-xs text-text-secondary">{formatRelative(activity.created_at)}</p>
                        </div>
                        <StatusBadge status={activity.severity} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface-raised/30 px-4 py-6 text-center">
                <p className="text-sm text-text-muted">No activity recorded yet.</p>
                <p className="mt-1 text-xs text-text-muted/70">Events will appear here as you use the pipeline.</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* ── Articles + Jobs ──────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Imported articles</p>
              <h3 className="mt-2 text-lg font-semibold">Newest content</h3>
              <p className="mt-1 text-xs text-text-muted">Recently imported articles ready for draft generation.</p>
            </div>
            <Link href={`/sites/${bundle.site.id}/articles`} className="text-sm font-medium text-accent hover:underline">
              Browse all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.recentArticles.length ? (
              overview.recentArticles.map((article) => (
                <Link key={article.id} href={`/sites/${bundle.site.id}/articles/${article.id}`} className="block">
                  <div className="list-card transition-colors hover:border-accent/40">
                    <p className="text-sm font-semibold">{article.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{formatRelative(article.created_at)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface-raised/30 px-4 py-6 text-center">
                <p className="text-sm text-text-muted">No articles imported yet.</p>
                <p className="mt-1 text-xs text-text-muted/70">Import your first article to begin the pipeline.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Publishing history</p>
              <h3 className="mt-2 text-lg font-semibold">Recent Publer jobs</h3>
              <p className="mt-1 text-xs text-text-muted">Status of recent publish and schedule operations.</p>
            </div>
            <Link href={`/sites/${bundle.site.id}/history`} className="text-sm font-medium text-accent hover:underline">
              View history
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.recentJobs.length ? (
              overview.recentJobs.map((job) => (
                <div key={job.id} className="list-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold capitalize">{job.action.replace('_', ' ')}</p>
                      <p className="mt-1 text-xs text-text-secondary">{formatRelative(job.created_at)}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface-raised/30 px-4 py-6 text-center">
                <p className="text-sm text-text-muted">No publish jobs yet.</p>
                <p className="mt-1 text-xs text-text-muted/70">Schedule and publish posts from the calendar page.</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
