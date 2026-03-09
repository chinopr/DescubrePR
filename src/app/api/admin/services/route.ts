import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import { validateServiceSubmission } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const payload = await request.json().catch(() => null);
  const validated = validateServiceSubmission(payload);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from('service_listings')
    .insert({
      user_id: admin.userId,
      tipo: validated.data.tipo,
      titulo: validated.data.titulo,
      descripcion: validated.data.descripcion,
      municipio: validated.data.municipio,
      lat: validated.data.lat,
      lng: validated.data.lng,
      precio: validated.data.precio,
      telefono: validated.data.telefono,
      whatsapp: validated.data.whatsapp,
      fotos: validated.data.fotos,
      estado: 'approved',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No pudimos crear el clasificado.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient: admin.adminClient,
    actorId: admin.userId,
    request,
    action: 'service.created',
    targetType: 'service',
    targetId: data.id,
    metadata: {
      tipo: validated.data.tipo,
      titulo: validated.data.titulo,
      municipio: validated.data.municipio,
      lat: validated.data.lat,
      lng: validated.data.lng,
      estado: 'approved',
    },
  });

  return NextResponse.json({ ok: true, id: data.id });
}
