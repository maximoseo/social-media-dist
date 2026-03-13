import { z } from 'zod';
import type { Article, SiteBundle, SocialPlatform } from './types';
import { AI_MODELS } from './constants';

const aiResponseSchema = z.object({
  variants: z.array(
    z.object({
      platform: z.string(),
      hook: z.string().optional().nullable(),
      body: z.string(),
      cta: z.string().optional().nullable(),
      hashtags: z.array(z.string()).default([]),
      emojiPolicy: z.string().optional().nullable(),
    }),
  ),
});

function resolveProvider() {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.AI_MODEL || AI_MODELS.openai,
      extraHeaders: {} as Record<string, string>,
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.AI_MODEL || AI_MODELS.openrouter,
      extraHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Social Media Dist',
      },
    };
  }

  return null;
}

function buildSystemPrompt(site: SiteBundle, article: Article, platforms: SocialPlatform[], variationCount: number) {
  const postingRules = site.settings?.posting_rules?.join('; ') ?? 'Lead with the value of the article.';
  const hashtags = site.settings?.default_hashtags?.join(', ') ?? 'seo, contentmarketing';
  const voice = site.site.brand_voice ?? 'Confident, practical, and operational.';

  return `
You are generating social media copy for an internal publishing tool.

Site name: ${site.site.name}
Domain: ${site.site.domain}
Brand voice: ${voice}
Posting rules: ${postingRules}
Default hashtags: ${hashtags}
Preferred platforms: ${platforms.join(', ')}
Variations per request: ${variationCount}

Article title: ${article.title}
Article excerpt: ${article.excerpt ?? 'N/A'}
Article URL: ${article.url}
Article body:
${article.body_markdown ?? article.excerpt ?? article.title}

Return JSON in the shape:
{
  "variants": [
    {
      "platform": "linkedin",
      "hook": "optional opening hook",
      "body": "full body text",
      "cta": "optional CTA",
      "hashtags": ["array", "of", "hashtags"],
      "emojiPolicy": "none|light|moderate"
    }
  ]
}

Generate exactly ${platforms.length * variationCount} variants. Make sure each platform receives ${variationCount} variations.
      `.trim();
}

function buildFallbackVariants(article: Article, site: SiteBundle, platforms: SocialPlatform[], variationCount: number) {
  const ctaDefaults = site.settings?.cta_defaults ?? ['Read the full article'];
  const hashtags = site.settings?.default_hashtags ?? ['seo', 'contentmarketing'];

  return platforms.flatMap((platform) =>
    Array.from({ length: variationCount }, (_, index) => ({
      platform,
      hook: index === 0 ? `New on ${site.site.name}: ${article.title}` : `Angle ${index + 1}: ${article.title}`,
      body: `${article.title}\n\n${article.excerpt ?? 'Fresh article imported and ready for distribution.'}\n\nTailored for ${platform} with ${site.site.name}'s brand voice.`,
      cta: ctaDefaults[index % ctaDefaults.length] ?? ctaDefaults[0],
      hashtags,
      emojiPolicy: platform === 'instagram' ? 'light' : 'none',
    })),
  );
}

export async function generateSocialVariants(params: {
  article: Article;
  site: SiteBundle;
  platforms: SocialPlatform[];
  variationCount: number;
}) {
  const provider = resolveProvider();

  if (!provider) {
    return {
      provider: 'fallback',
      model: 'heuristic-template',
      variants: buildFallbackVariants(params.article, params.site, params.platforms, params.variationCount),
    };
  }

  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
      ...provider.extraHeaders,
    } satisfies Record<string, string>,
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(params.site, params.article, params.platforms, params.variationCount),
        },
        {
          role: 'user',
          content:
            'Generate the requested platform variants and return only JSON matching the required shape.',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI generation failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI generation returned an empty payload.');
  }

  const parsed = aiResponseSchema.parse(JSON.parse(content));
  return {
    provider: provider.provider,
    model: provider.model,
    variants: parsed.variants,
  };
}
