import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBotProtection } from '@/lib/security/bot-protection';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getServerPublishAccess } from '@/lib/subscriptions/server-access';
import { validateEventSubmission } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    request,
    key: 'submit:event',
    limit: 15,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Has enviado demasiados eventos. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const validated = validateEventSubmission(payload);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const botCheck = await verifyBotProtection({ request, payload });
  if (!botCheck.success) {
    return NextResponse.json({ error: botCheck.error }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const publishAccess = await getServerPublishAccess(user.id);
  if (!publishAccess.canPublish) {
    return NextResponse.json(
      { error: publishAccess.reason || 'No tienes permisos para publicar eventos.' },
      { status: 403 }
    );
  }

  if (validated.data.businessId) {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', validated.data.businessId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'El negocio asociado no es válido.' }, { status: 400 });
    }
  }

  const { error } = await supabase.from('events').insert({
    created_by: user.id,
    business_id: validated.data.businessId,
    titulo: validated.data.titulo,
    descripcion: validated.data.descripcion,
    start_datetime: validated.data.startDatetime,
    end_datetime: validated.data.endDatetime,
    municipio: validated.data.municipio,
    costo: validated.data.costo,
    link: validated.data.link,
    whatsapp: validated.data.whatsapp,
    fotos: validated.data.fotos,
    estado: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el evento.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
