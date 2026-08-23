'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';

/**
 * Check if a user has admin privileges.
 * In production, this would check a roles table or user metadata.
 * For now, we check if the user's email is in the ADMIN_EMAILS env var.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  // Check environment variable for admin emails
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  if (adminEmails.length === 0) {
    // If no admin emails configured, allow any authenticated user (dev mode)
    return true;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) return false;

  const { data: user } = await supabase.auth.admin.getUserById(userId);
  if (!user?.user?.email) return false;

  return adminEmails.includes(user.user.email.toLowerCase());
}
