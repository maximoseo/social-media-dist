'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { StatusBadge } from './StatusBadge';
import type { CalendarEntry } from '@/lib/social/types';
import { formatDateTime } from '@/lib/utils';

async function fetchCalendarEntries(siteId: string) {
  const response = await fetch(`/api/sites/${siteId}/calendar`);
  if (!response.ok) {
    throw new Error('Failed to load calendar entries.');
  }

  return (await response.json()) as { entries: CalendarEntry[] };
}

export function ContentCalendar({ siteId }: { siteId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['calendar', siteId],
    queryFn: () => fetchCalendarEntries(siteId),
  });

  if (isLoading) {
    return <div className="section-shell text-sm text-text-secondary">Loading calendar…</div>;
  }

  const entries = data?.entries ?? [];
  if (!entries.length) {
    return (
      <div className="section-shell">
        <EmptyState
          icon={<CalendarDays className="h-12 w-12 text-text-muted" />}
          title="No scheduled entries yet"
          description="Generate a draft, add it to the calendar, then sync or publish through Publer."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="section-shell overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          events={entries.map((entry) => ({
            id: entry.id,
            title: entry.title,
            start: entry.scheduled_for,
            extendedProps: entry,
            classNames: ['rounded-xl'],
          }))}
        />
      </div>
      <div className="section-shell">
        <p className="eyebrow">Queue detail</p>
        <div className="mt-5 space-y-3">
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border/70 bg-surface-raised/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="mt-1 text-xs text-text-secondary">{formatDateTime(entry.scheduled_for)}</p>
                </div>
                <StatusBadge status={entry.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
