import type {
  ActivityLog,
  Article,
  ArticleDetail,
  CalendarEntry,
  GoogleSheetRow,
  PostAsset,
  PostDraft,
  PostVariant,
  PublishJob,
  SiteBundle,
  SiteOverview,
  WorkspaceSummary,
} from './types';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

function getAdminOrThrow() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  return supabase;
}

async function countBySite(table: string, siteId: string, extraFilters: Array<[string, unknown]> = []) {
  const supabase = getAdminOrThrow();
  let query = supabase.from(table).select('*', { count: 'exact', head: true }).eq('site_id', siteId);
  for (const [key, value] of extraFilters) {
    query = query.eq(key, value);
  }
  const { count } = await query;
  return count ?? 0;
}

export async function createWorkspaceForUser(userId: string, input: {
  organizationName: string;
  siteName: string;
  domain: string;
  timezone: string;
  brandVoice: string;
}) {
  const supabase = getAdminOrThrow();
  const orgSlug = slugify(input.organizationName);
  const siteSlug = slugify(input.siteName);

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: input.organizationName,
      slug: `${orgSlug}-${siteSlug}`.slice(0, 120),
    })
    .select('*')
    .single();

  if (orgError || !organization) {
    throw new Error(orgError?.message ?? 'Failed to create organization.');
  }

  const { error: membershipError } = await supabase.from('organization_members').insert({
    organization_id: organization.id,
    user_id: userId,
    role: 'owner',
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      organization_id: organization.id,
      name: input.siteName,
      slug: `${siteSlug}-${Math.random().toString(36).slice(2, 8)}`.slice(0, 120),
      domain: input.domain,
      timezone: input.timezone,
      brand_voice: input.brandVoice,
      primary_goal: 'Distribute imported articles into scheduled social content.',
      status: 'active',
    })
    .select('*')
    .single();

  if (siteError || !site) {
    throw new Error(siteError?.message ?? 'Failed to create site workspace.');
  }

  await Promise.all([
    supabase.from('site_settings').insert({
      site_id: site.id,
      target_platforms: ['linkedin', 'facebook', 'twitter'],
      posting_rules: [
        'Lead with a strong hook.',
        'Anchor copy to the article value.',
        'Keep brand voice consistent and practical.',
      ],
      default_hashtags: ['contentmarketing', 'seo', 'growth'],
      image_style_prompt:
        'Clean editorial composition, premium SaaS color grading, sharp contrast, useful subject matter.',
      cta_defaults: ['Read the full article', 'Book a strategy call', 'Explore the workflow'],
      utm_campaign: slugify(site.name),
      schedule_preferences: {
        weeklySlots: ['09:00', '12:00', '15:00'],
        preferredDays: ['monday', 'wednesday', 'thursday'],
      },
      approval_required: true,
      timezone: input.timezone,
    }),
    supabase.from('prompt_templates').insert([
      {
        site_id: null,
        template_type: 'social_generation',
        name: 'System social generator',
        content:
          'Generate concise, platform-aware social variants from an article while respecting the brand voice, CTA defaults, posting rules, and channel constraints.',
        is_system_default: true,
      },
      {
        site_id: site.id,
        template_type: 'image_generation',
        name: 'Site visual prompt',
        content:
          'Create a premium editorial visual that aligns with the site voice and article topic. Avoid stock-photo clichés and excessive text.',
        is_system_default: false,
      },
    ]),
  ]);

  await logActivity({
    organizationId: organization.id,
    siteId: site.id,
    actorUserId: userId,
    eventType: 'workspace.created',
    entityType: 'site',
    entityId: site.id,
    severity: 'info',
    message: `Created workspace ${site.name}.`,
  });

  return site;
}

