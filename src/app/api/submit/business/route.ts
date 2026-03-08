import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBotProtection } from '@/lib/security/bot-protection';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateBusinessSubmission } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    request,
    key: 'submit:business',
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Has enviado demasiados negocios. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const validated = validateBusinessSubmission(payload);

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

  const { error } = await supabase.from('businesses').insert({
    owner_id: user.id,
    nombre: validated.data.nombre,
    descripcion: validated.data.descripcion,
    municipio: validated.data.municipio,
    address_text: validated.data.addressText,
    telefono: validated.data.telefono,
    whatsapp: validated.data.whatsapp,
    instagram: validated.data.instagram,
    website: validated.data.website,
    categorias: validated.data.categorias,
    estado: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el negocio.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
