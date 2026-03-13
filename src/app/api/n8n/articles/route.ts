import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { n8nWebhookSchema } from '@/lib/social/schemas';
import { upsertArticle } from '@/lib/social/repository';

export async function POST(request: Request) {
  try {
    const secretHeader =
      request.headers.get('x-webhook-secret') ||
      request.headers.get('x-n8n-secret') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    const sharedSecret = process.env.N8N_WEBHOOK_SHARED_SECRET;
    if (sharedSecret && secretHeader !== sharedSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret.' }, { status: 401 });
    }

    const payload = n8nWebhookSchema.parse(await request.json());
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new Error('Supabase service role is not configured.');
    }

    let siteId = payload.siteId;
    if (!siteId && payload.siteSlug) {
      const { data: site } = await supabase.from('sites').select('id').eq('slug', payload.siteSlug).single();
      siteId = site?.id;
    }

    if (!siteId) {
      return NextResponse.json({ error: 'A valid siteId or siteSlug is required.' }, { status: 400 });
    }

    const article = await upsertArticle(
      siteId,
      payload.article,
      'n8n',
      null,
      payload.idempotencyKey ?? `n8n:${siteId}:${payload.article.slug}`,
    );

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook ingestion failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
