# Social Media Dist

Social Media Dist is a production-oriented internal publishing workspace for multi-site article distribution. It receives article payloads from n8n or manual imports, generates platform-aware social variants, creates visuals with KIE, schedules and publishes through Publer, persists operational state in Supabase, and syncs relevant records into Google Sheets.

## Product Surface

- Supabase authentication with protected routes and session persistence
- Multi-workspace dashboard for websites and brands
- Manual article import and secured n8n webhook ingestion
- AI social draft generation with provider fallback support
- KIE image generation pipeline wired around the `nanobanana-2` model
- Long-range content calendar built on FullCalendar
- Publer scheduling and publish-now pipeline with job history and retries
- Google Sheets sync with row metadata tracking
- Activity log, audit trail, and retry queue persistence

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, and RLS
- TanStack Query
- FullCalendar
- Zod
- Vitest

## Repository Layout

- `src/app`: app routes, API routes, auth pages, protected workspace pages
- `src/components/social`: product-specific shell, forms, calendar, review, and mutation controls
- `src/lib/social`: domain types, validation schemas, repository access, integration services, orchestration pipelines
- `src/lib/supabase`: browser/server/admin Supabase clients
- `supabase/migrations`: schema and RLS migration

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Fill in the required environment variables.
3. Install dependencies with `npm install`.
4. Run the dev server with `npm run dev`.
5. Open `http://localhost:3000`.

### Verification Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment Variables

### Required

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Draft Generation

- `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- `AI_MODEL` optional override

### n8n Ingestion

- `N8N_WEBHOOK_SHARED_SECRET`

### KIE

- `KIE_API_KEY`
- `KIE_API_BASE_URL`
- `KIE_IMAGE_SUBMIT_PATH`
- `KIE_IMAGE_RECORD_PATH`
- `KIE_IMAGE_DOWNLOAD_PATH`

### Publer

- `PUBLER_API_KEY`
- `PUBLER_API_BASE_URL`
- `PUBLER_POSTS_PATH`
- `PUBLER_JOB_STATUS_TEMPLATE`

### Google Sheets

- `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_DEFAULT_SHEET`

## Supabase Setup

1. Create a Supabase project.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply `supabase/migrations/001_initial_schema.sql`.
4. Confirm the `generated-assets` storage bucket exists. The migration creates it as a public bucket.
5. Enable email/password auth in Supabase Auth.

### Schema Coverage

The migration creates and secures:

- `profiles`
- `organizations`
- `organization_members`
- `sites`
- `site_settings`
- `social_accounts`
- `integration_connections`
- `prompt_templates`
- `brand_rules`
- `scheduling_templates`
- `articles`
- `article_import_events`
- `post_drafts`
- `post_variants`
- `post_assets`
- `content_calendar_entries`
- `publish_jobs`
- `publish_attempts`
- `retry_queue`
- `activity_logs`
- `google_sheet_rows`

### RLS Strategy

- Organization-scoped tables use `is_org_member`.
- Site-scoped tables use `is_site_member`.
- Protected app reads rely on Supabase Auth sessions plus middleware.
- Server-side mutation routes use the service role key and explicit membership checks for defense in depth.

## n8n Webhook

Endpoint:

```text
POST /api/n8n/articles
```

Headers:

- `x-webhook-secret: <N8N_WEBHOOK_SHARED_SECRET>`

Body:

```json
{
  "siteId": "uuid-or-use-siteSlug",
  "siteSlug": "optional-site-slug",
  "idempotencyKey": "optional-unique-key",
  "article": {
    "externalId": "cms-123",
    "title": "How to operationalize content distribution",
    "url": "https://example.com/blog/content-distribution",
    "slug": "how-to-operationalize-content-distribution",
    "excerpt": "A practical guide to turning articles into a social pipeline.",
    "bodyMarkdown": "## Heading\\n\\nArticle content",
    "featuredImageUrl": "https://example.com/image.png",
    "keywords": ["content", "seo"],
    "tags": ["automation", "social"],
    "category": "Operations",
    "publishedAt": "2026-03-13T08:00:00.000Z",
    "sourceMetadata": {
      "author": "Maximo SEO"
    }
  }
}
```

Behavior:

- The route is idempotent through `site_id + source_key`.
- Each webhook write records an `article_import_events` row.
- Shared-secret validation is enforced when `N8N_WEBHOOK_SHARED_SECRET` is configured.

## Publer Integration

The Publer service wrapper lives in [`src/lib/social/publer.ts`](/Users/tomermac/social-media-dist/src/lib/social/publer.ts).

Supported operations:

- create a publish or schedule request
- persist the publish job and attempts
- store the external job identifier when the response provides one
- mark calendar entries as scheduled, published, or failed
- enqueue retry metadata on failure

Recommended setup:

1. Create the social accounts in Publer.
2. Store the Publer account identifiers in the `social_accounts` table per site.
3. Set `PUBLER_API_KEY` and optional endpoint overrides if your Publer account uses a different base URL or path.

## KIE Integration

The KIE service wrapper lives in [`src/lib/social/kie.ts`](/Users/tomermac/social-media-dist/src/lib/social/kie.ts).

Behavior:

- submits a `nanobanana-2` image task
- polls task status
- resolves the download URL
- uploads the asset to Supabase Storage
- stores `post_assets` metadata

The default KIE endpoints are configurable through env vars to keep the integration resilient if KIE changes path conventions.

## Google Sheets Setup

1. Create a Google Cloud service account with Sheets API access.
2. Share the target spreadsheet with the service account email.
3. Put the JSON key into `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`.
4. Set `GOOGLE_SHEETS_SPREADSHEET_ID`.
5. Optionally set `GOOGLE_SHEETS_DEFAULT_SHEET`.

If Sheets credentials are missing, the rest of the app still works. Sync routes fail safely without exposing secrets client-side.

## Primary User Flows

### Create or enter a workspace

1. Sign in with Supabase-authenticated credentials.
2. Open `/dashboard`.
3. Create a workspace or select an existing site.

### Import an article

1. Open a site.
2. Go to `Articles`.
3. Import manually or send the n8n webhook payload.

### Generate drafts and assets

1. Open an article detail page.
2. Generate drafts.
3. Edit variants as needed.
4. Approve or reject the draft bundle.
5. Generate KIE visuals.

### Schedule and publish

1. Add approved variants to the calendar.
2. Open the calendar.
3. Sync scheduled entries to Publer or publish immediately.
4. Review results and retry failures from history.

### Sync to Sheets

1. Use the calendar or history views.
2. Trigger Sheets sync on selected entries.
3. Check `google_sheet_rows` for sync metadata.

## Deployment Notes

The repository includes [`render.yaml`](/Users/tomermac/social-media-dist/render.yaml) for a Node web service deployment. Keep all secrets in the deploy environment and never commit `.env.local`.

## Known Assumptions

- Publer account IDs and workspace mappings are stored in `social_accounts`.
- KIE endpoint paths can be overridden through env vars if the provider changes route naming.
- The draft generator uses OpenAI first, then OpenRouter, and falls back to deterministic templates only when no provider key exists.
- Google Sheets sync appends rows and tracks sync metadata in Supabase. If you need strict row updates by index, extend the `google_sheet_rows` mapping with a more specific reconciliation strategy.
