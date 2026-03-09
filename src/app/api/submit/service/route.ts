import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBotProtection } from '@/lib/security/bot-protection';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateServiceSubmission } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    request,
    key: 'submit:service',
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Has enviado demasiados anuncios. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const validated = validateServiceSubmission(payload);

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

  const { error } = await supabase.from('service_listings').insert({
    user_id: user.id,
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
    estado: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el anuncio.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
