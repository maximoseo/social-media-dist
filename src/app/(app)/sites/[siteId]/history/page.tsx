import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { PublishSelectionButton, SyncGoogleSheetsButton } from '@/components/social/DraftActions';
import { StatusBadge } from '@/components/social/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { requireSiteBundle } from '@/lib/social/guards';
import { listPublishHistory } from '@/lib/social/repository';

export default async function SiteHistoryPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const history = await listPublishHistory(params.siteId);

  if (!bundle) {
    notFound();
  }

  return (
    <section className="section-shell">
      <div>
        <p className="eyebrow">Publishing history</p>
        <h1 className="mt-2 text-3xl font-semibold">Publer jobs and outcomes</h1>
      </div>
      <div className="mt-6 space-y-3">
        {history.length ? (
          history.map((job) => (
            <Card key={job.id} className="rounded-3xl border-border/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{job.action.replace('_', ' ')}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    Created {formatDateTime(job.created_at)}{job.external_job_id ? ` · Job ${job.external_job_id}` : ''}
                  </p>
                  {job.last_error && <p className="mt-3 text-sm text-destructive">{job.last_error}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <SyncGoogleSheetsButton siteId={params.siteId} entryIds={[job.calendar_entry_id]} />
                    {job.status === 'failed' && (
                      <PublishSelectionButton
                        siteId={params.siteId}
                        entryIds={[job.calendar_entry_id]}
                        mode={job.action}
                      />
                    )}
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-text-secondary">No publish jobs yet.</p>
        )}
      </div>
    </section>
  );
}
