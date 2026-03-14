import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { requireSiteBundle } from '@/lib/social/guards';
import { listActivity } from '@/lib/social/repository';

export default async function SiteActivityPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const activity = await listActivity(params.siteId);

  if (!bundle) {
    notFound();
  }

  return (
    <section className="section-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Activity log</p>
          <h1 className="section-title mt-3">{bundle.site.name} operational log</h1>
          <p className="section-copy mt-3">
            Review application-side events tied to article intake, draft updates, publish activity,
            sync status, and retries for this workspace.
          </p>
        </div>
        <div className="toolbar-chip">{activity.length} recorded events</div>
      </div>
      <div className="mt-6 space-y-3">
        {activity.length ? (
          activity.map((item) => (
            <Card key={item.id} className="rounded-2xl border-border/70">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  item.severity === 'error' ? 'bg-destructive' :
                  item.severity === 'warning' ? 'bg-warning' :
                  'bg-info'
                }`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{item.message}</p>
                      <p className="mt-2 text-xs text-text-secondary">{formatDateTime(item.created_at)}</p>
                    </div>
                    <StatusBadge status={item.severity} />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface-overlay/60 px-5 py-16 text-center">
            <p className="text-lg font-semibold tracking-tight text-text-primary">No activity recorded yet</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Activity will appear here as articles are imported, drafts generated, and content published.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
