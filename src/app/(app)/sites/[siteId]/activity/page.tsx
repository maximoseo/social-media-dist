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
            <Card key={item.id} className="rounded-[28px] border-border/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{item.message}</p>
                  <p className="mt-2 text-xs text-text-secondary">{formatDateTime(item.created_at)}</p>
                </div>
                <StatusBadge status={item.severity} />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-text-secondary">No activity has been recorded yet.</p>
        )}
      </div>
    </section>
  );
}
