import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasAdminAccess } from './is-admin';

export type AdminContext = {
  userId: string;
  adminClient: ReturnType<typeof createAdminClient>;
};

export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if (!hasAdminAccess(profile?.rol, user)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
  }

  return {
    userId: user.id,
    adminClient: createAdminClient(),
  };
}
