import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from './auth';

describe('sanitizeRedirectPath', () => {
  it('returns fallback for invalid values', () => {
    expect(sanitizeRedirectPath(undefined, '/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectPath('https://evil.com', '/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectPath('//evil.com', '/dashboard')).toBe('/dashboard');
  });

  it('keeps safe in-app paths', () => {
    expect(sanitizeRedirectPath('/sites/abc?tab=settings', '/dashboard')).toBe(
      '/sites/abc?tab=settings',
    );
    expect(sanitizeRedirectPath('/dashboard#section', '/dashboard')).toBe('/dashboard#section');
  });
});
