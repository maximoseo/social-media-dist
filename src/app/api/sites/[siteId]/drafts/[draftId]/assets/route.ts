import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { assetGenerationSchema } from '@/lib/social/schemas';
import { assertRateLimit } from '@/lib/social/rate-limit';
import { generateAssetForDraft } from '@/lib/social/pipeline';

export async function POST(
  request: Request,
  { params }: { params: { siteId: string; draftId: string } },
) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    assertRateLimit(`asset:${user.id}:${params.siteId}`, 12, 60_000);
    const payload = assetGenerationSchema.parse(await request.json());
    const asset = await generateAssetForDraft({
      siteId: params.siteId,
      draftId: params.draftId,
      variantId: payload.variantId ?? null,
      actorUserId: user.id,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Asset generation failed.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
