'use server';

import { Address, CustomerProfile, Order, OrderStatus, PaymentStatus } from '../domain/types';
import { createSupabaseServerClient } from '../supabase/serverClient';

/**
 * CUSTOMER DATA ACCESS
 * --------------------
 * Customer-scoped data comes from authenticated server-side operations.
 * The authenticated user is resolved from the Supabase session cookie —
 * the client NEVER sends a customer id directly.
 *
 * When Supabase is not configured, returns empty/null so the UI renders
 * its empty states gracefully.
 */

export async function getCurrentCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: String(data.id),
      fullName: String(data.full_name),
      phone: data.phone ? String(data.phone) : null,
      email: user.email ?? null,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUserAddresses(): Promise<Address[]> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Resolve the customer row for this auth user.
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!customer) return [];

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      label: String(row.label),
      addressLine: String(row.address_line),
      city: String(row.city),
      area: String(row.area),
      deliveryInstructions: row.delivery_instructions ? String(row.delivery_instructions) : null,
    }));
  } catch {
    return [];
  }
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export async function getCurrentUserOrders(): Promise<Order[]> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!customer) return [];

    const { data: orderRows, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error || !orderRows) return [];

    const orders: Order[] = [];
    for (const row of orderRows as OrderRow[]) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', row.id);

      orders.push({
        id: row.id,
        customerId: customer.id,
        items: (items ?? []).map((item: OrderItemRow) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.line_total,
        })),
        subtotal: row.subtotal,
        deliveryFee: row.delivery_fee,
        total: row.total,
        status: (row.status.toLowerCase() as OrderStatus),
        paymentStatus: (row.payment_status.toLowerCase() as PaymentStatus),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return orders;
  } catch {
    return [];
  }
}
