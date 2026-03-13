import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { variantUpdateSchema } from '@/lib/social/schemas';
import { updateVariant } from '@/lib/social/repository';

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string; variantId: string } },
) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    const payload = variantUpdateSchema.parse(await request.json());
    const variant = await updateVariant({
      variantId: params.variantId,
      siteId: params.siteId,
      actorUserId: user.id,
      body: payload.body,
      hook: payload.hook ?? null,
      cta: payload.cta ?? null,
      hashtags: payload.hashtags,
    });
    return NextResponse.json({ variant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update post variant.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
