'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for the app.
 * Catches rendering errors and shows a friendly fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-destructive/10 grid size-16 place-items-center rounded-full">
          <AlertTriangle className="text-destructive size-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            We hit an unexpected error. Please try again — if the problem persists, contact support.
          </p>
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
