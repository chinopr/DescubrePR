import type { BoostableTarget, SubscriptionStatus } from '@/lib/types/database';

export const BOOST_TARGETS: BoostableTarget[] = ['business', 'event', 'promotion', 'service'];

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>(['trialing', 'active', 'past_due', 'unpaid', 'paused']);

type BoostPlanConfig = {
  score: number;
  durationDays: number;
  label: string;
};

const BOOST_PLAN_CONFIG: Record<string, BoostPlanConfig> = {
  pro: {
    score: 10,
    durationDays: 7,
    label: 'Boost semanal',
  },
  premium: {
    score: 25,
    durationDays: 30,
    label: 'Boost extendido',
  },
};

export function getBoostConfig(planId: string | null | undefined, status?: SubscriptionStatus | null) {
  if (!planId || (status && !ACTIVE_SUBSCRIPTION_STATUSES.has(status))) {
    return null;
  }

  return BOOST_PLAN_CONFIG[planId] || null;
}

export function hasActiveBoost(record: { boost_score?: number | null; boost_expires_at?: string | null }) {
  if (!record.boost_score || record.boost_score <= 0 || !record.boost_expires_at) {
    return false;
  }

  return new Date(record.boost_expires_at).getTime() > Date.now();
}

export function formatBoostExpiry(value: string | null | undefined) {
  if (!value) return null;

  return new Date(value).toLocaleDateString('es-PR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getBoostTargetLabel(targetType: BoostableTarget) {
  switch (targetType) {
    case 'business':
      return 'negocio';
    case 'event':
      return 'evento';
    case 'promotion':
      return 'promoción';
    case 'service':
      return 'anuncio';
    default:
      return 'contenido';
  }
}
