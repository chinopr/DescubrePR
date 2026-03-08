/// <reference lib="webworker" />

type PushEventPayload = {
  title?: string;
  body?: string;
  url?: string | null;
  tag?: string | null;
  notificationId?: string | null;
  icon?: string;
  badge?: string;
};

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', ((rawEvent: Event) => {
  const event = rawEvent as PushEvent;
  const payload = (() => {
    try {
      return (event.data?.json() || {}) as PushEventPayload;
    } catch {
      return {
        title: 'DescubrePR',
        body: event.data?.text() || 'Tienes una nueva notificación.',
      } satisfies PushEventPayload;
    }
  })();

  const title = payload.title || 'DescubrePR';
  const body = payload.body || 'Tienes una nueva notificación.';

  event.waitUntil(
    sw.registration.showNotification(title, {
      body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      tag: payload.tag || 'descubrepr-notification',
      data: {
        url: payload.url || '/profile',
        notificationId: payload.notificationId || null,
      },
    })
  );
}) as EventListener);

sw.addEventListener('notificationclick', ((rawEvent: Event) => {
  const event = rawEvent as NotificationEvent;
  event.notification.close();

  const targetUrl = String((event.notification.data as { url?: string } | undefined)?.url || '/profile');

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url.includes(sw.location.origin)) {
          client.postMessage({ type: 'notification-click', url: targetUrl });
          return client.focus();
        }
      }

      if (sw.clients.openWindow) {
        return sw.clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
}) as EventListener);
