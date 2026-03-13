import { describe, expect, it } from 'vitest';
import { draftGenerationSchema, manualArticleImportSchema } from './schemas';

describe('social schemas', () => {
  it('accepts a valid manual article import payload', () => {
    const payload = manualArticleImportSchema.parse({
      siteId: '9b6fb168-d48e-4980-aac9-8f56aa42eb7f',
      article: {
        title: 'Operational SEO workflows that scale',
        url: 'https://example.com/workflows',
        slug: 'operational-seo-workflows',
        excerpt: 'Build content systems that move from brief to publication.',
        bodyMarkdown: '## Heading\n\nLong-form content body',
        keywords: ['seo', 'content'],
        tags: ['ops'],
      },
    });

    expect(payload.article.title).toBe('Operational SEO workflows that scale');
    expect(payload.article.keywords).toEqual(['seo', 'content']);
  });

  it('defaults draft generation options safely', () => {
    const payload = draftGenerationSchema.parse({});
    expect(payload.variationCount).toBe(2);
    expect(payload.includeEmojis).toBe(false);
  });
});
