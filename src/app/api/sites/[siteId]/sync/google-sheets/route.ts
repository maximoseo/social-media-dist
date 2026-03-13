import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { syncEntrySchema } from '@/lib/social/schemas';
import { syncEntriesToGoogleSheets } from '@/lib/social/pipeline';

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    const payload = syncEntrySchema.parse(await request.json());
    await syncEntriesToGoogleSheets({
      siteId: params.siteId,
      entryIds: payload.entryIds,
      actorUserId: user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Sheets sync failed.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
