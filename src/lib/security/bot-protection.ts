import { getClientIp } from '@/lib/security/rate-limit';

type BotProtectionResult =
  | { success: true }
  | { success: false; error: string };

const MIN_FORM_FILL_MS = 1200;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isCaptchaConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
  );
}

export async function verifyBotProtection({
  request,
  payload,
}: {
  request: Request;
  payload: unknown;
}): Promise<BotProtectionResult> {
  const body = isRecord(payload) ? payload : {};
  const honeypot = getString(body.contactWebsite);

  if (honeypot) {
    return { success: false, error: 'Solicitud inválida.' };
  }

  const startedAt =
    typeof body.startedAt === 'number'
      ? body.startedAt
      : Number.parseInt(getString(body.startedAt), 10);

  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FORM_FILL_MS) {
    return { success: false, error: 'Espera un momento y vuelve a intentarlo.' };
  }

  if (!isCaptchaConfigured()) {
    return { success: true };
  }

  const captchaToken = getString(body.captchaToken);
  if (!captchaToken) {
    return { success: false, error: 'Confirma que eres humano para continuar.' };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: captchaToken,
        remoteip: getClientIp(request),
      }),
      cache: 'no-store',
    });

    const result = (await response.json().catch(() => null)) as { success?: boolean } | null;

    if (!response.ok || !result?.success) {
      return { success: false, error: 'No pudimos validar la verificación humana.' };
    }
  } catch {
    return { success: false, error: 'No pudimos validar la verificación humana.' };
  }

  return { success: true };
}
