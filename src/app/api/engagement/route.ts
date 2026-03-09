import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { EngagementAction, EngagementTarget } from '@/lib/engagement/tracking';

const VALID_ACTIONS = new Set<EngagementAction>(['view', 'click']);
const VALID_TARGETS = new Set<EngagementTarget>(['place', 'business', 'event', 'promotion', 'service']);

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as {
    action?: EngagementAction;
    targetType?: EngagementTarget;
    targetId?: string;
  } | null;

  const action = payload?.action;
  const targetType = payload?.targetType;
  const targetId = payload?.targetId?.trim();

  if (!action || !targetType || !targetId || !VALID_ACTIONS.has(action) || !VALID_TARGETS.has(targetType)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.rpc('increment_content_metric', {
      metric_target_type: targetType,
      metric_target_id: targetId,
      metric_kind: action,
    });

    if (error) {
      return NextResponse.json({ error: 'No pudimos registrar la métrica.' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'No pudimos registrar la métrica.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
