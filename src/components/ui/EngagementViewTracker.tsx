'use client';

import { useEffect } from 'react';
import { trackEngagement, type EngagementTarget } from '@/lib/engagement/tracking';

type Props = {
  targetType: EngagementTarget;
  targetId: string;
};

export default function EngagementViewTracker({ targetType, targetId }: Props) {
  useEffect(() => {
    trackEngagement({
      action: 'view',
      targetType,
      targetId,
    });
  }, [targetId, targetType]);

  return null;
}
