import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { draftReviewSchema } from '@/lib/social/schemas';
import { reviewDraft } from '@/lib/social/repository';

export async function POST(
  request: Request,
  { params }: { params: { siteId: string; draftId: string } },
) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    const payload = draftReviewSchema.parse(await request.json());
    const draft = await reviewDraft({
      draftId: params.draftId,
      approvalStatus: payload.approvalStatus,
      status: payload.approvalStatus === 'approved' ? 'approved' : payload.approvalStatus === 'rejected' ? 'rejected' : 'generated',
      actorUserId: user.id,
      siteId: params.siteId,
    });
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to review draft.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
