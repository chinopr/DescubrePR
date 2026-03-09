import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, getClientIp } from './rate-limit';

describe('getClientIp', () => {
  it('prefers x-forwarded-for first ip', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '1.1.1.1, 2.2.2.2',
      },
    });

    expect(getClientIp(request)).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-real-ip': '3.3.3.3',
      },
    });

    expect(getClientIp(request)).toBe('3.3.3.3');
  });
});

describe('checkRateLimit', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T12:00:00.000Z'));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.useRealTimers();
    const globalStore = globalThis as typeof globalThis & {
      __descubreprRateLimitStore?: Map<string, { count: number; resetAt: number }>;
    };
    globalStore.__descubreprRateLimitStore?.clear();
  });

  it('allows requests until limit is reached', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '10.0.0.1',
      },
    });

    const first = checkRateLimit({ request, key: 'login', limit: 2, windowMs: 60_000 });
    const second = checkRateLimit({ request, key: 'login', limit: 2, windowMs: 60_000 });
    const third = checkRateLimit({ request, key: 'login', limit: 2, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('is disabled outside production', () => {
    process.env.NODE_ENV = 'development';

    const request = new Request('https://example.com');
    const result = checkRateLimit({ request, key: 'login', limit: 1, windowMs: 60_000 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });
});
