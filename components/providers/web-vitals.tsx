'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

/**
 * Web Vitals performance monitoring.
 * Reports Core Web Vitals (LCP, FID, CLS, INP, TTFB) to analytics.
 */
function WebVitalsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Report page view
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Import web-vitals dynamically to avoid bundling in all cases
    import('web-vitals').then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
      const report = (metric: { name: string; value: number; rating: string }) => {
        // In production, send to your analytics endpoint
        if (process.env.NODE_ENV === 'production') {
          // Example: send to Google Analytics, Vercel Analytics, or custom endpoint
          console.debug(`[WebVital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
        } else {
          console.log(`[WebVital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
        }
      };

      onLCP(report);
      onINP(report);
      onCLS(report);
      onTTFB(report);
      onFCP(report);
    }).catch(() => {
      // web-vitals not available — that's fine
    });
  }, [pathname, searchParams]);

  return null;
}

export function WebVitals() {
  return (
    <Suspense fallback={null}>
      <WebVitalsInner />
    </Suspense>
  );
}
