create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null unique,
  domain text not null,
  timezone text not null default 'UTC',
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  brand_voice text,
  primary_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites (id) on delete cascade,
  target_platforms text[] not null default '{}',
  posting_rules text[] not null default '{}',
  default_hashtags text[] not null default '{}',
  image_style_prompt text,
  cta_defaults text[] not null default '{}',
  utm_campaign text,
  schedule_preferences jsonb not null default '{}'::jsonb,
  approval_required boolean not null default true,
  timezone text not null default 'UTC',
  webhook_secret_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  platform text not null,
  label text not null,
  handle text,
  publer_workspace_id text,
  publer_account_id text,
  is_default boolean not null default false,
  status text not null default 'pending' check (status in ('connected', 'pending', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, platform, coalesce(publer_account_id, ''))
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  provider text not null,
  status text not null default 'configured' check (status in ('configured', 'disabled', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, provider)
);

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites (id) on delete cascade,
  template_type text not null,
  name text not null,
  content text not null,
  is_system_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_rules (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  rule_type text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduling_templates (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  name text not null,
  description text,
  weekdays text[] not null default '{}',
  daypart_slots text[] not null default '{}',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  source_type text not null default 'manual' check (source_type in ('n8n', 'manual', 'refresh')),
  source_key text not null,
  external_id text,
  title text not null,
  url text not null,
  slug text not null,
  excerpt text,
  body_markdown text,
  featured_image_url text,
  keywords text[] not null default '{}',
  tags text[] not null default '{}',
  category text,
  published_at timestamptz,
  status text not null default 'imported' check (status in ('imported', 'drafted', 'scheduled', 'published', 'error')),
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, source_key)
);

create table if not exists public.article_import_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  article_id uuid references public.articles (id) on delete set null,
  idempotency_key text not null unique,
  source_type text not null,
  status text not null default 'succeeded' check (status in ('pending', 'succeeded', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.post_drafts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  generation_provider text,
  generation_model text,
  prompt_version text,
  status text not null default 'generated' check (status in ('pending', 'generated', 'approved', 'rejected', 'scheduled')),
  approval_status text not null default 'pending_review' check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_variants (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.post_drafts (id) on delete cascade,
  site_id uuid not null references public.sites (id) on delete cascade,
  platform text not null,
  version_index integer not null default 1,
  hook text,
  body text not null,
  cta text,
  hashtags text[] not null default '{}',
  emoji_policy text,
  external_url text,
  character_count integer,
  status text not null default 'generated' check (status in ('pending', 'generated', 'approved', 'rejected', 'scheduled')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  draft_id uuid not null references public.post_drafts (id) on delete cascade,
  variant_id uuid references public.post_variants (id) on delete set null,
  provider text not null default 'kie',
  model text not null,
  prompt text not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  external_task_id text,
  storage_path text,
  public_url text,
  width integer,
  height integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_calendar_entries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  draft_id uuid not null references public.post_drafts (id) on delete cascade,
  variant_id uuid not null references public.post_variants (id) on delete cascade,
  social_account_id uuid references public.social_accounts (id) on delete set null,
  platform text not null,
  title text not null,
  scheduled_for timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'published', 'failed')),
  approval_status text not null default 'pending_review' check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  calendar_entry_id uuid not null references public.content_calendar_entries (id) on delete cascade,
  social_account_id uuid references public.social_accounts (id) on delete set null,
  provider text not null default 'publer',
  action text not null check (action in ('schedule', 'publish_now')),
  status text not null default 'pending' check (status in ('pending', 'running', 'scheduled', 'succeeded', 'failed', 'retrying')),
  external_job_id text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  last_error text,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_attempts (
  id uuid primary key default gen_random_uuid(),
  publish_job_id uuid not null references public.publish_jobs (id) on delete cascade,
  attempt_number integer not null default 1,
  status text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.retry_queue (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  job_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  next_run_at timestamptz not null default now(),
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  payload jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  site_id uuid references public.sites (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.google_sheet_rows (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  calendar_entry_id uuid not null references public.content_calendar_entries (id) on delete cascade,
  row_key text not null,
  row_index integer,
  status text not null default 'pending' check (status in ('pending', 'synced', 'failed')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (calendar_entry_id, row_key)
);

create index if not exists idx_org_members_user on public.organization_members (user_id);
create index if not exists idx_sites_org on public.sites (organization_id);
create index if not exists idx_articles_site on public.articles (site_id, created_at desc);
create index if not exists idx_drafts_site on public.post_drafts (site_id, created_at desc);
create index if not exists idx_variants_draft on public.post_variants (draft_id, platform);
create index if not exists idx_assets_draft on public.post_assets (draft_id, created_at desc);
create index if not exists idx_calendar_site on public.content_calendar_entries (site_id, scheduled_for);
create index if not exists idx_jobs_site on public.publish_jobs (site_id, created_at desc);
create index if not exists idx_activity_site on public.activity_logs (site_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
drop trigger if exists organization_members_set_updated_at on public.organization_members;
create trigger organization_members_set_updated_at before update on public.organization_members for each row execute function public.set_updated_at();
drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at before update on public.sites for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists social_accounts_set_updated_at on public.social_accounts;
create trigger social_accounts_set_updated_at before update on public.social_accounts for each row execute function public.set_updated_at();
drop trigger if exists integration_connections_set_updated_at on public.integration_connections;
create trigger integration_connections_set_updated_at before update on public.integration_connections for each row execute function public.set_updated_at();
drop trigger if exists prompt_templates_set_updated_at on public.prompt_templates;
create trigger prompt_templates_set_updated_at before update on public.prompt_templates for each row execute function public.set_updated_at();
drop trigger if exists brand_rules_set_updated_at on public.brand_rules;
create trigger brand_rules_set_updated_at before update on public.brand_rules for each row execute function public.set_updated_at();
drop trigger if exists scheduling_templates_set_updated_at on public.scheduling_templates;
create trigger scheduling_templates_set_updated_at before update on public.scheduling_templates for each row execute function public.set_updated_at();
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();
drop trigger if exists post_drafts_set_updated_at on public.post_drafts;
create trigger post_drafts_set_updated_at before update on public.post_drafts for each row execute function public.set_updated_at();
drop trigger if exists post_variants_set_updated_at on public.post_variants;
create trigger post_variants_set_updated_at before update on public.post_variants for each row execute function public.set_updated_at();
drop trigger if exists post_assets_set_updated_at on public.post_assets;
create trigger post_assets_set_updated_at before update on public.post_assets for each row execute function public.set_updated_at();
drop trigger if exists content_calendar_entries_set_updated_at on public.content_calendar_entries;
create trigger content_calendar_entries_set_updated_at before update on public.content_calendar_entries for each row execute function public.set_updated_at();
drop trigger if exists publish_jobs_set_updated_at on public.publish_jobs;
create trigger publish_jobs_set_updated_at before update on public.publish_jobs for each row execute function public.set_updated_at();
drop trigger if exists retry_queue_set_updated_at on public.retry_queue;
create trigger retry_queue_set_updated_at before update on public.retry_queue for each row execute function public.set_updated_at();
drop trigger if exists google_sheet_rows_set_updated_at on public.google_sheet_rows;
create trigger google_sheet_rows_set_updated_at before update on public.google_sheet_rows for each row execute function public.set_updated_at();

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_org
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.is_site_member(target_site uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.sites s
    join public.organization_members membership on membership.organization_id = s.organization_id
    where s.id = target_site
      and membership.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.sites enable row level security;
alter table public.site_settings enable row level security;
alter table public.social_accounts enable row level security;
alter table public.integration_connections enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.brand_rules enable row level security;
alter table public.scheduling_templates enable row level security;
alter table public.articles enable row level security;
alter table public.article_import_events enable row level security;
alter table public.post_drafts enable row level security;
alter table public.post_variants enable row level security;
alter table public.post_assets enable row level security;
alter table public.content_calendar_entries enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.publish_attempts enable row level security;
alter table public.retry_queue enable row level security;
alter table public.activity_logs enable row level security;
alter table public.google_sheet_rows enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid());

drop policy if exists "organizations_member_access" on public.organizations;
create policy "organizations_member_access" on public.organizations for select using (public.is_org_member(id));

drop policy if exists "org_members_member_access" on public.organization_members;
create policy "org_members_member_access" on public.organization_members for select using (public.is_org_member(organization_id));

drop policy if exists "sites_member_access" on public.sites;
create policy "sites_member_access" on public.sites for select using (public.is_org_member(organization_id));

drop policy if exists "site_settings_member_access" on public.site_settings;
create policy "site_settings_member_access" on public.site_settings for select using (public.is_site_member(site_id));

drop policy if exists "social_accounts_member_access" on public.social_accounts;
create policy "social_accounts_member_access" on public.social_accounts for select using (public.is_site_member(site_id));

drop policy if exists "integration_connections_member_access" on public.integration_connections;
create policy "integration_connections_member_access" on public.integration_connections for select using (public.is_site_member(site_id));

drop policy if exists "prompt_templates_member_access" on public.prompt_templates;
create policy "prompt_templates_member_access" on public.prompt_templates for select using (site_id is null or public.is_site_member(site_id));

drop policy if exists "brand_rules_member_access" on public.brand_rules;
create policy "brand_rules_member_access" on public.brand_rules for select using (public.is_site_member(site_id));

drop policy if exists "scheduling_templates_member_access" on public.scheduling_templates;
create policy "scheduling_templates_member_access" on public.scheduling_templates for select using (public.is_site_member(site_id));

drop policy if exists "articles_member_access" on public.articles;
create policy "articles_member_access" on public.articles for select using (public.is_site_member(site_id));

drop policy if exists "article_import_events_member_access" on public.article_import_events;
create policy "article_import_events_member_access" on public.article_import_events for select using (public.is_site_member(site_id));

drop policy if exists "post_drafts_member_access" on public.post_drafts;
create policy "post_drafts_member_access" on public.post_drafts for select using (public.is_site_member(site_id));

drop policy if exists "post_variants_member_access" on public.post_variants;
create policy "post_variants_member_access" on public.post_variants for select using (public.is_site_member(site_id));

drop policy if exists "post_assets_member_access" on public.post_assets;
create policy "post_assets_member_access" on public.post_assets for select using (public.is_site_member(site_id));

drop policy if exists "calendar_member_access" on public.content_calendar_entries;
create policy "calendar_member_access" on public.content_calendar_entries for select using (public.is_site_member(site_id));

drop policy if exists "publish_jobs_member_access" on public.publish_jobs;
create policy "publish_jobs_member_access" on public.publish_jobs for select using (public.is_site_member(site_id));

drop policy if exists "publish_attempts_member_access" on public.publish_attempts;
create policy "publish_attempts_member_access" on public.publish_attempts for select using (
  exists (
    select 1
    from public.publish_jobs job
    where job.id = publish_job_id
      and public.is_site_member(job.site_id)
  )
);

drop policy if exists "retry_queue_member_access" on public.retry_queue;
create policy "retry_queue_member_access" on public.retry_queue for select using (public.is_site_member(site_id));

drop policy if exists "activity_logs_member_access" on public.activity_logs;
create policy "activity_logs_member_access" on public.activity_logs for select using (
  (organization_id is not null and public.is_org_member(organization_id))
  or (site_id is not null and public.is_site_member(site_id))
);

drop policy if exists "google_sheet_rows_member_access" on public.google_sheet_rows;
create policy "google_sheet_rows_member_access" on public.google_sheet_rows for select using (public.is_site_member(site_id));

insert into storage.buckets (id, name, public)
values ('generated-assets', 'generated-assets', true)
on conflict (id) do nothing;
