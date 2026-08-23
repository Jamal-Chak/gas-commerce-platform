'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, Package, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalyticsData } from '@/lib/admin/analytics-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  useEffect(() => {
    (async () => {
      const result = await getAnalyticsData();
      setData(result);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading analytics…</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...(data?.dailyStats.map((d) => d.revenue) ?? [1]), 1);
  const maxOrders = Math.max(...(data?.dailyStats.map((d) => d.orders) ?? [1]), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Last 14 days performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-primary/10 grid size-10 place-items-center rounded-lg">
              <Package className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Orders (14d)</p>
              <p className="text-xl font-bold tabular-nums">{data?.totalOrders ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-green-100 grid size-10 place-items-center rounded-lg">
              <DollarSign className="text-green-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Revenue (14d)</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(data?.totalRevenue ?? 0, cur)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-blue-100 grid size-10 place-items-center rounded-lg">
              <TrendingUp className="text-blue-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Avg Order Value</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(data?.avgOrderValue ?? 0, cur)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-purple-100 grid size-10 place-items-center rounded-lg">
              <Users className="text-purple-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Customers</p>
              <p className="text-xl font-bold tabular-nums">{data?.totalCustomers ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {(data?.dailyStats ?? []).map((day) => {
              const heightPct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="bg-primary/80 hover:bg-primary w-full rounded-t transition-colors"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue, cur)}`}
                  />
                  <span className="text-muted-foreground text-[9px] tabular-nums">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1" style={{ height: 150 }}>
            {(data?.dailyStats ?? []).map((day) => {
              const heightPct = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="bg-blue-400/80 hover:bg-blue-500 w-full rounded-t transition-colors"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={`${day.date}: ${day.orders} orders`}
                  />
                  <span className="text-muted-foreground text-[9px] tabular-nums">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
