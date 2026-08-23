'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Loader2, Check, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/providers/cart-provider';
import { useBusinessConfig } from '@/components/providers/business-config-provider';
import { formatCurrency } from '@/lib/utils/format';

interface BulkItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

const BULK_PRODUCTS: BulkItem[] = [
  { id: 'p1', name: 'Gas Cylinder 9kg', price: 349, qty: 0 },
  { id: 'p2', name: 'Gas Cylinder 14kg', price: 549, qty: 0 },
  { id: 'p3', name: 'Gas Cylinder 19kg', price: 749, qty: 0 },
  { id: 'p4', name: 'Gas Cylinder 48kg', price: 1899, qty: 0 },
];

export default function BulkOrderPage() {
  const [items, setItems] = useState<BulkItem[]>(BULK_PRODUCTS);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { currency } = useBusinessConfig();
  const cur = currency ?? 'ZAR';

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  };

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = totalAmount >= 5000 ? 0.1 : totalAmount >= 2000 ? 0.05 : 0;
  const discountAmount = totalAmount * discount;
  const finalTotal = totalAmount - discountAmount;

  const handleSubmit = async () => {
    setSubmitting(true);
    // Add items to cart one by one
    for (const item of items.filter((i) => i.qty > 0)) {
      const product = {
        id: item.id,
        name: item.name,
        slug: item.id,
        price: item.price,
        salePrice: null as number | null,
        image: item.image ?? null,
        quantity: item.qty,
        serviceType: 'refill' as const,
        active: true,
      } as unknown as Parameters<typeof addToCart>[0];
      addToCart(product, item.qty);
    }
    // Simulate order submission
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/10 grid size-16 place-items-center rounded-full">
            <Check className="text-primary size-8" />
          </div>
          <h1 className="text-2xl font-bold">Bulk Order Submitted!</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            We&apos;ve received your bulk order request. Our team will contact you within 24 hours to confirm pricing and delivery.
          </p>
          <Button asChild>
            <a href="/cart">Go to Cart</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <Flame className="text-primary size-6" />
          <h1 className="text-2xl font-bold">Bulk Ordering</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Order multiple cylinders at once. Get 5% off orders over R2,000 or 10% off orders over R5,000.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product selection */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Select Products</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-sm tabular-nums">{formatCurrency(item.price, cur)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="size-8" onClick={() => updateQty(item.id, -1)} disabled={item.qty === 0}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center font-medium tabular-nums">{item.qty}</span>
                    <Button variant="outline" size="icon" className="size-8" onClick={() => updateQty(item.id, 1)}>
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary & contact */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{totalQty} items</span>
                <span className="tabular-nums">{formatCurrency(totalAmount, cur)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Bulk discount ({discount * 100}%)</span>
                  <span className="text-green-600 tabular-nums">-{formatCurrency(discountAmount, cur)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(finalTotal, cur)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <h3 className="font-semibold">Contact Details</h3>
              <Input placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              <Input placeholder="Phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              <textarea
                className="border-border bg-background focus-visible:ring-ring min-h-[60px] w-full rounded border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder="Delivery notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={submitting || totalQty === 0} className="gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
                Submit Bulk Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
