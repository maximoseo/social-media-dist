import { notFound } from 'next/navigation';
import { PublishSelectionButton, SyncGoogleSheetsButton } from '@/components/social/DraftActions';
import { ContentCalendar } from '@/components/social/ContentCalendar';
import { requireSiteBundle } from '@/lib/social/guards';
import { listCalendarEntries } from '@/lib/social/repository';

export default async function SiteCalendarPage({ params }: { params: { siteId: string } }) {
  const bundle = await requireSiteBundle(params.siteId);
  const entries = await listCalendarEntries(params.siteId);

  if (!bundle) {
    notFound();
  }

  const scheduledEntryIds = entries.filter((entry) => entry.status === 'scheduled').map((entry) => entry.id);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="section-header">
            <div>
              <p className="eyebrow">Long-range content calendar</p>
              <h1 className="section-title mt-3">{bundle.site.name} publishing calendar</h1>
              <p className="section-copy mt-3">
                Plan monthly and weekly schedules, then sync selected items to Publer or publish
                immediately without losing visibility into queue state.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="toolbar-chip">{scheduledEntryIds.length} scheduled entries ready</div>
              <SyncGoogleSheetsButton siteId={params.siteId} entryIds={scheduledEntryIds} />
              <PublishSelectionButton siteId={params.siteId} entryIds={scheduledEntryIds} mode="schedule" />
              <PublishSelectionButton siteId={params.siteId} entryIds={scheduledEntryIds} mode="publish_now" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Use month view for campaign planning and week view to inspect publish density.',
              'Only scheduled entries are passed into Publer and Google Sheets actions from this screen.',
              'History and activity pages keep the downstream publish results observable.',
            ].map((item) => (
              <div key={item} className="data-card text-sm leading-6 text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContentCalendar siteId={params.siteId} />
    </div>
  );
}
