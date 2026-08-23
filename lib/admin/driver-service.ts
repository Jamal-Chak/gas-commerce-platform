'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';

export async function getDrivers() {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('drivers')
    .select('*')
    .order('is_online', { ascending: false });
  return (data ?? []) as Array<Record<string, unknown>>;
}
