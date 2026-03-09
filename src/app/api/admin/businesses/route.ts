import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim() || '';

  let query = admin.adminClient
    .from('businesses')
    .select('id, owner_id, nombre, municipio, estado, categorias, metrics_view_count, metrics_click_count, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (search) {
    query = query.ilike('nombre', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'No pudimos cargar negocios.' }, { status: 500 });
  }

  return NextResponse.json({ businesses: data || [] });
}
