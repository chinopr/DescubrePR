import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createUserNotification } from '@/lib/notifications/create-user-notification';
import { isPushConfigured } from '@/lib/pwa/push';

export const runtime = 'nodejs';

export async function POST() {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: 'Push notifications no configuradas.' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const notification = await createUserNotification({
    adminClient,
    userId: user.id,
    titulo: 'Push activadas',
    mensaje: 'DescubrePR ya puede enviarte alertas en este dispositivo.',
    link: '/profile',
  });

  if (!notification) {
    return NextResponse.json({ error: 'No pudimos enviar la prueba push.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
