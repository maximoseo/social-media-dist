type BucketState = {
  count: number;
  resetAt: number;
};

const globalBucket = globalThis as typeof globalThis & {
  __socialRateLimitBuckets?: Map<string, BucketState>;
};

const buckets = globalBucket.__socialRateLimitBuckets ?? new Map<string, BucketState>();
globalBucket.__socialRateLimitBuckets = buckets;

export function assertRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (bucket.count >= maxRequests) {
    throw new Error('Rate limit exceeded. Try again in a moment.');
  }

  bucket.count += 1;
}
