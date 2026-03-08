import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import type { UserRole } from '@/lib/types/database';

const VALID_ROLES = new Set<UserRole>(['user', 'business', 'admin']);

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { adminClient } = admin;
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'No pudimos cargar usuarios.' }, { status: 500 });
  }

  return NextResponse.json({ users: data || [] });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const payload = await request.json().catch(() => null) as { userId?: string; newRole?: UserRole } | null;
  const userId = payload?.userId?.trim();
  const newRole = payload?.newRole;

  if (!userId || !newRole || !VALID_ROLES.has(newRole)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (userId === admin.userId && newRole !== 'admin') {
    return NextResponse.json({ error: 'No puedes quitarte tu propio acceso admin.' }, { status: 400 });
  }

  const { adminClient } = admin;
  const { data: currentUser } = await adminClient
    .from('profiles')
    .select('rol, nombre, email')
    .eq('id', userId)
    .maybeSingle();

  const { error } = await adminClient.from('profiles').update({ rol: newRole }).eq('id', userId);

  if (error) {
    return NextResponse.json({ error: 'No pudimos actualizar el rol.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient,
    actorId: admin.userId,
    request,
    action: 'user.role.updated',
    targetType: 'profile',
    targetId: userId,
    metadata: {
      previousRole: currentUser?.rol ?? null,
      newRole,
      targetName: currentUser?.nombre ?? null,
      targetEmail: currentUser?.email ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
