import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPushConfigured } from '@/lib/pwa/push';

export const runtime = 'nodejs';

type SubscriptionPayload = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePayload(payload: SubscriptionPayload | null) {
  const endpoint = getString(payload?.endpoint);
  const p256dh = getString(payload?.keys?.p256dh);
  const auth = getString(payload?.keys?.auth);
  const expirationTime =
    typeof payload?.expirationTime === 'number' && Number.isFinite(payload.expirationTime)
      ? payload.expirationTime
      : null;

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return { endpoint, p256dh, auth, expirationTime };
}

export async function POST(request: Request) {
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

  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Suscripción inválida.' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      expiration_time: payload.expirationTime,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar la suscripción.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as { endpoint?: string } | null;
  const endpoint = getString(payload?.endpoint);

  const adminClient = createAdminClient();
  let query = adminClient.from('push_subscriptions').delete().eq('user_id', user.id);
  if (endpoint) {
    query = query.eq('endpoint', endpoint);
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: 'No pudimos eliminar la suscripción.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
