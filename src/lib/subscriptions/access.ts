import type { Profile, Subscription } from '@/lib/types/database';

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set<Subscription['status']>([
  'trialing',
  'active',
  'past_due',
  'unpaid',
  'paused',
]);

export function hasActiveSubscription(subscription: Subscription | null | undefined) {
  return Boolean(subscription?.plan_id && subscription.status && ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status));
}

export function canPublishBusinessContent(params: {
  profile: Profile | null | undefined;
  subscription: Pick<Subscription, 'plan_id' | 'status'> | null | undefined;
  businessCount: number;
}) {
  const { profile, subscription, businessCount } = params;

  if (profile?.rol === 'admin') {
    return true;
  }

  return businessCount > 0 && hasActiveSubscription(subscription as Subscription | null | undefined);
}

export function getPublishAccessReason(params: {
  profile: Profile | null | undefined;
  subscription: Pick<Subscription, 'plan_id' | 'status'> | null | undefined;
  businessCount: number;
}) {
  const { profile, subscription, businessCount } = params;

  if (profile?.rol === 'admin') {
    return null;
  }

  if (businessCount <= 0) {
    return 'Necesitas tener al menos un negocio registrado para publicar eventos y promociones.';
  }

  if (!hasActiveSubscription(subscription as Subscription | null | undefined)) {
    return 'Necesitas un plan activo para publicar eventos y promociones.';
  }

  return null;
}
