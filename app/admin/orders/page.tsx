'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAdminOrders,
  updateOrderStatus,
} from '@/lib/admin/admin-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DISPATCHED: 'bg-purple-100 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

type AdminOrder = Awaited<ReturnType<typeof getAdminOrders>>[number];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAdminOrders(statusFilter === 'ALL' ? undefined : statusFilter);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
    loadOrders();
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage and update order statuses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by order #, customer name, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="text-muted-foreground size-4 shrink-0" />
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="shrink-0 text-xs"
            >
              {s.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading orders…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium tabular-nums">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>{order.customerName}</div>
                        {order.customerPhone && (
                          <div className="text-muted-foreground text-xs">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[order.status.toUpperCase()] ?? ''}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(order.total, cur)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status.toUpperCase()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="border-border rounded border bg-transparent px-2 py-1 text-xs focus:ring-2 focus:ring-ring"
                        >
                          {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
