import { describe, expect, it } from 'vitest';
import { getBoostConfig, hasActiveBoost } from '@/lib/boosts/config';

describe('getBoostConfig', () => {
  it('returns null for inactive subscriptions or unsupported plans', () => {
    expect(getBoostConfig('basico', 'active')).toBeNull();
    expect(getBoostConfig('pro', 'canceled')).toBeNull();
    expect(getBoostConfig(null, 'active')).toBeNull();
  });

  it('returns config for eligible plans', () => {
    expect(getBoostConfig('pro', 'active')).toEqual({
      score: 10,
      durationDays: 7,
      label: 'Boost semanal',
    });
    expect(getBoostConfig('premium', 'trialing')).toEqual({
      score: 25,
      durationDays: 30,
      label: 'Boost extendido',
    });
  });
});

describe('hasActiveBoost', () => {
  it('detects active and expired boosts', () => {
    expect(
      hasActiveBoost({
        boost_score: 10,
        boost_expires_at: '2099-01-01T00:00:00.000Z',
      })
    ).toBe(true);

    expect(
      hasActiveBoost({
        boost_score: 10,
        boost_expires_at: '2000-01-01T00:00:00.000Z',
      })
    ).toBe(false);
  });
});
