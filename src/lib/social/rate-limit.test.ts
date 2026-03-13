import { describe, expect, it } from 'vitest';
import { assertRateLimit } from './rate-limit';

describe('assertRateLimit', () => {
  it('throws after the allowed request count is exceeded', () => {
    const key = `test-${Date.now()}`;
    assertRateLimit(key, 1, 60_000);

    expect(() => assertRateLimit(key, 1, 60_000)).toThrow('Rate limit exceeded');
  });
});
