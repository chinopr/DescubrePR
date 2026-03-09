import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import { validatePromoSubmission } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const payload = await request.json().catch(() => null);
  const validated = validatePromoSubmission(payload);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data: business } = await admin.adminClient
    .from('businesses')
    .select('id, nombre')
    .eq('id', validated.data.businessId)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'El negocio seleccionado no existe.' }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from('promotions')
    .insert({
      business_id: validated.data.businessId,
      titulo: validated.data.titulo,
      descripcion: validated.data.descripcion,
      start_date: validated.data.startDate,
      end_date: validated.data.endDate,
      codigo: validated.data.codigo,
      condiciones: validated.data.condiciones,
      fotos: validated.data.fotos,
      estado: 'approved',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No pudimos crear la promoción.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient: admin.adminClient,
    actorId: admin.userId,
    request,
    action: 'promotion.created',
    targetType: 'promotion',
    targetId: data.id,
    metadata: {
      business_id: validated.data.businessId,
      business_name: business.nombre,
      titulo: validated.data.titulo,
      estado: 'approved',
    },
  });

  return NextResponse.json({ ok: true, id: data.id });
}
