export type EngagementAction = 'view' | 'click';
export type EngagementTarget = 'place' | 'business' | 'event' | 'promotion' | 'service';

type TrackEngagementInput = {
  action: EngagementAction;
  targetType: EngagementTarget;
  targetId: string;
};

function getViewStorageKey(targetType: EngagementTarget, targetId: string) {
  return `engagement:view:${targetType}:${targetId}`;
}

export function trackEngagement({ action, targetType, targetId }: TrackEngagementInput) {
  if (typeof window === 'undefined') return;

  try {
    if (action === 'view') {
      const storageKey = getViewStorageKey(targetType, targetId);
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }
      window.sessionStorage.setItem(storageKey, '1');
    }
  } catch {
    // Ignore sessionStorage issues and continue with the network request.
  }

  const payload = JSON.stringify({ action, targetType, targetId });

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const sent = navigator.sendBeacon(
      '/api/engagement',
      new Blob([payload], { type: 'application/json' })
    );

    if (sent) return;
  }

  void fetch('/api/engagement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Ignore analytics transport failures.
  });
}
