'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

function base64UrlToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export default function PushNotificationCard() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const pwaDevEnabled = process.env.NEXT_PUBLIC_ENABLE_PWA_DEV === '1';

  const disabledReason = useMemo(() => {
    if (!user) return 'Necesitas iniciar sesión para activar push.';
    if (!supported) return 'Este navegador no soporta Web Push.';
    if (!vapidPublicKey) return 'Faltan las claves VAPID públicas.';
    if (!pwaDevEnabled && process.env.NODE_ENV === 'development') {
      return 'En desarrollo debes activar NEXT_PUBLIC_ENABLE_PWA_DEV=1 para probar push.';
    }
    if (permission === 'denied') return 'El navegador bloqueó las notificaciones para este sitio.';
    return null;
  }, [permission, pwaDevEnabled, supported, user, vapidPublicKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      if (typeof window === 'undefined') return;

      const pushSupported =
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

      if (!pushSupported) {
        if (!cancelled) {
          setSupported(false);
          setLoading(false);
        }
        return;
      }

      const currentPermission = Notification.permission;
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      const subscription = registration ? await registration.pushManager.getSubscription() : null;

      if (!cancelled) {
        setSupported(true);
        setPermission(currentPermission);
        setSubscribed(Boolean(subscription));
        setLoading(false);
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    if (!user || !vapidPublicKey) return;

    setWorking(true);
    setError(null);
    setMessage(null);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Debes permitir notificaciones en el navegador.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
        });
      }

      const subscribeResponse = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!subscribeResponse.ok) {
        const result = await subscribeResponse.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || 'No pudimos guardar la suscripción.');
      }

      const testResponse = await fetch('/api/push/test', { method: 'POST' });
      if (!testResponse.ok) {
        const result = await testResponse.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || 'No pudimos enviar la prueba push.');
      }

      setSubscribed(true);
      setMessage('Push activadas. Te enviamos una notificación de prueba.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No pudimos activar las push notifications.');
    } finally {
      setWorking(false);
    }
  };

  const handleDisable = async () => {
    setWorking(true);
    setError(null);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      const endpoint = subscription?.endpoint || null;

      const response = await fetch('/api/push/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || 'No pudimos desactivar las notificaciones.');
      }

      if (subscription) {
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      setMessage('Push desactivadas para este dispositivo.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No pudimos desactivar las notificaciones.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">notifications_active</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white">Notificaciones Push</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Activa alertas en este dispositivo para aprobaciones, cambios de cuenta y recordatorios importantes.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              subscribed
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {loading ? 'Verificando' : subscribed ? 'Activas' : 'Inactivas'}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Permiso: {permission}
            </span>
          </div>

          {disabledReason && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">{disabledReason}</p>
          )}
          {message && (
            <p className="mt-4 text-sm text-green-700 dark:text-green-400">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={subscribed ? handleDisable : handleEnable}
              disabled={loading || working || Boolean(disabledReason && !subscribed)}
              className="rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 transition"
            >
              {working ? 'Procesando...' : subscribed ? 'Desactivar push' : 'Activar push'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
