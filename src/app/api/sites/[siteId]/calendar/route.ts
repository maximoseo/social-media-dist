import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { calendarEntrySchema } from '@/lib/social/schemas';
import { listCalendarEntries } from '@/lib/social/repository';
import { scheduleVariantOnCalendar } from '@/lib/social/pipeline';

export async function GET(_request: Request, { params }: { params: { siteId: string } }) {
  try {
    await assertUserCanAccessSite(params.siteId);
    const entries = await listCalendarEntries(params.siteId);
    return NextResponse.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load calendar.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    const payload = calendarEntrySchema.parse(await request.json());
    const entry = await scheduleVariantOnCalendar({
      siteId: params.siteId,
      draftId: payload.draftId,
      variantId: payload.variantId,
      platform: payload.platform,
      socialAccountId: payload.socialAccountId ?? null,
      scheduledFor: payload.scheduledFor,
      timezone: payload.timezone,
      actorUserId: user.id,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule calendar entry.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
