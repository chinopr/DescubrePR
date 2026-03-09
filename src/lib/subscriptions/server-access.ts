import { createAdminClient } from '@/lib/supabase/admin';
import { canPublishBusinessContent, getPublishAccessReason } from '@/lib/subscriptions/access';
import type { Profile, Subscription } from '@/lib/types/database';

export async function getServerPublishAccess(userId: string) {
  const adminClient = createAdminClient();

  const [profileRes, businessesRes, subscriptionRes] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', userId).maybeSingle(),
    adminClient.from('businesses').select('id', { count: 'exact', head: false }).eq('owner_id', userId),
    adminClient.from('subscriptions').select('plan_id, status').eq('user_id', userId).maybeSingle(),
  ]);

  const profile = (profileRes.data || null) as Profile | null;
  const subscription = (subscriptionRes.data || null) as Pick<Subscription, 'plan_id' | 'status'> | null;
  const businessCount = businessesRes.count ?? businessesRes.data?.length ?? 0;

  return {
    canPublish: canPublishBusinessContent({ profile, subscription, businessCount }),
    reason: getPublishAccessReason({ profile, subscription, businessCount }),
    profile,
    businessCount,
    subscription,
  };
}
