'use client';

import { useState } from 'react';
import { formatBoostExpiry, getBoostTargetLabel } from '@/lib/boosts/config';
import type { BoostableTarget } from '@/lib/types/database';

type Props = {
  targetType: BoostableTarget;
  targetId: string;
  boostExpiresAt: string | null;
  boostScore: number;
};

export default function BoostActionButton({ targetType, targetId, boostExpiresAt, boostScore }: Props) {
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(boostExpiresAt);
  const [score, setScore] = useState(boostScore);
  const [message, setMessage] = useState<string | null>(null);
  const isActive = !!expiresAt && new Date(expiresAt).getTime() > Date.now() && score > 0;

  async function handleBoost() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/dashboard/boosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetType, targetId }),
      });

      const payload = (await response.json()) as {
        error?: string;
        boostExpiresAt?: string;
        boostScore?: number;
      };

      if (!response.ok) {
        setMessage(payload.error || 'No pudimos activar el boost.');
        return;
      }

      setExpiresAt(payload.boostExpiresAt || null);
      setScore(payload.boostScore || 0);
      setMessage(`Boost activo para este ${getBoostTargetLabel(targetType)}.`);
    } catch {
      setMessage('No pudimos activar el boost.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleBoost}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300'
            : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary'
        } disabled:opacity-60`}
      >
        <span className="material-symbols-outlined text-[18px]">{isActive ? 'auto_awesome' : 'rocket_launch'}</span>
        {loading ? 'Activando...' : isActive ? 'Boost activo' : 'Activar boost'}
      </button>
      {isActive && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hasta {formatBoostExpiry(expiresAt)}
        </span>
      )}
      {message && (
        <span className={`max-w-52 text-right text-xs ${message.startsWith('Boost activo') ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
