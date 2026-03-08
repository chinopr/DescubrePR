import type { Notification } from '@/lib/types/database';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildPushPayloadFromNotification, sendPushToUser } from '@/lib/pwa/push';

type AdminClient = ReturnType<typeof createAdminClient>;

export async function createUserNotification({
  adminClient,
  userId,
  titulo,
  mensaje,
  link = null,
}: {
  adminClient: AdminClient;
  userId: string;
  titulo: string;
  mensaje: string;
  link?: string | null;
}) {
  const { data, error } = await adminClient
    .from('notifications')
    .insert({
      user_id: userId,
      titulo,
      mensaje,
      link,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Failed to create notification', error);
    return null;
  }

  const notification = data as Notification;

  await sendPushToUser({
    adminClient,
    userId,
    payload: buildPushPayloadFromNotification(notification),
  });

  return notification;
}
