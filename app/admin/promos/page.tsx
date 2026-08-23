'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star, Percent, Truck, DollarSign, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAdminPromos } from '@/lib/admin/admin-service';
import { createPromoCode, togglePromoActive, deletePromoCode } from '@/lib/admin/promo-service';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

type Promo = Awaited<ReturnType<typeof getAdminPromos>>[number];

const typeIcons: Record<string, typeof Star> = {
  percentage: Percent,
  fixed: DollarSign,
  free_delivery: Truck,
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', description: '', type: 'percentage' as 'percentage' | 'fixed' | 'free_delivery', scope: 'cart' as 'cart' | 'product' | 'category' | 'delivery', value: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '' });
  const [creating, setCreating] = useState(false);
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  const loadPromos = async () => {
    const data = await getAdminPromos();
    setPromos(data);
    setLoading(false);
  };

  useEffect(() => { loadPromos(); }, []);

  const handleCreate = async () => {
    if (!newCode.code.trim()) return;
    setCreating(true);
    await createPromoCode({
      code: newCode.code,
      description: newCode.description || undefined,
      type: newCode.type,
      scope: newCode.scope,
      value: newCode.value,
      minOrderAmount: newCode.minOrderAmount,
      maxDiscount: newCode.maxDiscount || undefined,
      usageLimit: newCode.usageLimit || undefined,
      expiresAt: newCode.expiresAt || undefined,
    });
    setCreating(false);
    setShowCreate(false);
    setNewCode({ code: '', description: '', type: 'percentage', scope: 'cart', value: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '' });
    loadPromos();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await togglePromoActive(id, !active);
    loadPromos();
  };

  const handleDelete = async (id: string) => {
    await deletePromoCode(id);
    loadPromos();
  };

  const activePromos = promos.filter((p) => p.active);
  const expiredPromos = promos.filter((p) => {
    if (!p.expiresAt) return false;
    return new Date(p.expiresAt) < new Date();
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground text-sm">
            Manage discount codes and promotional offers
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
          {showCreate ? 'Cancel' : 'Create Promo'}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium">Code</label>
                <Input value={newCode.code} onChange={(e) => setNewCode({ ...newCode, code: e.target.value })} placeholder="SAVE20" className="mt-1 uppercase" />
              </div>
              <div>
                <label className="text-xs font-medium">Description</label>
                <Input value={newCode.description} onChange={(e) => setNewCode({ ...newCode, description: e.target.value })} placeholder="20% off" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Type</label>
                <select value={newCode.type} onChange={(e) => setNewCode({ ...newCode, type: e.target.value as 'percentage' | 'fixed' | 'free_delivery' })} className="border-border mt-1 w-full rounded border px-3 py-2 text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Value</label>
                <Input type="number" value={newCode.value} onChange={(e) => setNewCode({ ...newCode, value: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Min Order Amount</label>
                <Input type="number" value={newCode.minOrderAmount} onChange={(e) => setNewCode({ ...newCode, minOrderAmount: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Max Discount</label>
                <Input type="number" value={newCode.maxDiscount} onChange={(e) => setNewCode({ ...newCode, maxDiscount: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Usage Limit</label>
                <Input type="number" value={newCode.usageLimit} onChange={(e) => setNewCode({ ...newCode, usageLimit: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Expires At</label>
                <Input type="date" value={newCode.expiresAt} onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })} className="mt-1" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={creating || !newCode.code.trim()} className="w-full gap-2">
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-primary/10 grid size-10 place-items-center rounded-lg">
              <Star className="text-primary size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Codes</p>
              <p className="text-xl font-bold tabular-nums">{promos.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-green-100 grid size-10 place-items-center rounded-lg">
              <Star className="text-green-700 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Active</p>
              <p className="text-xl font-bold tabular-nums">{activePromos.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="bg-red-100 grid size-10 place-items-center rounded-lg">
              <Star className="text-red-600 size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Expired</p>
              <p className="text-xl font-bold tabular-nums">{expiredPromos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promos table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center gap-3 p-8">
              <Loader2 className="text-primary size-5 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading promos…</p>
            </div>
          ) : promos.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No promo codes yet. Create one in the Supabase dashboard.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3 text-right">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const Icon = typeIcons[promo.type] ?? Star;
                    const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                    const atLimit = promo.usageLimit != null && promo.usageCount >= promo.usageLimit;
                    return (
                      <tr key={promo.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <code className="bg-muted rounded px-2 py-0.5 text-sm font-bold">
                            {promo.code}
                          </code>
                          {promo.description && (
                            <p className="text-muted-foreground mt-0.5 text-xs">{promo.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Icon className="size-3.5" />
                            {promo.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums">
                          {promo.type === 'percentage'
                            ? `${promo.value}%`
                            : promo.type === 'free_delivery'
                              ? 'Free delivery'
                              : formatCurrency(promo.value, cur)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {promo.usageCount}
                          {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          {!promo.active ? (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          ) : isExpired ? (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          ) : atLimit ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs" variant="outline">
                              Limit reached
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs" variant="outline">
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-xs">
                          {promo.expiresAt
                            ? new Date(promo.expiresAt).toLocaleDateString()
                            : 'No expiry'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleToggle(promo.id, promo.active)}>
                              {promo.active ? 'Disable' : 'Enable'}
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(promo.id)}>
                              Delete
                            </Button>
                          </div>
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
