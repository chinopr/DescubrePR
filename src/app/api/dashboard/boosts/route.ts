import { NextResponse } from 'next/server';
import { getBoostConfig } from '@/lib/boosts/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { BoostableTarget, Subscription } from '@/lib/types/database';

const ACTIVE_PUBLIC_STATUS: Record<BoostableTarget, 'published' | 'approved'> = {
  business: 'published',
  event: 'approved',
  promotion: 'approved',
  service: 'approved',
};

type OwnedRecord = {
  id: string;
  estado: string;
  boost_score: number;
  boost_expires_at: string | null;
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as {
    targetType?: BoostableTarget;
    targetId?: string;
  } | null;

  const targetType = payload?.targetType;
  const targetId = payload?.targetId?.trim();

  if (!targetType || !targetId || !['business', 'event', 'promotion', 'service'].includes(targetType)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const activeSubscription = subscription as Subscription | null;
  const boostConfig = getBoostConfig(activeSubscription?.plan_id, activeSubscription?.status);

  if (!boostConfig) {
    return NextResponse.json(
      { error: 'Necesitas un plan Pro o Premium activo para usar boosts.' },
      { status: 403 }
    );
  }

  const ownedRecord = await getOwnedRecord({ adminClient, targetType, targetId, userId: user.id });
  if (!ownedRecord) {
    return NextResponse.json({ error: 'No encontramos ese contenido en tu cuenta.' }, { status: 404 });
  }

  if (ownedRecord.estado !== ACTIVE_PUBLIC_STATUS[targetType]) {
    return NextResponse.json(
      { error: 'Solo puedes impulsar contenido ya publicado o aprobado.' },
      { status: 400 }
    );
  }

  const boostExpiresAt = new Date();
  boostExpiresAt.setDate(boostExpiresAt.getDate() + boostConfig.durationDays);

  const table = getTableName(targetType);
  const { error } = await adminClient
    .from(table)
    .update({
      boost_score: boostConfig.score,
      boost_expires_at: boostExpiresAt.toISOString(),
    })
    .eq('id', targetId);

  if (error) {
    return NextResponse.json({ error: 'No pudimos activar el boost.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    boostScore: boostConfig.score,
    boostExpiresAt: boostExpiresAt.toISOString(),
  });
}

function getTableName(targetType: BoostableTarget) {
  switch (targetType) {
    case 'business':
      return 'businesses';
    case 'event':
      return 'events';
    case 'promotion':
      return 'promotions';
    case 'service':
      return 'service_listings';
  }
}

async function getOwnedRecord({
  adminClient,
  targetType,
  targetId,
  userId,
}: {
  adminClient: ReturnType<typeof createAdminClient>;
  targetType: BoostableTarget;
  targetId: string;
  userId: string;
}): Promise<OwnedRecord | null> {
  if (targetType === 'business') {
    const { data } = await adminClient
      .from('businesses')
      .select('id, estado, boost_score, boost_expires_at')
      .eq('id', targetId)
      .eq('owner_id', userId)
      .maybeSingle();
    return data as OwnedRecord | null;
  }

  if (targetType === 'event') {
    const { data } = await adminClient
      .from('events')
      .select('id, estado, boost_score, boost_expires_at')
      .eq('id', targetId)
      .eq('created_by', userId)
      .maybeSingle();
    return data as OwnedRecord | null;
  }

  if (targetType === 'service') {
    const { data } = await adminClient
      .from('service_listings')
      .select('id, estado, boost_score, boost_expires_at')
      .eq('id', targetId)
      .eq('user_id', userId)
      .maybeSingle();
    return data as OwnedRecord | null;
  }

  const { data: promo } = await adminClient
    .from('promotions')
    .select('id, estado, boost_score, boost_expires_at, business_id')
    .eq('id', targetId)
    .maybeSingle();

  if (!promo?.business_id) {
    return null;
  }

  const { data: business } = await adminClient
    .from('businesses')
    .select('owner_id')
    .eq('id', promo.business_id)
    .maybeSingle();

  if (!business || business.owner_id !== userId) {
    return null;
  }

  return promo as OwnedRecord;
}
