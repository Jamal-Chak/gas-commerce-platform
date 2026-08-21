import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client factory for privileged operations.
// Requires SUPABASE_SERVICE_ROLE_KEY be set on the server runtime.
export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(url, serviceKey);
}
