'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminInventory } from '@/lib/admin/admin-service';

type InventoryItem = Awaited<ReturnType<typeof getAdminInventory>>[number];

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAdminInventory();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  const lowStock = items.filter((i) => i.availableQuantity < 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm">Product stock levels and availability</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-primary/10 grid size-10 place-items-center rounded-lg">
              <Package className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Items</p>
              <p className="text-xl font-bold tabular-nums">{items.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-green-100 grid size-10 place-items-center rounded-lg">
              <Package className="text-green-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">In Stock</p>
              <p className="text-xl font-bold tabular-nums">{items.length - lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-amber-100 grid size-10 place-items-center rounded-lg">
              <AlertTriangle className="text-amber-600 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Low Stock</p>
              <p className="text-xl font-bold tabular-nums">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading inventory…</p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No inventory records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Full Qty</th>
                    <th className="px-4 py-3 text-right">Reserved</th>
                    <th className="px-4 py-3 text-right">Available</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLow = item.availableQuantity < 10;
                    const isOut = item.availableQuantity <= 0;
                    return (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{item.fullQuantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{item.reservedQuantity}</td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {item.availableQuantity}
                        </td>
                        <td className="px-4 py-3">
                          {isOut ? (
                            <Badge variant="destructive">Out of stock</Badge>
                          ) : isLow ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
                              Low stock
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                              In stock
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
