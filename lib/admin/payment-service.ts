'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';

export async function getPaymentOrders() {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, payment_status, payment_provider, created_at, customer_id')
    .order('created_at', { ascending: false })
    .limit(100);
  if (!orders) return [];

  const customerIds = [...new Set(orders.map((o: Record<string, unknown>) => String(o.customer_id)))];
  let names: Record<string, string> = {};
  if (customerIds.length > 0) {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, full_name')
      .in('id', customerIds);
    if (customers) {
      names = Object.fromEntries(
        customers.map((c: Record<string, unknown>) => [String(c.id), String(c.full_name)])
      );
    }
  }

  return orders.map((o: Record<string, unknown>) => ({
    id: String(o.id),
    order_number: String(o.order_number),
    total: Number(o.total),
    payment_status: String(o.payment_status),
    payment_provider: (o.payment_provider as string) ?? null,
    created_at: String(o.created_at),
    customer_name: names[String(o.customer_id)] ?? 'Guest',
  }));
}
