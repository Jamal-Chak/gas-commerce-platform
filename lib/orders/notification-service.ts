'use server';

import { createServiceRoleClient, createSupabaseServerClient } from '../supabase/serverClient';

/**
 * Send a WhatsApp notification to a customer about their order.
 * Uses the WhatsApp Business API (or a provider like Twilio/360dialog).
 */
export async function sendWhatsAppNotification(input: {
  orderId: string;
  type: string;
  title: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  // Get order + customer details
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, customer_id, total')
    .eq('id', input.orderId)
    .single();

  if (!order) return { ok: false, error: 'Order not found' };

  // Get customer phone
  const { data: customer } = await supabase
    .from('customers')
    .select('id, phone, whatsapp_number')
    .eq('id', order.customer_id)
    .single();

  if (!customer) return { ok: false, error: 'Customer not found' };

  const phone = customer.whatsapp_number || customer.phone;
  if (!phone) return { ok: false, error: 'No phone number on file' };

  // Log the notification
  await supabase.from('order_notifications').insert({
    order_id: input.orderId,
    customer_id: customer.id,
    channel: 'whatsapp',
    type: input.type,
    title: input.title,
    body: input.body,
    sent_at: new Date().toISOString(),
  });

  // In production, this would call the WhatsApp Business API
  // For now, we just log it
  console.log(`[whatsapp] To ${phone}: ${input.title} - ${input.body}`);

  return { ok: true };
}

/**
 * Get in-app notifications for the authenticated customer.
 */
export async function getMyNotifications(limit = 20): Promise<Array<{
  id: string;
  orderId: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}>> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return [];

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return [];

  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) return [];

  const { data } = await supabase
    .from('order_notifications')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    orderId: String(row.order_id),
    type: String(row.type),
    title: String(row.title),
    body: row.body as string | null,
    readAt: row.read_at as string | null,
    createdAt: String(row.created_at),
  }));
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<{ ok: boolean }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false };

  await supabase
    .from('order_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  return { ok: true };
}
