import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Newspaper,
  Plus,
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

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';

  return (
    <div className="page-stack">
      {/* ── Hero ────────────────────────────────────── */}
      <section>
        <Card padding="none" className="rounded-2xl border-border/70">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-accent/8 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-text-secondary">{greeting}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                  Social Distribution Dashboard
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                  Select a workspace below to manage its publishing pipeline, or create a new one to get started.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#create-workspace">
                  <Button size="lg" icon={<Plus className="h-4 w-4" />}>
                    New workspace
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Global metrics ──────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Workspaces"
          value={workspaces.length}
          helper="Active site workspaces in your account."
          icon={<FolderKanban className="h-5 w-5" />}
          tone="accent"
        />
        <MetricCard
          label="Imported articles"
          value={totalArticles}
          helper="Total articles across all workspaces."
          icon={<Newspaper className="h-5 w-5" />}
          tone="info"
        />
        <MetricCard
          label="Scheduled posts"
          value={totalScheduled}
          helper="Posts queued and waiting to publish."
          icon={<CalendarClock className="h-5 w-5" />}
          tone="warning"
        />
        <MetricCard
          label="Published"
          value={totalPublished}
          helper="Posts successfully delivered to channels."
          icon={<Send className="h-5 w-5" />}
          tone="success"
        />
      </section>

      {/* ── Workspace directory ─────────────────────── */}
      <section className="section-shell">
        <div className="section-header">
          <div>
            <p className="eyebrow">Workspace directory</p>
            <h2 className="section-subtitle mt-2">Select a workspace to manage</h2>
            <p className="section-copy mt-2">
              Each workspace has its own content pipeline, approval rules, and publishing accounts. Click a workspace to open it.
            </p>
          </div>
          <div className="toolbar-chip">{workspaces.length} workspace{workspaces.length === 1 ? '' : 's'}</div>
        </div>

        {!workspaces.length ? (
          <EmptyState
            icon={<FolderKanban className="h-8 w-8" />}
            title="No workspaces yet"
            description="Create your first workspace to start importing articles and planning a publishing calendar."
            action={
              <a href="#create-workspace">
                <Button icon={<Sparkles className="h-4 w-4" />}>Create workspace</Button>
              </a>
            }
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {workspaces.map((workspace) => {
              const hasIssues = workspace.failedJobs > 0;
              const isHealthy = !hasIssues && workspace.publishedCount > 0;

              return (
                <Link key={workspace.site.id} href={`/sites/${workspace.site.id}`} className="block group">
                  <Card className="h-full rounded-2xl border-border/70 transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-card-hover">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent shrink-0">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold tracking-tight">{workspace.site.name}</p>
                          <p className="mt-0.5 text-sm text-text-muted">{workspace.site.domain}</p>
                        </div>
                      </div>
                      <StatusBadge status={workspace.site.status} />
                    </div>

                    {/* Stats grid */}
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: 'Articles', value: workspace.articleCount },
                        { label: 'Scheduled', value: workspace.scheduledCount },
                        { label: 'Published', value: workspace.publishedCount },
                        { label: 'Failed', value: workspace.failedJobs },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-border/60 bg-surface-raised/70 px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{stat.label}</p>
                          <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Footer with health + CTA */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-text-secondary">
                        {hasIssues ? (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                            <span className="text-warning font-medium">{workspace.failedJobs} failed — needs attention</span>
                          </>
                        ) : isHealthy ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span>Pipeline healthy</span>
                          </>
                        ) : (
                          <span>Ready to use</span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-all group-hover:bg-accent/20">
                        Open workspace <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Create workspace ────────────────────────── */}
      <section id="create-workspace" className="scroll-mt-24">
        <CreateWorkspaceForm />
      </section>
    </div>
  );
}
