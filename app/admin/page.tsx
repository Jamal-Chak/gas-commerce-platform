'use client';

import { useEffect, useState } from 'react';
import {
  Package, Truck, Users, DollarSign, TrendingUp, AlertTriangle,
  Loader2, ArrowUpRight, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAdminDashboardStats, type AdminDashboardStats } from '@/lib/admin/admin-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useBusinessConfig();

  useEffect(() => {
    (async () => {
      const data = await getAdminDashboardStats();
      setStats(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading dashboard…</p>
      </div>
    );
  }

  const cur = currency ?? 'ZAR';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your gas delivery business</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={Package}
          subtitle={`${stats?.pendingOrders ?? 0} pending`}
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders ?? 0}
          icon={Clock}
          subtitle={`Revenue: ${formatCurrency(stats?.todayRevenue ?? 0, cur)}`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0, cur)}
          icon={DollarSign}
          subtitle="Paid orders"
        />
        <StatCard
          title="Customers"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          subtitle={`${stats?.activeDrivers ?? 0} drivers online`}
        />
      </div>

      {/* Alerts */}
      {(stats?.lowStockProducts ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              {stats!.lowStockProducts} product{stats!.lowStockProducts > 1 ? 's' : ''} low on stock
            </p>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/admin/inventory">View inventory</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!stats?.recentOrders.length ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No orders yet</p>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
                <span>Order</span>
                <span>Customer</span>
                <span>Status</span>
                <span className="text-right">Total</span>
                <span className="text-right">Date</span>
              </div>
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 border-b py-3 text-sm last:border-0"
                >
                  <span className="font-medium tabular-nums">{order.orderNumber}</span>
                  <span className="text-muted-foreground truncate">{order.customerName ?? 'Guest'}</span>
                  <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  <span className="text-right font-medium tabular-nums">
                    {formatCurrency(order.total, cur)}
                  </span>
                  <span className="text-muted-foreground text-right text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="bg-primary/10 grid size-12 place-items-center rounded-xl">
          <Icon className="text-primary size-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium">{title}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
