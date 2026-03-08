import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await admin.adminClient
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'No pudimos cargar el audit log.' }, { status: 500 });
  }

  const actorIds = Array.from(
    new Set((data || []).map(log => log.actor_id).filter((value): value is string => Boolean(value)))
  );

  const actorMap = new Map<string, { nombre: string; email: string }>();
  if (actorIds.length > 0) {
    const { data: actors } = await admin.adminClient
      .from('profiles')
      .select('id, nombre, email')
      .in('id', actorIds);

    for (const actor of actors || []) {
      actorMap.set(actor.id, {
        nombre: actor.nombre,
        email: actor.email,
      });
    }
  }

  const logs = (data || []).map(log => ({
    ...log,
    actor_name: actorMap.get(log.actor_id)?.nombre || 'Admin',
    actor_email: actorMap.get(log.actor_id)?.email || null,
  }));

  return NextResponse.json({ logs });
}
