'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserSupabaseClient } from '@/lib/supabase/browserClient';

/**
 * Server-side admin guard.
 * Checks if the authenticated user is an admin before rendering children.
 * Redirects non-admin users to /account with an error message.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'authorized' | 'denied'>('loading');

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setState('denied');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login?next=/admin');
        return;
      }

      // Check admin status via server action
      const { checkAdminAccess } = await import('@/lib/admin/admin-access');
      const isAllowed = await checkAdminAccess();
      setState(isAllowed ? 'authorized' : 'denied');
    })();
  }, [router]);

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-5 animate-spin" />
        <p className="text-muted-foreground text-sm">Verifying access…</p>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-destructive/10 grid size-16 place-items-center rounded-full">
            <ShieldAlert className="text-destructive size-8" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            You don&apos;t have permission to access the admin area. Contact your administrator if you believe this is an error.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="/account">Go to account</a>
            </Button>
            <Button asChild>
              <a href="/">Go home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
