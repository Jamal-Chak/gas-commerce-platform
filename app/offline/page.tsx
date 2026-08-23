import { WifiOff, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="bg-muted grid size-20 place-items-center rounded-full">
          <WifiOff className="text-muted-foreground size-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">You&apos;re offline</h1>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
