import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin/audit-log';
import { requireAdmin } from '@/lib/admin/require-admin';
import { PLACE_CATEGORIES, MUNICIPIOS } from '@/lib/constants/municipios';
import { parseLocationInput } from '@/lib/maps/location-input';
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

  if (addressText && addressText.length > 600) {
    return { error: 'Dirección demasiado larga.' };
  }

  const parsedLocation = addressText ? parseLocationInput(addressText) : null;

  return {
    data: {
      nombre,
      descripcion,
      municipio,
      address_text: addressText,
      lat: parsedLocation?.lat ?? null,
      lng: parsedLocation?.lng ?? null,
      categorias,
      costo,
      fotos,
      estado: estado === 'pending' || estado === 'rejected' ? estado : 'published',
      fuente: 'admin' as const,
    },
  };
}

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const url = new URL(request.url);
  const search = getString(url.searchParams.get('search'));
  const municipio = getString(url.searchParams.get('municipio'));

  let query = admin.adminClient.from('places').select('*').order('nombre', { ascending: true }).limit(100);
  if (search) query = query.ilike('nombre', `%${search}%`);
  if (municipio) query = query.eq('municipio', municipio);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'No pudimos cargar lugares.' }, { status: 500 });
  }

  return NextResponse.json({ places: data || [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const payload = await request.json().catch(() => null);
  const validated = validatePlacePayload(payload);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.adminClient
    .from('places')
    .insert(validated.data)
    .select('id')
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'No pudimos crear el lugar.' }, { status: 400 });
  }

  await recordAdminAudit({
    adminClient: admin.adminClient,
    actorId: admin.userId,
    request,
    action: 'place.created',
    targetType: 'place',
    targetId: data.id,
    metadata: {
      nombre: validated.data.nombre,
      municipio: validated.data.municipio,
      estado: validated.data.estado,
      fuente: validated.data.fuente,
    },
  });

  return NextResponse.json({ ok: true });
}