export async function listWorkspaceSummaries(userId: string): Promise<WorkspaceSummary[]> {
  const supabase = getAdminOrThrow();
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId);

  const organizationIds = memberships?.map((membership) => membership.organization_id) ?? [];
  if (!organizationIds.length) return [];

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .in('organization_id', organizationIds)
    .order('created_at', { ascending: true });

  const siteIds = (sites ?? []).map((site) => site.id);
  const { data: settings } = siteIds.length
    ? await supabase.from('site_settings').select('*').in('site_id', siteIds)
    : { data: [] };

  const siteSettingsMap = new Map((settings ?? []).map((setting) => [setting.site_id, setting]));
  const summaries = await Promise.all(
    (sites ?? []).map(async (site) => ({
      site,
      settings: siteSettingsMap.get(site.id) ?? null,
      articleCount: await countBySite('articles', site.id),
      scheduledCount: await countBySite('content_calendar_entries', site.id, [['status', 'scheduled']]),
      publishedCount: await countBySite('content_calendar_entries', site.id, [['status', 'published']]),
      failedJobs: await countBySite('publish_jobs', site.id, [['status', 'failed']]),
    })),
  );

  return summaries;
}

export async function getSiteBundle(siteId: string): Promise<SiteBundle | null> {
  const supabase = getAdminOrThrow();
  const [{ data: site }, { data: settings }, { data: socialAccounts }] = await Promise.all([
    supabase.from('sites').select('*').eq('id', siteId).single(),
    supabase.from('site_settings').select('*').eq('site_id', siteId).single(),
    supabase.from('social_accounts').select('*').eq('site_id', siteId).order('platform'),
  ]);

  if (!site) return null;

  return {
    site,
    settings,
    socialAccounts: socialAccounts ?? [],
  };
}

export async function getSiteOverview(siteId: string): Promise<SiteOverview | null> {
  const supabase = getAdminOrThrow();
  const bundle = await getSiteBundle(siteId);
  if (!bundle) return null;

  const [upcoming, recentArticles, recentJobs, recentActivity, totalArticles, readyDrafts, scheduledPosts, publishedPosts, failedJobs] =
    await Promise.all([
      supabase
        .from('content_calendar_entries')
        .select('*')
        .eq('site_id', siteId)
        .order('scheduled_for', { ascending: true })
        .limit(8)
        .then((result) => result.data ?? []),
      supabase
        .from('articles')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(6)
        .then((result) => result.data ?? []),
      supabase
        .from('publish_jobs')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(6)
        .then((result) => result.data ?? []),
      supabase
        .from('activity_logs')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(8)
        .then((result) => result.data ?? []),
      countBySite('articles', siteId),
      countBySite('post_drafts', siteId, [['approval_status', 'approved']]),
      countBySite('content_calendar_entries', siteId, [['status', 'scheduled']]),
      countBySite('content_calendar_entries', siteId, [['status', 'published']]),
      countBySite('publish_jobs', siteId, [['status', 'failed']]),
    ]);

  return {
    bundle,
    metrics: {
      totalArticles,
      readyDrafts,
      scheduledPosts,
      publishedPosts,
      failedJobs,
    },
    upcoming: upcoming as CalendarEntry[],
    recentArticles: recentArticles as Article[],
    recentJobs: recentJobs as PublishJob[],
    recentActivity: recentActivity as ActivityLog[],
  };
}

export async function listSiteArticles(siteId: string) {
  const supabase = getAdminOrThrow();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return (data ?? []) as Article[];
}

export async function getArticleDetail(siteId: string, articleId: string): Promise<ArticleDetail | null> {
  const supabase = getAdminOrThrow();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', siteId)
    .eq('id', articleId)
    .single();

  if (!article) return null;

  const { data: drafts } = await supabase
    .from('post_drafts')
    .select('*')
    .eq('site_id', siteId)
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });

  const draftIds = (drafts ?? []).map((draft) => draft.id);
  if (!draftIds.length) {
    return {
      article: article as Article,
      drafts: [],
    };
  }

  const [variants, assets, calendarEntries] = await Promise.all([
    supabase.from('post_variants').select('*').in('draft_id', draftIds).order('version_index'),
    supabase.from('post_assets').select('*').in('draft_id', draftIds).order('created_at', { ascending: false }),
    supabase.from('content_calendar_entries').select('*').in('draft_id', draftIds).order('scheduled_for'),
  ]);

  return {
    article: article as Article,
    drafts: (drafts ?? []).map((draft) => ({
      ...(draft as PostDraft),
      variants: ((variants.data ?? []) as PostVariant[]).filter((variant) => variant.draft_id === draft.id),
      assets: ((assets.data ?? []) as PostAsset[]).filter((asset) => asset.draft_id === draft.id),
      calendarEntries: ((calendarEntries.data ?? []) as CalendarEntry[]).filter(
        (entry) => entry.draft_id === draft.id,
      ),
    })),
  };
}

