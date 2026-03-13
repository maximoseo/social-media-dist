import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { draftGenerationSchema } from '@/lib/social/schemas';
import { assertRateLimit } from '@/lib/social/rate-limit';
import { generateDraftsForArticle } from '@/lib/social/pipeline';

export async function POST(
  request: Request,
  { params }: { params: { siteId: string; articleId: string } },
) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    assertRateLimit(`draft:${user.id}:${params.siteId}`, 10, 60_000);
    const payload = draftGenerationSchema.parse(await request.json());
    const draft = await generateDraftsForArticle({
      siteId: params.siteId,
      articleId: params.articleId,
      actorUserId: user.id,
      variationCount: payload.variationCount,
      platforms: payload.platforms,
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Draft generation failed.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
