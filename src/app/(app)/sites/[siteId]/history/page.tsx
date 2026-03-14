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
      <div className="section-header">
        <div>
          <p className="eyebrow">Publishing history</p>
          <h1 className="section-title mt-3">Publer jobs and outcomes</h1>
          <p className="section-copy mt-3">
            See what has already been sent to Publer, which jobs failed, and which entries need to
            be synced again or retried.
          </p>
        </div>
        <div className="toolbar-chip">{history.length} jobs logged</div>
      </div>
      <div className="mt-6 space-y-3">
        {history.length ? (
          history.map((job) => (
            <Card key={job.id} className="rounded-2xl border-border/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{job.action.replace('_', ' ')}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    Created {formatDateTime(job.created_at)}{job.external_job_id ? ` · Job ${job.external_job_id}` : ''}
                  </p>
                  {job.last_error && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-destructive hover:text-destructive/80">
                        View error details
                      </summary>
                      <p className="mt-2 rounded-2xl border border-destructive/15 bg-destructive/[0.06] px-3 py-2 text-sm text-destructive">{job.last_error}</p>
                    </details>
                  )}
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface-overlay/60 px-5 py-16 text-center">
            <p className="text-lg font-semibold tracking-tight text-text-primary">No publish jobs yet</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Schedule content from the calendar page and publish through Publer to see results here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
