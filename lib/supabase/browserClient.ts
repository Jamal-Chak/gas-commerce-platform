import { createClient } from '@supabase/supabase-js';

// Browser (public) Supabase client factory.
// Uses NEXT_PUBLIC_* env vars. Do not commit secrets.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return createClient(url, anonKey);
}
