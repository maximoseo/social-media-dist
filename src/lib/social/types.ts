import { APPROVAL_STATUSES, CALENDAR_STATUSES, DRAFT_STATUSES, JOB_STATUSES, SOCIAL_PLATFORMS } from './constants';

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type DraftStatus = (typeof DRAFT_STATUSES)[number];
export type CalendarStatus = (typeof CALENDAR_STATUSES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface Site {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  domain: string;
  timezone: string;
  status: 'active' | 'paused' | 'archived';
  brand_voice: string | null;
  primary_goal: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_id: string;
  target_platforms: SocialPlatform[];
  posting_rules: string[];
  default_hashtags: string[];
  image_style_prompt: string | null;
  cta_defaults: string[];
  utm_campaign: string | null;
  schedule_preferences: Record<string, unknown>;
  approval_required: boolean;
  timezone: string;
  webhook_secret_hint: string | null;
}

export interface SocialAccount {
  id: string;
  site_id: string;
  platform: SocialPlatform;
  label: string;
  handle: string | null;
  publer_workspace_id: string | null;
  publer_account_id: string | null;
  is_default: boolean;
  status: 'connected' | 'pending' | 'disabled';
}

export interface Article {
  id: string;
  site_id: string;
  source_type: 'n8n' | 'manual' | 'refresh';
  external_id: string | null;
  title: string;
  url: string;
  slug: string;
  excerpt: string | null;
  body_markdown: string | null;
  featured_image_url: string | null;
  keywords: string[];
  tags: string[];
  category: string | null;
  published_at: string | null;
  status: 'imported' | 'drafted' | 'scheduled' | 'published' | 'error';
  source_metadata: Record<string, unknown>;
  created_at: string;
}

export interface PostDraft {
  id: string;
  site_id: string;
  article_id: string;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  status: DraftStatus;
  approval_status: ApprovalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVariant {
  id: string;
  draft_id: string;
  site_id: string;
  platform: SocialPlatform;
  version_index: number;
  hook: string | null;
  body: string;
  cta: string | null;
  hashtags: string[];
  emoji_policy: string | null;
  external_url: string | null;
  character_count: number | null;
  status: DraftStatus;
  scheduled_for: string | null;
  created_at: string;
}

export interface PostAsset {
  id: string;
  site_id: string;
  draft_id: string;
  variant_id: string | null;
  provider: 'kie';
  model: string;
  prompt: string;
  status: 'pending' | 'ready' | 'failed';
  external_task_id: string | null;
  storage_path: string | null;
  public_url: string | null;
  width: number | null;
  height: number | null;
  error_message: string | null;
  created_at: string;
}

export interface CalendarEntry {
  id: string;
  site_id: string;
  draft_id: string;
  variant_id: string;
  social_account_id: string | null;
  platform: SocialPlatform;
  title: string;
  scheduled_for: string;
  timezone: string;
  status: CalendarStatus;
  approval_status: ApprovalStatus;
  published_at: string | null;
  created_at: string;
}

export interface PublishJob {
  id: string;
  site_id: string;
  calendar_entry_id: string;
  social_account_id: string | null;
  provider: 'publer';
  action: 'publish_now' | 'schedule';
  status: JobStatus;
  external_job_id: string | null;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  last_error: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string | null;
  site_id: string | null;
  actor_user_id: string | null;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  severity: 'info' | 'warning' | 'error';
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GoogleSheetRow {
  id: string;
  site_id: string;
  calendar_entry_id: string;
  row_key: string;
  row_index: number | null;
  status: 'pending' | 'synced' | 'failed';
  last_synced_at: string | null;
}

export interface SiteBundle {
  site: Site;
  settings: SiteSettings | null;
  socialAccounts: SocialAccount[];
}

export interface DashboardMetrics {
  totalArticles: number;
  readyDrafts: number;
  scheduledPosts: number;
  publishedPosts: number;
  failedJobs: number;
}

export interface SiteOverview {
  bundle: SiteBundle;
  metrics: DashboardMetrics;
  upcoming: CalendarEntry[];
  recentArticles: Article[];
  recentJobs: PublishJob[];
  recentActivity: ActivityLog[];
}

export interface ArticleDetail {
  article: Article;
  drafts: Array<
    PostDraft & {
      variants: PostVariant[];
      assets: PostAsset[];
      calendarEntries: CalendarEntry[];
    }
  >;
}

export interface WorkspaceSummary {
  site: Site;
  settings: SiteSettings | null;
  articleCount: number;
  scheduledCount: number;
  publishedCount: number;
  failedJobs: number;
}
