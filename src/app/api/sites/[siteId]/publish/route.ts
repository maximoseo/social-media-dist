import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { bulkPublishSchema } from '@/lib/social/schemas';
import { assertRateLimit } from '@/lib/social/rate-limit';
import { publishCalendarEntries } from '@/lib/social/pipeline';

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    assertRateLimit(`publish:${user.id}:${params.siteId}`, 6, 60_000);
    const payload = bulkPublishSchema.parse(await request.json());
    await publishCalendarEntries({
      siteId: params.siteId,
      entryIds: payload.entryIds,
      mode: payload.mode,
      actorUserId: user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publishing failed.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
