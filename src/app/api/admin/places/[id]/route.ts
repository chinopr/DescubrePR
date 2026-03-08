import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import { PLACE_CATEGORIES, MUNICIPIOS } from '@/lib/constants/municipios';
import type { PlaceCost } from '@/lib/types/database';

const MUNICIPIOS_SET = new Set<string>(MUNICIPIOS);
const PLACE_CATEGORIES_SET = new Set<string>(PLACE_CATEGORIES);
const PLACE_COSTS = new Set<PlaceCost>(['free', 'paid', 'varies']);

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(value: unknown) {
  const normalized = getString(value);
  return normalized.length > 0 ? normalized : null;
}

function sanitizeFotos(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function sanitizeCategorias(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
    )
  ).filter(cat => PLACE_CATEGORIES_SET.has(cat as typeof PLACE_CATEGORIES[number]));
}

function validatePlacePayload(payload: unknown) {
  const body = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const nombre = getString(body.nombre);
  const descripcion = getOptionalString(body.descripcion);
  const municipio = getString(body.municipio);
  const addressText = getOptionalString(body.addressText);
  const categorias = sanitizeCategorias(body.categorias);
  const costo = getString(body.costo) as PlaceCost;
  const fotos = sanitizeFotos(body.fotos);
  const estado = getString(body.estado);

  if (nombre.length < 2 || nombre.length > 120) {
    return { error: 'Nombre inválido.' };
  }

  if (!MUNICIPIOS_SET.has(municipio)) {
    return { error: 'Municipio inválido.' };
  }

  if (!PLACE_COSTS.has(costo)) {
    return { error: 'Costo inválido.' };
  }

  if (descripcion && descripcion.length > 1500) {
    return { error: 'Descripción demasiado larga.' };
  }

  if (addressText && addressText.length > 200) {
    return { error: 'Dirección demasiado larga.' };
  }

  return {
    data: {
      nombre,
      descripcion,
      municipio,
      address_text: addressText,
      categorias,
      costo,
      fotos,
      estado: estado === 'pending' || estado === 'rejected' ? estado : 'published',
    },
  };
}

export const runtime = 'nodejs';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const { data, error } = await admin.adminClient.from('places').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Lugar no encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ place: data });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const validated = validatePlacePayload(payload);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { error } = await admin.adminClient.from('places').update(validated.data).eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el lugar.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient: admin.adminClient,
    actorId: admin.userId,
    request,
    action: 'place.updated',
    targetType: 'place',
    targetId: id,
    metadata: {
      nombre: validated.data.nombre,
      municipio: validated.data.municipio,
      estado: validated.data.estado,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const { data: currentPlace } = await admin.adminClient
    .from('places')
    .select('nombre, municipio')
    .eq('id', id)
    .maybeSingle();
  const { error } = await admin.adminClient.from('places').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'No pudimos eliminar el lugar.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient: admin.adminClient,
    actorId: admin.userId,
    request: _,
    action: 'place.deleted',
    targetType: 'place',
    targetId: id,
    metadata: {
      nombre: currentPlace?.nombre ?? null,
      municipio: currentPlace?.municipio ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
