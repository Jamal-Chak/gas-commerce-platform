'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';
import { isAdminUser } from '@/lib/admin/admin-guard-service';

/**
 * Server action to check if the current user has admin access.
 * Uses the server client to get the current user from the auth cookie.
 */
export async function checkAdminAccess(): Promise<boolean> {
  const supabase = createServiceRoleClient();
  if (!supabase) return false;

  // Get the user from the request context (set by the proxy)
  // In a server action, we need to check the auth cookie
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  return isAdminUser(user.id);
}
