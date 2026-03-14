import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from './auth';

describe('sanitizeRedirectPath', () => {
  it('keeps safe internal paths intact', () => {
    expect(sanitizeRedirectPath('/sites/site-123/calendar?view=month#today')).toBe(
      '/sites/site-123/calendar?view=month#today',
    );
  });

  it('falls back for absolute external URLs', () => {
    expect(sanitizeRedirectPath('https://evil.example/phish')).toBe('/dashboard');
  });

  it('falls back for protocol-relative URLs', () => {
    expect(sanitizeRedirectPath('//evil.example/phish')).toBe('/dashboard');
  });

  it('falls back for auth routes to avoid redirect loops', () => {
    expect(sanitizeRedirectPath('/auth/login?redirect=/dashboard')).toBe('/dashboard');
  });
});
