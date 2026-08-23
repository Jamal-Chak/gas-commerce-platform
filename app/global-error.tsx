'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for errors in the root layout itself.
 * Must be a client component.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-destructive/10 grid size-20 place-items-center rounded-full">
            <AlertTriangle className="text-destructive size-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Critical Error</h1>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              The application encountered a critical error and could not load.
              Please refresh the page or try again later.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="outline">
              Go to homepage
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
