import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBotProtection } from '@/lib/security/bot-protection';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateRegisterInput } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    request,
    key: 'auth:register',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos de registro. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const validateOnly =
    typeof payload === 'object' &&
    payload !== null &&
    'validateOnly' in payload &&
    payload.validateOnly === true;
  const validated = validateRegisterInput(payload);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const botCheck = await verifyBotProtection({ request, payload });
  if (!botCheck.success) {
    return NextResponse.json({ error: botCheck.error }, { status: 400 });
  }

  if (validateOnly) {
    return NextResponse.json({ ok: true, redirectTo: '/profile' });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.nombre,
        name: validated.data.nombre,
        role: validated.data.rol,
        nombre: validated.data.nombre,
        rol: validated.data.rol,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: 'No pudimos completar el registro con esos datos.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    redirectTo: data.session ? '/profile' : '/auth/login?registered=1',
  });
}
