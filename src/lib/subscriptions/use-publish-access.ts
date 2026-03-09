'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { canPublishBusinessContent, getPublishAccessReason } from '@/lib/subscriptions/access';
import type { Subscription } from '@/lib/types/database';

type PublishAccessState = {
  loading: boolean;
  canPublish: boolean;
  reason: string | null;
  businessCount: number;
  isAdmin: boolean;
  hasActivePlan: boolean;
};

export function usePublishAccess() {
  const { user, profile, loading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [state, setState] = useState<PublishAccessState>({
    loading: true,
    canPublish: false,
    reason: null,
    businessCount: 0,
    isAdmin: false,
    hasActivePlan: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveAccess() {
      if (authLoading) return;

      if (!user) {
        if (!cancelled) {
          setState({
            loading: false,
            canPublish: false,
            reason: 'Debes iniciar sesión.',
            businessCount: 0,
            isAdmin: false,
            hasActivePlan: false,
          });
        }
        return;
      }

      const [businessesRes, subscriptionRes] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: false }).eq('owner_id', user.id),
        supabase.from('subscriptions').select('plan_id, status').eq('user_id', user.id).maybeSingle(),
      ]);

      if (cancelled) return;

      const businessCount = businessesRes.count ?? businessesRes.data?.length ?? 0;
      const subscription = (subscriptionRes.data || null) as Pick<Subscription, 'plan_id' | 'status'> | null;
      const canPublish = canPublishBusinessContent({ profile, subscription, businessCount });

      setState({
        loading: false,
        canPublish,
        reason: getPublishAccessReason({ profile, subscription, businessCount }),
        businessCount,
        isAdmin: profile?.rol === 'admin',
        hasActivePlan: Boolean(subscription?.plan_id),
      });
    }

    void resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [authLoading, profile, supabase, user]);

  return state;
}
