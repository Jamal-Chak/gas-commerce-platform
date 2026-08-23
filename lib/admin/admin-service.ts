'use server';

import { createServiceRoleClient } from '../supabase/serverClient';

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCustomers: number;
  activeDrivers: number;
  lowStockProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customerName?: string | null;
  }>;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { data: todayOrderData },
    { data: revenueData },
    { data: todayRevenueData },
    { count: totalCustomers },
    { count: activeDrivers },
    { data: recentOrdersData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'CONFIRMED']),
    supabase.from('orders').select('id').gte('created_at', today),
    supabase.from('orders').select('total').eq('payment_status', 'PAID'),
    supabase.from('orders').select('total').eq('payment_status', 'PAID').gte('created_at', today),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_online', true),
    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, customer_id')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Get customer names for recent orders
  let customerNames: Record<string, string> = {};
  if (recentOrdersData) {
    const customerIds = [...new Set(recentOrdersData.map((o: Record<string, unknown>) => String(o.customer_id)))];
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name')
        .in('id', customerIds);
      if (customers) {
        customerNames = Object.fromEntries(
          customers.map((c: Record<string, unknown>) => [String(c.id), String(c.full_name)])
        );
      }
    }
  }

  // Check low stock
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select('product_id, full_quantity')
    .lt('full_quantity', 10);

  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    todayOrders: todayOrderData?.length ?? 0,
    totalRevenue: revenueData?.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.total), 0) ?? 0,
    todayRevenue: todayRevenueData?.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.total), 0) ?? 0,
    totalCustomers: totalCustomers ?? 0,
    activeDrivers: activeDrivers ?? 0,
    lowStockProducts: inventoryData?.length ?? 0,
    recentOrders: (recentOrdersData ?? []).map((o: Record<string, unknown>) => ({
      id: String(o.id),
      orderNumber: String(o.order_number),
      status: String(o.status),
      total: Number(o.total),
      createdAt: String(o.created_at),
      customerName: customerNames[String(o.customer_id)] ?? null,
    })),
  };
}

/**
 * Get all orders for admin management.
 */
export async function getAdminOrders(status?: string): Promise<Array<{
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  customerName: string;
  customerPhone?: string | null;
  createdAt: string;
}>> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  let query = supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, customer_id')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq('status', status.toUpperCase());
  }

  const { data } = await query;
  if (!data) return [];

  const customerIds = [...new Set(data.map((o: Record<string, unknown>) => String(o.customer_id)))];
  let customerMap: Record<string, Record<string, unknown>> = {};
  if (customerIds.length > 0) {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .in('id', customerIds);
    if (customers) {
      customerMap = Object.fromEntries(customers.map((c: Record<string, unknown>) => [String(c.id), c]));
    }
  }

  return data.map((o: Record<string, unknown>) => {
    const customer = customerMap[String(o.customer_id)] as Record<string, unknown> | undefined;
    return {
      id: String(o.id),
      orderNumber: String(o.order_number),
      status: String(o.status),
      paymentStatus: String(o.payment_status),
      total: Number(o.total),
      customerName: customer ? String(customer.full_name) : 'Unknown',
      customerPhone: customer?.phone as string | null,
      createdAt: String(o.created_at),
    };
  });
}

/**
 * Get all customers for admin management.
 */
export async function getAdminCustomers(): Promise<Array<{
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}>> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, phone, email, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!customers) return [];

  // Get order counts and totals per customer
  const { data: orderStats } = await supabase
    .from('orders')
    .select('customer_id, total, payment_status');

  const statsMap: Record<string, { count: number; total: number }> = {};
  if (orderStats) {
    for (const o of orderStats as Array<Record<string, unknown>>) {
      const cid = String(o.customer_id);
      if (!statsMap[cid]) statsMap[cid] = { count: 0, total: 0 };
      statsMap[cid].count++;
      if (String(o.payment_status) === 'PAID') {
        statsMap[cid].total += Number(o.total);
      }
    }
  }

  return customers.map((c: Record<string, unknown>) => {
    const cid = String(c.id);
    const stats = statsMap[cid] ?? { count: 0, total: 0 };
    return {
      id: cid,
      fullName: String(c.full_name),
      phone: (c.phone as string) ?? null,
      email: (c.email as string) ?? null,
      totalOrders: stats.count,
      totalSpent: stats.total,
      createdAt: String(c.created_at),
    };
  });
}

/**
 * Get inventory / product stock levels.
 */
export async function getAdminInventory(): Promise<Array<{
  id: string;
  productId: string;
  productName: string;
  fullQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}>> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data: inventory } = await supabase
    .from('inventory')
    .select('id, product_id, full_quantity, reserved_quantity')
    .order('full_quantity', { ascending: true });

  if (!inventory) return [];

  // Get product names
  const productIds = inventory.map((i: Record<string, unknown>) => String(i.product_id));
  let productNames: Record<string, string> = {};
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);
    if (products) {
      productNames = Object.fromEntries(
        products.map((p: Record<string, unknown>) => [String(p.id), String(p.name)])
      );
    }
  }

  return inventory.map((i: Record<string, unknown>) => {
    const full = Number(i.full_quantity);
    const reserved = Number(i.reserved_quantity ?? 0);
    return {
      id: String(i.id),
      productId: String(i.product_id),
      productName: productNames[String(i.product_id)] ?? 'Unknown',
      fullQuantity: full,
      reservedQuantity: reserved,
      availableQuantity: full - reserved,
    };
  });
}

/**
 * Get all promo codes for admin management.
 */
export async function getAdminPromos(): Promise<Array<{
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  usageCount: number;
  usageLimit: number | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}>> {
  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map((p: Record<string, unknown>) => ({
    id: String(p.id),
    code: String(p.code),
    description: (p.description as string) ?? null,
    type: String(p.type),
    value: Number(p.value),
    usageCount: Number(p.usage_count ?? 0),
    usageLimit: p.usage_limit ? Number(p.usage_limit) : null,
    active: Boolean(p.active),
    expiresAt: p.expires_at ? String(p.expires_at) : null,
    createdAt: String(p.created_at),
  }));
}

/**
 * Update order status (admin action).
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus.toUpperCase() })
    .eq('id', orderId);

  if (error) {
    console.error('[admin] Order status update error:', error.message);
    return { ok: false, error: 'Failed to update order' };
  }

  return { ok: true };
}
