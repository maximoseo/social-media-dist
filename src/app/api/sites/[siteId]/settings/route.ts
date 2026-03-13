import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { siteSettingsSchema } from '@/lib/social/schemas';
import { updateSiteSettings, logActivity } from '@/lib/social/repository';

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const { user, site } = await assertUserCanAccessSite(params.siteId);
    const payload = siteSettingsSchema.parse(await request.json());
    await updateSiteSettings(params.siteId, payload);
    await logActivity({
      organizationId: site.organization_id,
      siteId: params.siteId,
      actorUserId: user.id,
      eventType: 'settings.updated',
      entityType: 'site',
      entityId: params.siteId,
      severity: 'info',
      message: 'Updated site settings.',
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update site settings.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
