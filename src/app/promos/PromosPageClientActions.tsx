'use client';

import Link from 'next/link';
import PublishGateNotice from '@/components/ui/PublishGateNotice';
import { usePublishAccess } from '@/lib/subscriptions/use-publish-access';

export default function PromosPageClientActions() {
  const publishAccess = usePublishAccess();

  if (publishAccess.loading) {
    return null;
  }

  if (!publishAccess.canPublish) {
    return (
      <div className="w-full max-w-md">
        <PublishGateNotice
          reason={publishAccess.reason || 'Necesitas un plan activo para publicar promociones.'}
          businessCount={publishAccess.businessCount}
        />
      </div>
    );
  }

  return (
    <Link href="/submit/promo" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2">
      <span className="material-symbols-outlined">add_circle</span>
      Publicar Promoción
    </Link>
  );
}
