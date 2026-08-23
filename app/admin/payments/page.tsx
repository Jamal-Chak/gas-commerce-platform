'use client';

import { useEffect, useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPaymentOrders } from '@/lib/admin/payment-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

type PaymentRow = Awaited<ReturnType<typeof getPaymentOrders>>[number];

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  useEffect(() => {
    (async () => {
      const data = await getPaymentOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  const totalPaid = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);
  const totalPending = orders
    .filter((o) => o.payment_status !== 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm">Payment tracking and reconciliation</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-green-100 grid size-10 place-items-center rounded-lg">
              <CreditCard className="text-green-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Paid</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalPaid, cur)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-yellow-100 grid size-10 place-items-center rounded-lg">
              <CreditCard className="text-yellow-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Pending</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalPending, cur)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-primary/10 grid size-10 place-items-center rounded-lg">
              <CreditCard className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Orders</p>
              <p className="text-xl font-bold tabular-nums">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading payments…</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No payment records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium tabular-nums">{o.order_number}</td>
                      <td className="px-4 py-3">{o.customer_name}</td>
                      <td className="px-4 py-3 text-xs">{o.payment_provider ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            o.payment_status === 'PAID'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : o.payment_status === 'FAILED'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {o.payment_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(o.total, cur)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {new Date(o.created_at).toLocaleDateString()}
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
