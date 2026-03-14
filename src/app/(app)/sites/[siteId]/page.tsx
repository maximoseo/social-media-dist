import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, MessageSquareText, Newspaper, Radar, Settings2 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { MetricCard } from '@/components/social/MetricCard';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatDateTime, formatRelative } from '@/lib/utils';
import { requireSiteBundle } from '@/lib/social/guards';
import { getSiteOverview } from '@/lib/social/repository';

const workflowHighlights = [
  {
    title: 'Article pipeline',
    copy: 'Import editorial output, audit metadata, and move ready items into draft generation.',
    icon: Newspaper,
  },
  {
    title: 'Draft review',
    copy: 'Refine hooks, approve or reject bundles, and generate images per platform.',
    icon: MessageSquareText,
  },
  {
    title: 'Publishing queue',
    copy: 'Schedule ahead, push to Publer, and keep failures visible for retry.',
    icon: Radar,
  },
] as const;

export default async function SiteOverviewPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const overview = await getSiteOverview(params.siteId);

  if (!bundle || !overview) {
    notFound();
  }

  return (
    <div className="page-stack">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="page-hero p-0">
          <div className="page-hero-inner">
            <div className="section-header">
              <div className="max-w-3xl">
                <p className="eyebrow">Site cockpit</p>
                <h2 className="section-title mt-3">{bundle.site.name}</h2>
                <p className="mt-2 text-sm text-text-secondary">{bundle.site.domain}</p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
                {bundle.site.brand_voice ?? 'Define the site voice inside settings to improve generation quality.'}
                </p>
              </div>
              <StatusBadge status={bundle.site.status} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/sites/${bundle.site.id}/articles`}>
                <Button icon={<Newspaper className="h-4 w-4" />}>Open articles</Button>
              </Link>
              <Link href={`/sites/${bundle.site.id}/calendar`}>
                <Button variant="secondary" icon={<CalendarDays className="h-4 w-4" />}>View calendar</Button>
              </Link>
              <Link href={`/sites/${bundle.site.id}/settings`}>
                <Button variant="ghost" icon={<Settings2 className="h-4 w-4" />}>Edit settings</Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {workflowHighlights.map((item) => {
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
        </Card>

        <Card className="rounded-[30px] border-border/70">
          <p className="eyebrow">Current rules</p>
          <h3 className="section-subtitle mt-3">Operational configuration snapshot</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
            {[
              { label: 'Platforms', value: (bundle.settings?.target_platforms ?? []).map((item: string) => item.replace(/_/g, ' ')).join(', ') || 'Not configured' },
              { label: 'Timezone', value: bundle.settings?.timezone ?? bundle.site.timezone },
              { label: 'Approval required', value: bundle.settings?.approval_required ? 'Yes' : 'No' },
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

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Articles" value={overview.metrics.totalArticles} helper="Stored articles available for drafting." icon={<Newspaper className="h-5 w-5" />} tone="info" />
        <MetricCard label="Approved drafts" value={overview.metrics.readyDrafts} helper="Draft bundles ready for the calendar." icon={<MessageSquareText className="h-5 w-5" />} tone="accent" />
        <MetricCard label="Scheduled" value={overview.metrics.scheduledPosts} helper="Entries currently queued for publish." icon={<CalendarDays className="h-5 w-5" />} tone="warning" />
        <MetricCard label="Published" value={overview.metrics.publishedPosts} helper="Calendar items already pushed live." icon={<ArrowRight className="h-5 w-5" />} tone="success" />
        <MetricCard label="Failed jobs" value={overview.metrics.failedJobs} helper="Retry queue will capture these automatically." icon={<Radar className="h-5 w-5" />} tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[30px] border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Upcoming schedule</p>
              <h3 className="mt-2 text-xl font-semibold">Next queued items</h3>
            </div>
            <Link href={`/sites/${bundle.site.id}/calendar`} className="text-sm font-medium text-accent">
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
              <p className="text-sm text-text-secondary">Nothing scheduled yet.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-[30px] border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3 className="mt-2 text-xl font-semibold">Operational log</h3>
            </div>
            <Link href={`/sites/${bundle.site.id}/activity`} className="text-sm font-medium text-accent">
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
              <p className="text-sm text-text-secondary">No activity has been recorded yet.</p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[30px] border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Imported articles</p>
              <h3 className="mt-2 text-xl font-semibold">Newest content</h3>
            </div>
            <Link href={`/sites/${bundle.site.id}/articles`} className="text-sm font-medium text-accent">
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
              <p className="text-sm text-text-secondary">No imported articles yet.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-[30px] border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Publishing history</p>
              <h3 className="mt-2 text-xl font-semibold">Recent Publer jobs</h3>
            </div>
            <Link href={`/sites/${bundle.site.id}/history`} className="text-sm font-medium text-accent">
              View history
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.recentJobs.length ? (
              overview.recentJobs.map((job) => (
                <div key={job.id} className="list-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{job.action.replace('_', ' ')}</p>
                      <p className="mt-1 text-xs text-text-secondary">{formatRelative(job.created_at)}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">No publish jobs have been submitted yet.</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
