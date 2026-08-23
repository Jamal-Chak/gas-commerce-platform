import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { readEnv } from '@/lib/config/env';

/**
 * Server-side Supabase client factory using @supabase/ssr.
 *
 * Creates a client that reads/writes session cookies via Next.js cookies().
 * Uses the anon key (not the service role key) so that Row Level Security
 * policies are enforced. Use createServiceRoleClient() for privileged
 * operations that must bypass RLS.
 *
 * MUST be called per-request — never cache the returned client.
 */
export async function createSupabaseServerClient() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey || url.includes('your-project') || anonKey === 'your-anon-key') {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

/**
 * Public server-side Supabase client (no cookies).
 *
 * Uses the anon key without session management. Suitable for reading
 * public data (products, delivery zones) in server components that
 * may be statically rendered — does NOT call cookies().
 *
 * RLS policies for public read access still apply via the anon key.
 */
export function createPublicServerClient() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey || url.includes('your-project') || anonKey === 'your-anon-key') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Privileged server-side Supabase client using the service role key.
 *
 * BYPASSES ROW LEVEL SECURITY — use only for operations that must
 * read/write data the authenticated user shouldn't have direct access to
 * (e.g. creating orders, recalculating prices from the products table).
 *
 * NEVER expose this client to the browser.
 */
export function createServiceRoleClient() {
  const url = readEnv('SUPABASE_URL');
  const serviceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceKey || url.includes('your-project') || serviceKey === 'your-service-role-key') {
    return null;
  }

  // Dynamic import to avoid bundling the service-role client in the browser.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
