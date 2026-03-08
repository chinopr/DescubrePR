import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { adminClient } = admin;

  const [places, businesses, events, promotions, services, users, pEvents, pBiz, pPromos, pServices] = await Promise.all([
    adminClient.from('places').select('*', { count: 'exact', head: true }),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }),
    adminClient.from('events').select('*', { count: 'exact', head: true }),
    adminClient.from('promotions').select('*', { count: 'exact', head: true }),
    adminClient.from('service_listings').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('events').select('*', { count: 'exact', head: true }).eq('estado', 'pending'),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('estado', 'pending'),
    adminClient.from('promotions').select('*', { count: 'exact', head: true }).eq('estado', 'pending'),
    adminClient.from('service_listings').select('*', { count: 'exact', head: true }).eq('estado', 'pending'),
  ]);

  return NextResponse.json({
    places: places.count || 0,
    businesses: businesses.count || 0,
    events: events.count || 0,
    promotions: promotions.count || 0,
    services: services.count || 0,
    users: users.count || 0,
    pendingEvents: pEvents.count || 0,
    pendingBusinesses: pBiz.count || 0,
    pendingPromos: pPromos.count || 0,
    pendingServices: pServices.count || 0,
  });
}
