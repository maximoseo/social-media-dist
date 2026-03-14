import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  FolderKanban,
  Newspaper,
  Send,
  Sparkles,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { Button, Card } from '@/components/ui';
import { CreateWorkspaceForm } from '@/components/social/CreateWorkspaceForm';
import { MetricCard } from '@/components/social/MetricCard';
import { StatusBadge } from '@/components/social/StatusBadge';
import { requireAuthenticatedUser } from '@/lib/social/guards';
import { listWorkspaceSummaries } from '@/lib/social/repository';

export const metadata = {
  title: 'Dashboard · Social Media Dist',
};

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const workspaces = await listWorkspaceSummaries(user.id);

  const totalArticles = workspaces.reduce((sum, workspace) => sum + workspace.articleCount, 0);
  const totalScheduled = workspaces.reduce((sum, workspace) => sum + workspace.scheduledCount, 0);
  const totalPublished = workspaces.reduce((sum, workspace) => sum + workspace.publishedCount, 0);
  const stableWorkspaces = workspaces.filter((workspace) => workspace.failedJobs === 0).length;
  const leadWorkspace = workspaces[0];

  return (
    <div className="page-stack">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card padding="none" className="rounded-[32px] border-border/70">
          <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-grid opacity-25" />
            <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-warning/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Command center
              </div>
              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-lg text-text-secondary">
                    {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.2rem]">
                    Manage multi-site social distribution from one operational dashboard.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                    Create protected workspaces, receive n8n article payloads, generate AI drafts and
                    image assets, and keep long-range scheduling visible before anything reaches Publer.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#create-workspace">
                    <Button size="lg" icon={<Sparkles className="h-4 w-4" />}>
                      New workspace
                    </Button>
                  </a>
                  {leadWorkspace ? (
                    <Link href={`/sites/${leadWorkspace.site.id}`}>
                      <Button variant="secondary" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                        Open lead site
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {[
                  {
                    label: 'Ready for scheduling',
                    value: `${totalScheduled} queued items`,
                    helper: 'Calendar and Publer pipeline are both tracked server-side.',
                  },
                  {
                    label: 'Reliable workspaces',
                    value: `${stableWorkspaces}/${workspaces.length || 1} stable`,
                    helper: 'No recent failed jobs in these site queues.',
                  },
                  {
                    label: 'Published throughput',
                    value: `${totalPublished} completed`,
                    helper: 'Live publishing results remain linked to each workspace.',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-border/70 bg-surface-overlay/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-text-primary">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px] border-border/70">
          <p className="eyebrow">Ops snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">What this surface is watching</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                title: 'Ingestion coverage',
                copy: 'Every workspace can ingest from n8n webhooks or manual imports without collapsing into shared state.',
              },
              {
                title: 'Draft and asset readiness',
                copy: 'Post variants and KIE-generated images stay attached to their article, platform, and approval state.',
              },
              {
                title: 'Queue visibility',
                copy: 'Scheduling, publish attempts, retries, and sync results remain observable per site instead of hidden inside one provider.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-border/70 bg-surface-raised/65 px-4 py-4">
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{item.copy}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Workspaces"
          value={workspaces.length}
          helper="Brands and sites under active management."
          icon={<FolderKanban className="h-5 w-5" />}
          tone="accent"
        />
        <MetricCard
          label="Imported articles"
          value={totalArticles}
          helper="Article payloads stored and ready for distribution."
          icon={<Newspaper className="h-5 w-5" />}
          tone="info"
        />
        <MetricCard
          label="Scheduled posts"
          value={totalScheduled}
          helper="Items currently queued on the calendar or Publer."
          icon={<CalendarClock className="h-5 w-5" />}
          tone="warning"
        />
        <MetricCard
          label="Published"
          value={totalPublished}
          helper="Posts already pushed through the publishing pipeline."
          icon={<Send className="h-5 w-5" />}
          tone="success"
        />
      </section>

      <section id="create-workspace-section" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CreateWorkspaceForm />

        <Card className="rounded-[30px] border-border/70">
          <p className="eyebrow">Workspace policy</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">What each site controls</h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Each workspace is isolated enough to support different clients, brands, or product lines
            without leaking prompts, calendars, or publishing mappings across teams.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-text-secondary">
            {[
              {
                title: 'Brand system',
                copy: 'Voice, CTA defaults, image prompt rules, and moderation policy.',
              },
              {
                title: 'Channel operations',
                copy: 'Target platforms, Publer account mappings, approval requirements, and retry behavior.',
              },
              {
                title: 'Content logistics',
                copy: 'n8n intake, Google Sheets sync, scheduling preferences, timezone, and campaign defaults.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border/70 bg-surface-raised/60 px-4 py-4"
              >
                <p className="font-semibold text-text-primary">{item.title}</p>
                <p className="mt-2 leading-6">{item.copy}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Workspace directory</p>
            <h2 className="section-subtitle mt-3">Select a site workspace</h2>
            <p className="section-copy mt-3">
              Each workspace stays isolated with its own prompts, approvals, publishing accounts, and history.
            </p>
          </div>
          <div className="toolbar-chip">{workspaces.length} workspace{workspaces.length === 1 ? '' : 's'}</div>
        </div>

        {!workspaces.length ? (
          <EmptyState
            title="No workspaces yet"
            description="Create a workspace to start importing articles and planning a publishing calendar."
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {workspaces.map((workspace) => (
              <Link key={workspace.site.id} href={`/sites/${workspace.site.id}`} className="block">
                <Card className="h-full rounded-[30px] border-border/70 transition-all hover:-translate-y-1 hover:border-accent/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{workspace.site.name}</p>
                      <p className="mt-1 text-sm text-text-muted">{workspace.site.domain}</p>
                    </div>
                    <StatusBadge status={workspace.site.status} />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-border/60 bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Articles</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.articleCount}</p>
                    </div>
                    <div className="rounded-[22px] border border-border/60 bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Scheduled</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.scheduledCount}</p>
                    </div>
                    <div className="rounded-[22px] border border-border/60 bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Published</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.publishedCount}</p>
                    </div>
                    <div className="rounded-[22px] border border-border/60 bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Failed jobs</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.failedJobs}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-[22px] border border-accent/15 bg-accent/[0.08] px-4 py-3 text-sm text-text-secondary">
                    <span>
                      {workspace.failedJobs === 0
                        ? 'Queue healthy and ready for new scheduling'
                        : 'Attention needed in retry queue'}
                    </span>
                    <span className="font-medium text-accent">Open workspace</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
