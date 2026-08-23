import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Browser (public) Supabase client factory.
 * Uses NEXT_PUBLIC_* env vars. Do not commit secrets.
 *
 * Uses @supabase/ssr for consistent cookie-based session management
 * across browser and server contexts.
 *
 * IMPORTANT: process.env is accessed with literal property names (not
 * dynamic bracket notation) so Next.js can inline NEXT_PUBLIC_* values
 * into the client bundle at compile time.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!url || !anonKey || url.includes('your-project') || anonKey === 'your-anon-key') {
    return null;
  }

  return createSupabaseBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
