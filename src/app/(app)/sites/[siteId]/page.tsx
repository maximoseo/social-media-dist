import Link from 'next/link';
import { notFound } from 'next/navigation';
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

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface)),hsl(var(--surface-raised)))]">
          <p className="eyebrow">Site cockpit</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">{bundle.site.name}</h2>
              <p className="mt-2 text-sm text-text-secondary">{bundle.site.domain}</p>
              <p className="mt-4 max-w-2xl text-sm text-text-secondary">
                {bundle.site.brand_voice ?? 'Define the site voice inside settings to improve generation quality.'}
              </p>
            </div>
            <StatusBadge status={bundle.site.status} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/sites/${bundle.site.id}/articles`}>
              <Button>Open articles</Button>
            </Link>
            <Link href={`/sites/${bundle.site.id}/calendar`}>
              <Button variant="secondary">View calendar</Button>
            </Link>
            <Link href={`/sites/${bundle.site.id}/settings`}>
              <Button variant="ghost">Edit settings</Button>
            </Link>
          </div>
        </Card>

        <Card className="rounded-[28px] border-border/70">
          <p className="eyebrow">Current rules</p>
          <div className="mt-5 space-y-3 text-sm text-text-secondary">
            <p>
              Platforms: {(bundle.settings?.target_platforms ?? []).map((item) => item.replace(/_/g, ' ')).join(', ') || 'Not configured'}
            </p>
            <p>Timezone: {bundle.settings?.timezone ?? bundle.site.timezone}</p>
            <p>Approval required: {bundle.settings?.approval_required ? 'Yes' : 'No'}</p>
            <p>Hashtags: {(bundle.settings?.default_hashtags ?? []).join(', ') || 'None configured'}</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Articles" value={overview.metrics.totalArticles} helper="Stored articles available for drafting." />
        <MetricCard label="Approved drafts" value={overview.metrics.readyDrafts} helper="Draft bundles ready for the calendar." />
        <MetricCard label="Scheduled" value={overview.metrics.scheduledPosts} helper="Entries currently queued for publish." />
        <MetricCard label="Published" value={overview.metrics.publishedPosts} helper="Calendar items already pushed live." />
        <MetricCard label="Failed jobs" value={overview.metrics.failedJobs} helper="Retry queue will capture these automatically." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-3xl border-border/70">
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
                <div key={entry.id} className="rounded-2xl border border-border/70 bg-surface-raised/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">{formatDateTime(entry.scheduled_for)}</p>
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

        <Card className="rounded-3xl border-border/70">
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
                <div key={activity.id} className="rounded-2xl border border-border/70 bg-surface-raised/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{activity.message}</p>
                      <p className="mt-1 text-xs text-text-secondary">{formatRelative(activity.created_at)}</p>
                    </div>
                    <StatusBadge status={activity.severity} />
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
        <Card className="rounded-3xl border-border/70">
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
                  <div className="rounded-2xl border border-border/70 bg-surface-raised/60 p-4 transition-colors hover:border-accent/40">
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

        <Card className="rounded-3xl border-border/70">
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
                <div key={job.id} className="rounded-2xl border border-border/70 bg-surface-raised/60 p-4">
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
