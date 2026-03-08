import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import { createUserNotification } from '@/lib/notifications/create-user-notification';

type ContentType = 'businesses' | 'events' | 'promotions' | 'service_listings';
type ModerationAction = 'approve' | 'reject';

const VALID_TABS = new Set<ContentType>(['businesses', 'events', 'promotions', 'service_listings']);

const TABS: { key: ContentType; label: string }[] = [
  { key: 'businesses', label: 'Negocios' },
  { key: 'events', label: 'Eventos' },
  { key: 'promotions', label: 'Promos' },
  { key: 'service_listings', label: 'Clasificados' },
];

const APPROVED_STATUS_BY_TAB: Record<ContentType, 'published' | 'approved'> = {
  businesses: 'published',
  events: 'approved',
  promotions: 'approved',
  service_listings: 'approved',
};

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const url = new URL(request.url);
  const tab = (url.searchParams.get('tab') || 'businesses') as ContentType;
  if (!VALID_TABS.has(tab)) {
    return NextResponse.json({ error: 'Tab inválido.' }, { status: 400 });
  }

  const { adminClient } = admin;
  const countResults = await Promise.all(
    TABS.map(current => adminClient.from(current.key).select('*', { count: 'exact', head: true }).eq('estado', 'pending'))
  );

  const counts = TABS.reduce<Record<ContentType, number>>((acc, current, index) => {
    acc[current.key] = countResults[index].count || 0;
    return acc;
  }, { businesses: 0, events: 0, promotions: 0, service_listings: 0 });

  const nameField = tab === 'businesses' ? 'nombre' : 'titulo';
  const { data, error } = await adminClient
    .from(tab)
    .select('*')
    .eq('estado', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'No pudimos cargar moderación.' }, { status: 500 });
  }

  const items = (data || []).map((record: Record<string, unknown>) => ({
    id: String(record.id),
    type: tab,
    title: String(record[nameField] || record.titulo || record.nombre || 'Sin título'),
    subtitle: String(record.municipio || (tab === 'promotions' ? 'Promoción' : '')),
    created_at: String(record.created_at),
  }));

  return NextResponse.json({ counts, items });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const payload = await request.json().catch(() => null) as {
    id?: string;
    tab?: ContentType;
    action?: ModerationAction;
  } | null;

  const id = payload?.id?.trim();
  const tab = payload?.tab;
  const action = payload?.action;

  if (!id || !tab || !action || !VALID_TABS.has(tab) || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { adminClient } = admin;
  const nextStatus = action === 'approve' ? APPROVED_STATUS_BY_TAB[tab] : 'rejected';
  const { error: updateError } = await adminClient.from(tab).update({ estado: nextStatus }).eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'No pudimos actualizar el estado.' }, { status: 400 });
  }

  let targetUserId: string | null = null;
  let itemName = 'contenido';

  if (tab === 'businesses') {
    const { data: record } = await adminClient.from('businesses').select('owner_id, nombre').eq('id', id).single();
    targetUserId = record?.owner_id || null;
    itemName = record?.nombre || itemName;
  } else if (tab === 'events') {
    const { data: record } = await adminClient.from('events').select('created_by, titulo').eq('id', id).single();
    targetUserId = record?.created_by || null;
    itemName = record?.titulo || itemName;
  } else if (tab === 'promotions') {
    const { data: promo } = await adminClient.from('promotions').select('business_id, titulo').eq('id', id).single();
    itemName = promo?.titulo || itemName;
    if (promo?.business_id) {
      const { data: business } = await adminClient.from('businesses').select('owner_id').eq('id', promo.business_id).single();
      targetUserId = business?.owner_id || null;
    }
  } else {
    const { data: record } = await adminClient.from('service_listings').select('user_id, titulo').eq('id', id).single();
    targetUserId = record?.user_id || null;
    itemName = record?.titulo || itemName;
  }

  if (targetUserId) {
    const typeLabel = TABS.find(t => t.key === tab)?.label?.slice(0, -1) || 'contenido';
    const approved = action === 'approve';
    await createUserNotification({
      adminClient,
      userId: targetUserId,
      titulo: approved ? `${typeLabel} aprobado` : `${typeLabel} rechazado`,
      mensaje: approved
        ? `Tu ${typeLabel.toLowerCase()} "${itemName}" ha sido aprobado y ya es visible.`
        : `Tu ${typeLabel.toLowerCase()} "${itemName}" fue rechazado. Revisa las condiciones y vuelve a intentar.`,
      link: approved ? '/dashboard' : null,
    });
  }

  await recordAdminAudit({
    adminClient,
    actorId: admin.userId,
    request,
    action: 'content.moderated',
    targetType: tab,
    targetId: id,
    metadata: {
      moderationAction: action,
      nextStatus,
      targetUserId,
      itemName,
    },
  });

  return NextResponse.json({ ok: true });
}
