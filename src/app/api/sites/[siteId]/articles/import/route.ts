import { NextResponse } from 'next/server';
import { assertUserCanAccessSite } from '@/lib/social/guards';
import { manualArticleImportSchema } from '@/lib/social/schemas';
import { upsertArticle } from '@/lib/social/repository';

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const { user } = await assertUserCanAccessSite(params.siteId);
    const payload = manualArticleImportSchema.parse(await request.json());
    const article = await upsertArticle(
      params.siteId,
      payload.article,
      'manual',
      user.id,
      `manual:${params.siteId}:${payload.article.slug}`,
    );

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Manual import failed.';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
