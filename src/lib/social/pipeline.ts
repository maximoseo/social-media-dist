import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { SOCIAL_PLATFORMS } from './constants';
import { generateSocialVariants } from './ai';
import { generateKieImage } from './kie';
import { submitPublerPost } from './publer';
import { syncCalendarEntryToSheet } from './google-sheets';
import {
  createCalendarEntries,
  createDraftBundle,
  createPublishAttempt,
  createPublishJob,
  enqueueRetry,
  getArticleDetail,
  getSiteBundle,
  listCalendarEntries,
  logActivity,
  markCalendarEntryStatus,
  recordAsset,
  upsertGoogleSheetRow,
} from './repository';

export async function generateDraftsForArticle(params: {
  siteId: string;
  articleId: string;
  actorUserId: string | null;
  variationCount: number;
  platforms?: string[];
}) {
  const detail = await getArticleDetail(params.siteId, params.articleId);
  const site = await getSiteBundle(params.siteId);

  if (!detail || !site) {
    throw new Error('Unable to load article or site context.');
  }

  const platforms = (params.platforms?.length
    ? params.platforms
    : site.settings?.target_platforms ?? SOCIAL_PLATFORMS) as (typeof SOCIAL_PLATFORMS)[number][];

  const result = await generateSocialVariants({
    article: detail.article,
    site,
    platforms,
    variationCount: params.variationCount,
  });

  return createDraftBundle({
    siteId: params.siteId,
    articleId: params.articleId,
    actorUserId: params.actorUserId,
    provider: result.provider,
    model: result.model,
    promptVersion: 'social_generation@v1',
    variants: result.variants,
  });
}

export async function generateAssetForDraft(params: {
  siteId: string;
  draftId: string;
  variantId: string | null;
  actorUserId: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const [{ data: draft }, { data: variant }, site] = await Promise.all([
    supabase.from('post_drafts').select('*').eq('id', params.draftId).single(),
    params.variantId
      ? supabase.from('post_variants').select('*').eq('id', params.variantId).single()
      : Promise.resolve({ data: null }),
    getSiteBundle(params.siteId),
  ]);

  if (!draft || !site) {
    throw new Error('Unable to load draft or site context.');
  }

  const prompt =
    [
      site.settings?.image_style_prompt,
      `Brand: ${site.site.name}`,
      variant ? `Platform: ${variant.platform}` : null,
      variant?.body ?? draft.notes,
    ]
      .filter(Boolean)
      .join('\n')
      .trim() || `Editorial social image for ${site.site.name}`;

  const result = await generateKieImage({
    siteId: params.siteId,
    draftId: params.draftId,
    prompt,
  });

  const asset = await recordAsset({
    siteId: params.siteId,
    draftId: params.draftId,
    variantId: params.variantId,
    prompt,
    status: 'ready',
    externalTaskId: result.taskId,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
  });

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'asset.generated',
    entityType: 'post_asset',
    entityId: asset.id,
    severity: 'info',
    message: 'Generated a social image asset.',
    metadata: { variantId: params.variantId },
  });

  return asset;
}

export async function scheduleVariantOnCalendar(params: {
  siteId: string;
  draftId: string;
  variantId: string;
  platform: string;
  socialAccountId: string | null;
  scheduledFor: string;
  timezone: string;
  actorUserId: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const { data: variant } = await supabase.from('post_variants').select('*').eq('id', params.variantId).single();
  if (!variant) {
    throw new Error('Variant not found.');
  }

  const entries = await createCalendarEntries([
    {
      siteId: params.siteId,
      draftId: params.draftId,
      variantId: params.variantId,
      socialAccountId: params.socialAccountId,
      platform: params.platform,
      title: `${variant.platform.toUpperCase()} · ${variant.body.slice(0, 48)}`,
      scheduledFor: params.scheduledFor,
      timezone: params.timezone,
      approvalStatus: 'pending_review',
    },
  ]);

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'calendar.scheduled',
    entityType: 'calendar_entry',
    entityId: entries[0]?.id ?? null,
    severity: 'info',
    message: 'Added a post variant to the content calendar.',
  });

  return entries[0];
}

