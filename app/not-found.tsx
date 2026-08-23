import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-muted grid size-20 place-items-center rounded-full">
          <AlertTriangle className="text-muted-foreground size-10" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-muted-foreground mt-1 text-lg">Page not found</h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products" className="gap-2">
              <RefreshCw className="size-4" />
              Browse products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
