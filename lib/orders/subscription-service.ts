'use server';

import { createServiceRoleClient, createSupabaseServerClient } from '../supabase/serverClient';
import type { Subscription } from '../domain/types';

/**
 * Get all subscriptions for the authenticated customer.
 */
export async function getMySubscriptions(): Promise<Subscription[]> {
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
    .from('subscriptions')
    .select(`
      *,
      products(name),
      addresses(label)
    `)
    .eq('customer_id', customer.id)
    .order('next_delivery_date', { ascending: true });

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    customerId: String(row.customer_id),
    productId: String(row.product_id),
    productName: (row.products as Record<string, unknown>)?.name as string ?? null,
    addressId: row.address_id as string | null,
    intervalDays: Number(row.interval_days),
    nextDeliveryDate: String(row.next_delivery_date),
    status: row.status as Subscription['status'],
    lastOrderId: row.last_order_id as string | null,
    createdAt: String(row.created_at),
  }));
}

/**
 * Create a new subscription for auto-refill.
 */
export async function createSubscription(input: {
  productId: string;
  addressId?: string;
  intervalDays: number;
}): Promise<{ ok: boolean; subscription?: Subscription; error?: string }> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return { ok: false, error: 'Authentication not configured' };

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) return { ok: false, error: 'Customer profile not found' };

  // Calculate next delivery date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + input.intervalDays);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: customer.id,
      product_id: input.productId,
      address_id: input.addressId ?? null,
      interval_days: input.intervalDays,
      next_delivery_date: nextDate.toISOString().split('T')[0],
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('[subscription] Create error:', error.message);
    return { ok: false, error: 'Failed to create subscription' };
  }

  return {
    ok: true,
    subscription: {
      id: String(data.id),
      customerId: String(data.customer_id),
      productId: String(data.product_id),
      productName: null,
      addressId: data.address_id as string | null,
      intervalDays: Number(data.interval_days),
      nextDeliveryDate: String(data.next_delivery_date),
      status: data.status as Subscription['status'],
      lastOrderId: null,
      createdAt: String(data.created_at),
    },
  };
}

/**
 * Pause, resume, or cancel a subscription.
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  newStatus: 'active' | 'paused' | 'cancelled'
): Promise<{ ok: boolean; error?: string }> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return { ok: false, error: 'Authentication not configured' };

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: newStatus })
    .eq('id', subscriptionId);

  if (error) {
    console.error('[subscription] Update error:', error.message);
    return { ok: false, error: 'Failed to update subscription' };
  }

  return { ok: true };
}

/**
 * Get reorder suggestions based on past orders.
 */
export async function getReorderSuggestions(): Promise<Array<{
  productId: string;
  productName: string;
  slug: string;
  lastOrdered: string;
  unitPrice: number;
  quantity: number;
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

  // Get recent order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(customer_id, created_at, status),
      products(name, slug, price, sale_price)
    `)
    .eq('orders.customer_id', customer.id)
    .order('orders(created_at)', { ascending: false })
    .limit(20);

  if (!orderItems) return [];

  // Group by product, get most recent
  const productMap = new Map<string, {
    productId: string;
    productName: string;
    slug: string;
    lastOrdered: string;
    unitPrice: number;
    quantity: number;
  }>();

  for (const item of orderItems as Record<string, unknown>[]) {
    const product = item.products as Record<string, unknown>;
    const order = item.orders as Record<string, unknown>;
    if (!product || !order) continue;

    const productId = String(item.product_id);
    const existing = productMap.get(productId);
    if (!existing || String(order.created_at) > existing.lastOrdered) {
      productMap.set(productId, {
        productId,
        productName: String(product.name),
        slug: String(product.slug),
        lastOrdered: String(order.created_at),
        unitPrice: Number(product.sale_price ?? product.price),
        quantity: Number(item.quantity),
      });
    }
  }

  return Array.from(productMap.values()).slice(0, 6);
}
