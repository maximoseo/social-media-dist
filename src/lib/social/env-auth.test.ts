import { describe, expect, it } from 'vitest';
import { getSupabasePublicConfigStatus, hasBrowserSupabaseConfig } from './env';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe('supabase public env config', () => {
  it('reports missing vars when values are empty', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    const status = getSupabasePublicConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.missing).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
    expect(hasBrowserSupabaseConfig()).toBe(false);
    resetEnv();
  });

  it('reports invalid values when url or key is malformed', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'short';

    const status = getSupabasePublicConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.invalid).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(status.invalid).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    resetEnv();
  });

  it('is configured when both public keys are valid', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_payload_signature';

    const status = getSupabasePublicConfigStatus();

    expect(status.configured).toBe(true);
    expect(status.missing).toHaveLength(0);
    expect(status.invalid).toHaveLength(0);
    expect(hasBrowserSupabaseConfig()).toBe(true);
    resetEnv();
  });
});
