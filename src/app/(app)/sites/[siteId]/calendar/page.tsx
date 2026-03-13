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
    <div className="flex flex-col gap-6">
      <section className="section-shell">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Long-range content calendar</p>
            <h1 className="mt-2 text-3xl font-semibold">{bundle.site.name} publishing calendar</h1>
            <p className="mt-3 text-sm text-text-secondary">
              Plan monthly and weekly schedules, then sync selected items to Publer or publish immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SyncGoogleSheetsButton siteId={params.siteId} entryIds={scheduledEntryIds} />
            <PublishSelectionButton siteId={params.siteId} entryIds={scheduledEntryIds} mode="schedule" />
            <PublishSelectionButton siteId={params.siteId} entryIds={scheduledEntryIds} mode="publish_now" />
          </div>
        </div>
      </section>
      <ContentCalendar siteId={params.siteId} />
    </div>
  );
}
