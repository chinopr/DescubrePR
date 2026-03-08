'use client';

import { useState } from 'react';

export function useBotProtection() {
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [challengeNonce, setChallengeNonce] = useState(0);

  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  function resetChallenge() {
    setHoneypot('');
    setCaptchaToken('');
    setStartedAt(Date.now());
    setChallengeNonce(current => current + 1);
  }

  return {
    honeypot,
    setHoneypot,
    captchaToken,
    setCaptchaToken,
    startedAt,
    challengeNonce,
    captchaEnabled,
    resetChallenge,
  };
}
