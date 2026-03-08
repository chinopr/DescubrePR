import { getClientIp } from '@/lib/security/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

type AuditMetadata = Record<string, unknown>;

export async function recordAdminAudit({
  adminClient,
  actorId,
  request,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  adminClient: ReturnType<typeof createAdminClient>;
  actorId: string;
  request: Request;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: AuditMetadata;
}) {
  const { error } = await adminClient.from('admin_audit_logs').insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata,
    ip_address: getClientIp(request),
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  if (error) {
    console.error('Failed to persist admin audit log', error);
  }
}
