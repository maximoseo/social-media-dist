import { z } from 'zod';
import { SOCIAL_PLATFORMS } from './constants';

const socialPlatformEnum = z.enum(SOCIAL_PLATFORMS);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = loginSchema.extend({
  displayName: z.string().min(2).max(80),
});

export const workspaceCreateSchema = z.object({
  organizationName: z.string().min(2).max(100),
  siteName: z.string().min(2).max(100),
  domain: z.string().url(),
  timezone: z.string().min(2).max(64),
  brandVoice: z.string().min(10).max(400),
});

export const siteSettingsSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().url(),
  brandVoice: z.string().min(10).max(400),
  targetPlatforms: z.array(socialPlatformEnum).min(1),
  postingRules: z.array(z.string().min(2)).min(1),
  defaultHashtags: z.array(z.string().min(1)),
  imageStylePrompt: z.string().min(10).max(500),
  ctaDefaults: z.array(z.string().min(2)),
  utmCampaign: z.string().max(120).optional().or(z.literal('')),
  timezone: z.string().min(2).max(64),
  approvalRequired: z.boolean(),
  webhookSecret: z.string().min(8).max(120).optional().or(z.literal('')),
});

export const articlePayloadSchema = z.object({
  externalId: z.string().max(160).optional().nullable(),
  title: z.string().min(5).max(240),
  url: z.string().url(),
  slug: z.string().min(2).max(240),
  excerpt: z.string().max(600).optional().nullable(),
  bodyMarkdown: z.string().min(20).max(80_000).optional().nullable(),
  featuredImageUrl: z.string().url().optional().nullable(),
  keywords: z.array(z.string().min(1)).optional().default([]),
  tags: z.array(z.string().min(1)).optional().default([]),
  category: z.string().max(120).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  sourceMetadata: z.record(z.unknown()).optional().default({}),
});

export const manualArticleImportSchema = z.object({
  siteId: z.string().uuid(),
  article: articlePayloadSchema,
});

export const n8nWebhookSchema = z.object({
  siteId: z.string().uuid().optional(),
  siteSlug: z.string().min(2).optional(),
  idempotencyKey: z.string().min(8).max(160).optional(),
  article: articlePayloadSchema,
});

export const draftGenerationSchema = z.object({
  platforms: z.array(socialPlatformEnum).optional(),
  variationCount: z.number().int().min(1).max(4).default(2),
  includeEmojis: z.boolean().default(false),
});

export const assetGenerationSchema = z.object({
  variantId: z.string().uuid().optional(),
  regenerate: z.boolean().default(false),
});

export const calendarEntrySchema = z.object({
  draftId: z.string().uuid(),
  variantId: z.string().uuid(),
  socialAccountId: z.string().uuid().optional().nullable(),
  platform: socialPlatformEnum,
  scheduledFor: z.string().datetime(),
  timezone: z.string().min(2).max(64),
});

export const bulkPublishSchema = z.object({
  entryIds: z.array(z.string().uuid()).min(1),
  mode: z.enum(['schedule', 'publish_now']),
});

export const draftReviewSchema = z.object({
  approvalStatus: z.enum(['approved', 'rejected', 'pending_review']),
});

export const variantUpdateSchema = z.object({
  hook: z.string().nullable().optional(),
  body: z.string().min(10),
  cta: z.string().nullable().optional(),
  hashtags: z.array(z.string()).default([]),
});

export const syncEntrySchema = z.object({
  entryIds: z.array(z.string().uuid()).min(1),
});
