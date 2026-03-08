'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ): string;
      remove(widgetId: string): void;
    };
  }
}

type BotProtectionFieldsProps = {
  honeypot: string;
  onHoneypotChange: (value: string) => void;
  onCaptchaTokenChange: (value: string) => void;
  resetKey: number;
};

export default function BotProtectionFields({
  honeypot,
  onHoneypotChange,
  onCaptchaTokenChange,
  resetKey,
}: BotProtectionFieldsProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    containerRef.current.innerHTML = '';
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: token => onCaptchaTokenChange(token),
      'expired-callback': () => onCaptchaTokenChange(''),
      'error-callback': () => onCaptchaTokenChange(''),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onCaptchaTokenChange, resetKey, scriptReady, siteKey]);

  return (
    <>
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contactWebsite">Website</label>
        <input
          id="contactWebsite"
          name="contactWebsite"
          type="text"
          value={honeypot}
          onChange={event => onHoneypotChange(event.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {siteKey ? (
        <div className="space-y-2">
          <Script
            id="turnstile-script"
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={() => setScriptReady(true)}
          />
          <div
            ref={containerRef}
            className="min-h-[66px] rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Protección anti-spam activa.
          </p>
        </div>
      ) : null}
    </>
  );
}