export async function publishCalendarEntries(params: {
  siteId: string;
  entryIds: string[];
  mode: 'schedule' | 'publish_now';
  actorUserId: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const site = await getSiteBundle(params.siteId);
  if (!site) {
    throw new Error('Site not found.');
  }

  const entries = await listCalendarEntries(params.siteId);
  const selectedEntries = entries.filter((entry) => params.entryIds.includes(entry.id));

  for (const entry of selectedEntries) {
    const [{ data: variant }, { data: asset }] = await Promise.all([
      supabase.from('post_variants').select('*').eq('id', entry.variant_id).single(),
      supabase
        .from('post_assets')
        .select('*')
        .eq('draft_id', entry.draft_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const job = await createPublishJob({
      siteId: params.siteId,
      calendarEntryId: entry.id,
      socialAccountId: entry.social_account_id,
      action: params.mode,
      requestPayload: {
        entryId: entry.id,
      },
      status: 'running',
      scheduledFor: entry.scheduled_for,
    });

    try {
      if (!entry.social_account_id) {
        throw new Error('Calendar entry is missing a mapped social account.');
      }

      const response = await submitPublerPost({
        socialAccountId: entry.social_account_id,
        body: variant?.body ?? '',
        mediaUrls: asset?.public_url ? [asset.public_url] : [],
        scheduledFor: params.mode === 'schedule' ? entry.scheduled_for : null,
        title: entry.title,
        link: variant?.external_url ?? null,
        mode: params.mode,
      });

      await createPublishAttempt({
        publishJobId: job.id,
        attemptNumber: 1,
        status: 'succeeded',
        requestPayload: { mode: params.mode, entryId: entry.id },
        responsePayload: response,
      });

      await supabase
        .from('publish_jobs')
        .update({
          status: params.mode === 'publish_now' ? 'succeeded' : 'scheduled',
          response_payload: response,
          external_job_id: String(
            (response as Record<string, unknown>).id ??
              (response as Record<string, unknown>).job_id ??
              ((response as Record<string, unknown>).data as Record<string, unknown> | undefined)?.id ??
              '',
          ),
          published_at: params.mode === 'publish_now' ? new Date().toISOString() : null,
        })
        .eq('id', job.id);

      await markCalendarEntryStatus(
        entry.id,
        params.mode === 'publish_now' ? 'published' : 'scheduled',
        params.mode === 'publish_now' ? new Date().toISOString() : null,
      );

      await logActivity({
        siteId: params.siteId,
        actorUserId: params.actorUserId,
        eventType: 'publish.submitted',
        entityType: 'publish_job',
        entityId: job.id,
        severity: 'info',
        message: `Submitted ${params.mode} job to Publer.`,
        metadata: { entryId: entry.id },
      });

      if (variant) {
        const syncResult = await syncCalendarEntryToSheet({
          site,
          entry,
          articleTitle: entry.title,
          variantBody: variant.body,
          publishStatus: params.mode === 'publish_now' ? 'published' : 'scheduled',
        });

        if (syncResult) {
          await upsertGoogleSheetRow({
            siteId: params.siteId,
            calendarEntryId: entry.id,
            rowKey: `${entry.id}:${entry.platform}`,
            status: 'synced',
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown publishing error';

      await createPublishAttempt({
        publishJobId: job.id,
        attemptNumber: 1,
        status: 'failed',
        requestPayload: { mode: params.mode, entryId: entry.id },
        errorMessage: message,
      });

      await supabase
        .from('publish_jobs')
        .update({
          status: 'failed',
          last_error: message,
        })
        .eq('id', job.id);

      await markCalendarEntryStatus(entry.id, 'failed');
      await enqueueRetry({
        siteId: params.siteId,
        jobType: 'publish',
        entityType: 'calendar_entry',
        entityId: entry.id,
        payload: { mode: params.mode, entryId: entry.id },
        lastError: message,
      });

      await logActivity({
        siteId: params.siteId,
        actorUserId: params.actorUserId,
        eventType: 'publish.failed',
        entityType: 'publish_job',
        entityId: job.id,
        severity: 'error',
        message,
        metadata: { entryId: entry.id },
      });
    }
  }
}

export async function syncEntriesToGoogleSheets(params: {
  siteId: string;
  entryIds: string[];
  actorUserId: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const site = await getSiteBundle(params.siteId);
  if (!site) {
    throw new Error('Site not found.');
  }

  const entries = await listCalendarEntries(params.siteId);
  const selectedEntries = entries.filter((entry) => params.entryIds.includes(entry.id));

  for (const entry of selectedEntries) {
    const { data: variant } = await supabase
      .from('post_variants')
      .select('*')
      .eq('id', entry.variant_id)
      .single();

    if (!variant) continue;

    const syncResult = await syncCalendarEntryToSheet({
      site,
      entry,
      articleTitle: entry.title,
      variantBody: variant.body,
      publishStatus: entry.status,
    });

    if (syncResult) {
      await upsertGoogleSheetRow({
        siteId: params.siteId,
        calendarEntryId: entry.id,
        rowKey: `${entry.id}:${entry.platform}`,
        status: 'synced',
      });
    }
  }

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'sheets.synced',
    entityType: 'calendar_entry',
    entityId: null,
    severity: 'info',
    message: 'Synced calendar entries to Google Sheets.',
    metadata: { entryIds: params.entryIds },
  });
}
