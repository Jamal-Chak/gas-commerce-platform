'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export async function getAnalyticsData(): Promise<{
  dailyStats: DailyStats[];
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
}> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { dailyStats: [], topProducts: [], totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, totalCustomers: 0 };
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: orders } = await supabase
    .from('orders')
    .select('total, payment_status, created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const dayMap: Record<string, DailyStats> = {};
  if (orders) {
    for (const o of orders as Array<Record<string, unknown>>) {
      const date = String(o.created_at).split('T')[0];
      if (!dayMap[date]) dayMap[date] = { date, orders: 0, revenue: 0 };
      dayMap[date].orders++;
      if (String(o.payment_status) === 'PAID') {
        dayMap[date].revenue += Number(o.total);
      }
    }
  }

  const dailyStats: DailyStats[] = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyStats.push(dayMap[dateStr] ?? { date: dateStr, orders: 0, revenue: 0 });
  }

  const totalOrders = dailyStats.reduce((s: number, d) => s + d.orders, 0);
  const totalRevenue = dailyStats.reduce((s: number, d) => s + d.revenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  return {
    dailyStats,
    topProducts: [],
    totalOrders,
    totalRevenue,
    avgOrderValue,
    totalCustomers: totalCustomers ?? 0,
  };
}
