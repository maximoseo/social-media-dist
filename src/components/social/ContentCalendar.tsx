'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock3, Send, Sparkles } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
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
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="section-shell space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[560px] w-full" />
        </div>
        <div className="section-shell space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
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

  const statusCounts = {
    draft: entries.filter((entry) => entry.status === 'draft').length,
    scheduled: entries.filter((entry) => entry.status === 'scheduled').length,
    published: entries.filter((entry) => entry.status === 'published').length,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="section-shell overflow-hidden">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            { label: 'In draft', value: statusCounts.draft, icon: Sparkles },
            { label: 'Scheduled', value: statusCounts.scheduled, icon: Clock3 },
            { label: 'Published', value: statusCounts.published, icon: Send },
          ].map((item) => (
            <div key={item.label} className="data-card">
              <item.icon className="h-4 w-4 text-accent" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>
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
        <h3 className="mt-3 text-xl font-semibold tracking-tight">Nearest scheduled work</h3>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          The next ten entries in the queue, with their current status and exact scheduled timestamp.
        </p>
        <div className="mt-5 space-y-3">
          {entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="list-card">
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
