import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { Card } from '@/components/ui';
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

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard label="Workspaces" value={workspaces.length} helper="Brands and sites under active management." />
        <MetricCard label="Imported articles" value={totalArticles} helper="Article payloads stored and ready for distribution." />
        <MetricCard label="Scheduled posts" value={totalScheduled} helper="Items currently queued on the calendar or Publer." />
        <MetricCard label="Published" value={totalPublished} helper="Posts already pushed through the publishing pipeline." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CreateWorkspaceForm />

        <Card className="rounded-3xl border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface)),hsl(var(--surface-raised)))]">
          <p className="eyebrow">Workspace policy</p>
          <h2 className="mt-2 text-2xl font-semibold">What each site controls</h2>
          <div className="mt-6 grid gap-3 text-sm text-text-secondary">
            {[
              'Brand voice, CTA defaults, and image prompt rules.',
              'Target platforms, Publer account mappings, and approval requirements.',
              'n8n webhook intake, Google Sheets sync, and scheduling preferences.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-surface-raised/60 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Workspace directory</p>
            <h2 className="mt-2 text-2xl font-semibold">Select a site workspace</h2>
          </div>
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
                <Card className="h-full rounded-3xl border-border/70 transition-transform hover:-translate-y-0.5 hover:border-accent/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{workspace.site.name}</p>
                      <p className="mt-1 text-sm text-text-secondary">{workspace.site.domain}</p>
                    </div>
                    <StatusBadge status={workspace.site.status} />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Articles</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.articleCount}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Scheduled</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.scheduledCount}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Published</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.publishedCount}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-raised/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Failed jobs</p>
                      <p className="mt-2 text-2xl font-semibold">{workspace.failedJobs}</p>
                    </div>
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
