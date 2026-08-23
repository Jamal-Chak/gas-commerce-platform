'use client';

import { useEffect, useState } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie-consent';

type ConsentState = 'pending' | 'accepted' | 'rejected';

/**
 * POPIA-compliant cookie consent banner.
 * South Africa's Protection of Personal Information Act requires
 * explicit consent before storing non-essential cookies.
 */
export function CookieConsent() {
  const [state, setState] = useState<ConsentState>('pending');

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (saved) setState(saved);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setState('accepted');
    // Enable analytics cookies
    document.cookie = 'analytics_enabled=true; path=/; max-age=31536000; SameSite=Lax';
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setState('rejected');
    // Disable analytics cookies
    document.cookie = 'analytics_enabled=false; path=/; max-age=31536000; SameSite=Lax';
  };

  if (state !== 'pending') return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="bg-card border-border fixed right-0 bottom-0 left-0 z-50 border-t p-4 shadow-lg sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md sm:rounded-xl sm:border"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Cookie className="text-primary mt-0.5 size-5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">We value your privacy</h2>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              We use cookies to enhance your experience, analyze traffic, and for marketing purposes.
              By clicking &quot;Accept all&quot;, you consent to our use of cookies.
              Read our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
            </p>
          </div>
          <button
            type="button"
            onClick={reject}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Dismiss cookie banner"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} className="flex-1">
            Accept all
          </Button>
          <Button size="sm" variant="outline" onClick={reject} className="flex-1">
            Reject non-essential
          </Button>
        </div>
      </div>
    </div>
  );
}
