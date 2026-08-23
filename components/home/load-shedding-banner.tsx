'use client';

import { useEffect, useState } from 'react';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Load shedding awareness banner.
 * Shows current load shedding stage and estimated delivery impact.
 */
export function LoadSheddingBanner() {
  const [stage, setStage] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch load shedding status
    (async () => {
      try {
        const { getDeliveryDelayEstimate } = await import('@/lib/data/load-shedding');
        const result = await getDeliveryDelayEstimate();
        setStage(result.stage);
        setMessage(result.message);
      } catch {
        // Silently fail — load shedding info is non-critical
      }
    })();
  }, []);

  // Don't show if no data or stage 0
  if (stage === null || stage === 0) return null;

  const severity = stage <= 2 ? 'info' : stage <= 4 ? 'warning' : 'error';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
        severity === 'error'
          ? 'bg-red-50 text-red-800 border-red-200'
          : severity === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
      } border-b`}
    >
      {severity === 'error' ? (
        <AlertTriangle className="size-4 shrink-0" />
      ) : (
        <Zap className="size-4 shrink-0" />
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
}
