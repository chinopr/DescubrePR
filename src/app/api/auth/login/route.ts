import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBotProtection } from '@/lib/security/bot-protection';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateLoginInput } from '@/lib/validation/forms';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    request,
    key: 'auth:login',
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
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
  const validated = validateLoginInput(payload);

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
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return NextResponse.json(
      { error: 'No pudimos iniciar sesión con esas credenciales.' },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, redirectTo: '/profile' });
}