export async function listCalendarEntries(siteId: string) {
  const supabase = getAdminOrThrow();
  const { data } = await supabase
    .from('content_calendar_entries')
    .select('*')
    .eq('site_id', siteId)
    .order('scheduled_for', { ascending: true });

  return (data ?? []) as CalendarEntry[];
}

export async function listPublishHistory(siteId: string) {
  const supabase = getAdminOrThrow();
  const { data } = await supabase
    .from('publish_jobs')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  return (data ?? []) as PublishJob[];
}

export async function listActivity(siteId: string) {
  const supabase = getAdminOrThrow();
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (data ?? []) as ActivityLog[];
}

export async function updateSiteSettings(siteId: string, payload: Record<string, unknown>) {
  const supabase = getAdminOrThrow();
  const { error: siteError } = await supabase
    .from('sites')
    .update({
      name: payload.name,
      domain: payload.domain,
      brand_voice: payload.brandVoice,
      timezone: payload.timezone,
    })
    .eq('id', siteId);

  if (siteError) {
    throw new Error(siteError.message);
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      site_id: siteId,
      target_platforms: payload.targetPlatforms,
      posting_rules: payload.postingRules,
      default_hashtags: payload.defaultHashtags,
      image_style_prompt: payload.imageStylePrompt,
      cta_defaults: payload.ctaDefaults,
      utm_campaign: payload.utmCampaign || null,
      schedule_preferences: payload.schedulePreferences ?? {},
      approval_required: payload.approvalRequired,
      timezone: payload.timezone,
      webhook_secret_hint: payload.webhookSecret ? 'configured' : null,
    }, { onConflict: 'site_id' });

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertArticle(
  siteId: string,
  article: Record<string, unknown>,
  sourceType: 'n8n' | 'manual' | 'refresh',
  actorUserId: string | null,
  idempotencyKey: string,
) {
  const supabase = getAdminOrThrow();
  const title = String(article.title);
  const sourceKey = String(article.externalId ?? article.url ?? idempotencyKey);
  const payload = {
    site_id: siteId,
    source_type: sourceType,
    source_key: sourceKey,
    external_id: (article.externalId as string | null) ?? null,
    title,
    url: String(article.url),
    slug: String(article.slug || slugify(title)),
    excerpt: (article.excerpt as string | null) ?? null,
    body_markdown: (article.bodyMarkdown as string | null) ?? null,
    featured_image_url: (article.featuredImageUrl as string | null) ?? null,
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
    tags: Array.isArray(article.tags) ? article.tags : [],
    category: (article.category as string | null) ?? null,
    published_at: (article.publishedAt as string | null) ?? null,
    status: 'imported',
    source_metadata: (article.sourceMetadata as Record<string, unknown>) ?? {},
  };

  const { data, error } = await supabase
    .from('articles')
    .upsert(payload, { onConflict: 'site_id,source_key' })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to store article.');
  }

  await Promise.all([
    supabase.from('article_import_events').insert({
      site_id: siteId,
      article_id: data.id,
      idempotency_key: idempotencyKey,
      source_type: sourceType,
      status: 'succeeded',
      payload,
    }),
    logActivity({
      siteId,
      actorUserId,
      eventType: 'article.imported',
      entityType: 'article',
      entityId: data.id,
      severity: 'info',
      message: `Imported article ${title}.`,
      metadata: { sourceType },
    }),
  ]);

  return data as Article;
}

