'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Clock, Truck, CheckCircle2, XCircle,
  ChevronRight, MapPin, Loader2, RotateCcw, Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';
import { getCurrentUserOrders } from '@/lib/data/customer';
import type { Order } from '@/lib/domain/types';

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
  confirmed: { icon: Package, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
  preparing: { icon: Package, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Preparing' },
  dispatched: { icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Dispatched' },
  out_for_delivery: { icon: Truck, color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Out for delivery' },
  delivered: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  useEffect(() => {
    (async () => {
      const data = await getCurrentUserOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-5 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
        <span className="bg-muted grid size-14 place-items-center rounded-full">
          <Package className="text-muted-foreground size-6" aria-hidden="true" />
        </span>
        <h2 className="font-semibold">No orders yet</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          When you place an order, it will show up here with delivery tracking.
        </p>
        <Button asChild className="mt-2">
          <Link href="/products">Browse gas products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">My Orders</h1>
      {orders.map((order) => {
        const status = statusConfig[order.status] ?? statusConfig.pending;
        const StatusIcon = status.icon;
        const isDelivered = order.status === 'delivered';
        const isCancelled = order.status === 'cancelled';

        return (
          <Card key={order.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`grid size-10 place-items-center rounded-full ${status.color}`}>
                    <StatusIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        #{order.id.slice(0, 8)}
                      </span>
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatCurrency(order.total, cur)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  {!isCancelled && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/order/${order.id}`}>
                        <Eye className="mr-1 size-3.5" /> Track
                      </Link>
                    </Button>
                  )}
                  {isDelivered && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/products">
                        <RotateCcw className="mr-1 size-3.5" /> Reorder
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
