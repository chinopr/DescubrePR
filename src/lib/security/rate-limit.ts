type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type RateLimitOptions = {
  request: Request;
  key: string;
  limit: number;
  windowMs: number;
};

const globalStore = globalThis as typeof globalThis & {
  __descubreprRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore() {
  if (!globalStore.__descubreprRateLimitStore) {
    globalStore.__descubreprRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalStore.__descubreprRateLimitStore;
}

function cleanupExpiredEntries(now: number) {
  const store = getStore();

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export function checkRateLimit({
  request,
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  if (process.env.NODE_ENV !== 'production') {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: limit,
    };
  }

  const now = Date.now();
  cleanupExpiredEntries(now);

  const ip = getClientIp(request);
  const store = getStore();
  const storeKey = `${key}:${ip}`;
  const existing = store.get(storeKey);

  if (!existing || existing.resetAt <= now) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(limit - 1, 0),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
      remaining: 0,
    };
  }

  existing.count += 1;
  store.set(storeKey, existing);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    remaining: Math.max(limit - existing.count, 0),
  };
}