export async function createDraftBundle(params: {
  siteId: string;
  articleId: string;
  actorUserId: string | null;
  provider: string;
  model: string;
  promptVersion: string;
  notes?: string | null;
  variants: Array<{
    platform: string;
    hook?: string | null;
    body: string;
    cta?: string | null;
    hashtags?: string[];
    emojiPolicy?: string | null;
    externalUrl?: string | null;
    scheduledFor?: string | null;
  }>;
}) {
  const supabase = getAdminOrThrow();
  const { data: draft, error } = await supabase
    .from('post_drafts')
    .insert({
      site_id: params.siteId,
      article_id: params.articleId,
      generation_provider: params.provider,
      generation_model: params.model,
      prompt_version: params.promptVersion,
      status: 'generated',
      approval_status: 'pending_review',
      notes: params.notes ?? null,
    })
    .select('*')
    .single();

  if (error || !draft) {
    throw new Error(error?.message ?? 'Failed to create draft.');
  }

  const { error: variantsError } = await supabase.from('post_variants').insert(
    params.variants.map((variant, index) => ({
      draft_id: draft.id,
      site_id: params.siteId,
      platform: variant.platform,
      version_index: index + 1,
      hook: variant.hook ?? null,
      body: variant.body,
      cta: variant.cta ?? null,
      hashtags: variant.hashtags ?? [],
      emoji_policy: variant.emojiPolicy ?? null,
      external_url: variant.externalUrl ?? null,
      character_count: variant.body.length,
      status: 'generated',
      scheduled_for: variant.scheduledFor ?? null,
    })),
  );

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'draft.generated',
    entityType: 'post_draft',
    entityId: draft.id,
    severity: 'info',
    message: `Generated ${params.variants.length} post variants.`,
    metadata: {
      provider: params.provider,
      model: params.model,
    },
  });

  return draft as PostDraft;
}

export async function reviewDraft(params: {
  draftId: string;
  approvalStatus: 'approved' | 'rejected' | 'pending_review';
  status: 'approved' | 'rejected' | 'generated';
  actorUserId: string | null;
  siteId: string;
}) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('post_drafts')
    .update({
      approval_status: params.approvalStatus,
      status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.draftId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update draft review status.');
  }

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'draft.reviewed',
    entityType: 'post_draft',
    entityId: params.draftId,
    severity: params.approvalStatus === 'rejected' ? 'warning' : 'info',
    message: `Draft marked as ${params.approvalStatus}.`,
  });

  return data as PostDraft;
}

export async function updateVariant(params: {
  variantId: string;
  siteId: string;
  actorUserId: string | null;
  hook?: string | null;
  body: string;
  cta?: string | null;
  hashtags: string[];
}) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('post_variants')
    .update({
      hook: params.hook ?? null,
      body: params.body,
      cta: params.cta ?? null,
      hashtags: params.hashtags,
      character_count: params.body.length,
      status: 'generated',
    })
    .eq('id', params.variantId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update post variant.');
  }

  await logActivity({
    siteId: params.siteId,
    actorUserId: params.actorUserId,
    eventType: 'variant.updated',
    entityType: 'post_variant',
    entityId: params.variantId,
    severity: 'info',
    message: 'Updated a post variant.',
  });

  return data as PostVariant;
}

export async function recordAsset(params: {
  siteId: string;
  draftId: string;
  variantId: string | null;
  prompt: string;
  status: 'pending' | 'ready' | 'failed';
  externalTaskId?: string | null;
  publicUrl?: string | null;
  storagePath?: string | null;
  errorMessage?: string | null;
  width?: number | null;
  height?: number | null;
}) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('post_assets')
    .insert({
      site_id: params.siteId,
      draft_id: params.draftId,
      variant_id: params.variantId,
      provider: 'kie',
      model: 'nanobanana-2',
      prompt: params.prompt,
      status: params.status,
      external_task_id: params.externalTaskId ?? null,
      public_url: params.publicUrl ?? null,
      storage_path: params.storagePath ?? null,
      error_message: params.errorMessage ?? null,
      width: params.width ?? null,
      height: params.height ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to persist asset metadata.');
  }

  return data as PostAsset;
}

