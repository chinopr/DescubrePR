import webpush from 'web-push';
import type { Notification, PushSubscriptionRecord } from '@/lib/types/database';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

export type PushPayload = {
  title: string;
  body: string;
  url?: string | null;
  tag?: string | null;
  notificationId?: string | null;
  icon?: string;
  badge?: string;
};

let vapidConfigured = false;

function configureWebPush() {
  if (vapidConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:soporte@descubrepr.com';

  if (!publicKey || !privateKey) {
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export function isPushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function toWebPushSubscription(subscription: PushSubscriptionRecord) {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expiration_time,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
}

export function buildPushPayloadFromNotification(notification: Pick<Notification, 'id' | 'titulo' | 'mensaje' | 'link'>): PushPayload {
  return {
    title: notification.titulo,
    body: notification.mensaje,
    url: notification.link || '/profile',
    tag: `notification:${notification.id}`,
    notificationId: notification.id,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };
}

export async function sendPushToUser({
  adminClient,
  userId,
  payload,
}: {
  adminClient: AdminClient;
  userId: string;
  payload: PushPayload;
}) {
  if (!isPushConfigured()) {
    return { sent: 0, removed: 0, skipped: true };
  }

  configureWebPush();

  const { data: subscriptions } = await adminClient
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  const records = (subscriptions || []) as PushSubscriptionRecord[];
  if (records.length === 0) {
    return { sent: 0, removed: 0, skipped: false };
  }

  let sent = 0;
  let removed = 0;

  for (const subscription of records) {
    try {
      await webpush.sendNotification(
        toWebPushSubscription(subscription),
        JSON.stringify(payload)
      );
      sent += 1;
    } catch (error) {
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? Number((error as { statusCode?: number }).statusCode)
          : null;

      if (statusCode === 404 || statusCode === 410) {
        await adminClient.from('push_subscriptions').delete().eq('id', subscription.id);
        removed += 1;
        continue;
      }

      console.error('Failed to send push notification', error);
    }
  }

  return { sent, removed, skipped: false };
}