export async function createCalendarEntries(entries: Array<{
  siteId: string;
  draftId: string;
  variantId: string;
  socialAccountId: string | null;
  platform: string;
  title: string;
  scheduledFor: string;
  timezone: string;
  approvalStatus: string;
}>) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('content_calendar_entries')
    .insert(
      entries.map((entry) => ({
        site_id: entry.siteId,
        draft_id: entry.draftId,
        variant_id: entry.variantId,
        social_account_id: entry.socialAccountId,
        platform: entry.platform,
        title: entry.title,
        scheduled_for: entry.scheduledFor,
        timezone: entry.timezone,
        status: 'scheduled',
        approval_status: entry.approvalStatus,
      })),
    )
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CalendarEntry[];
}

export async function createPublishJob(params: {
  siteId: string;
  calendarEntryId: string;
  socialAccountId: string | null;
  action: 'schedule' | 'publish_now';
  requestPayload: Record<string, unknown>;
  status?: string;
  externalJobId?: string | null;
  responsePayload?: Record<string, unknown>;
  lastError?: string | null;
  scheduledFor?: string | null;
  publishedAt?: string | null;
}) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('publish_jobs')
    .insert({
      site_id: params.siteId,
      calendar_entry_id: params.calendarEntryId,
      social_account_id: params.socialAccountId,
      provider: 'publer',
      action: params.action,
      status: params.status ?? 'pending',
      request_payload: params.requestPayload,
      response_payload: params.responsePayload ?? {},
      external_job_id: params.externalJobId ?? null,
      last_error: params.lastError ?? null,
      scheduled_for: params.scheduledFor ?? null,
      published_at: params.publishedAt ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create publish job.');
  }

  return data as PublishJob;
}

export async function createPublishAttempt(params: {
  publishJobId: string;
  attemptNumber: number;
  status: string;
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const supabase = getAdminOrThrow();
  await supabase.from('publish_attempts').insert({
    publish_job_id: params.publishJobId,
    attempt_number: params.attemptNumber,
    status: params.status,
    request_payload: params.requestPayload,
    response_payload: params.responsePayload ?? {},
    error_message: params.errorMessage ?? null,
  });
}

export async function markCalendarEntryStatus(entryId: string, status: string, publishedAt?: string | null) {
  const supabase = getAdminOrThrow();
  await supabase
    .from('content_calendar_entries')
    .update({
      status,
      published_at: publishedAt ?? null,
    })
    .eq('id', entryId);
}

export async function upsertGoogleSheetRow(params: {
  siteId: string;
  calendarEntryId: string;
  rowKey: string;
  rowIndex?: number | null;
  status: 'pending' | 'synced' | 'failed';
}) {
  const supabase = getAdminOrThrow();
  const { data, error } = await supabase
    .from('google_sheet_rows')
    .upsert(
      {
        site_id: params.siteId,
        calendar_entry_id: params.calendarEntryId,
        row_key: params.rowKey,
        row_index: params.rowIndex ?? null,
        status: params.status,
        last_synced_at: params.status === 'synced' ? new Date().toISOString() : null,
      },
      { onConflict: 'calendar_entry_id,row_key' },
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update Google Sheets sync metadata.');
  }

  return data as GoogleSheetRow;
}

export async function enqueueRetry(params: {
  siteId: string;
  jobType: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  lastError: string;
}) {
  const supabase = getAdminOrThrow();
  await supabase.from('retry_queue').insert({
    site_id: params.siteId,
    job_type: params.jobType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    status: 'pending',
    next_run_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    attempts: 1,
    max_attempts: 5,
    payload: params.payload,
    last_error: params.lastError,
  });
}

export async function logActivity(params: {
  organizationId?: string | null;
  siteId?: string | null;
  actorUserId?: string | null;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  severity?: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getAdminOrThrow();
  await supabase.from('activity_logs').insert({
    organization_id: params.organizationId ?? null,
    site_id: params.siteId ?? null,
    actor_user_id: params.actorUserId ?? null,
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    severity: params.severity ?? 'info',
    message: params.message,
    metadata: params.metadata ?? {},
  });
}
