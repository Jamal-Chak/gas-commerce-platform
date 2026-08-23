'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Loader2, Pause, Play, X, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMySubscriptions, updateSubscriptionStatus } from '@/lib/orders/subscription-service';
import type { Subscription } from '@/lib/domain/types';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getMySubscriptions();
      setSubscriptions(data);
      setLoading(false);
    })();
  }, []);

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'cancelled') => {
    await updateSubscriptionStatus(id, status);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading subscriptions…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Auto-refill subscriptions</h2>
          <p className="text-muted-foreground text-sm">Never run out of gas — schedule automatic deliveries.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" /> New subscription
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <RefreshCw className="text-muted-foreground size-8" />
            <h3 className="font-medium">No subscriptions yet</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              Set up auto-refill and we&apos;ll deliver gas on a schedule that works for you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 grid size-12 place-items-center rounded-xl">
                    <RefreshCw className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{sub.productName ?? 'Product'}</p>
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Calendar className="size-3" />
                      Every {sub.intervalDays} days · Next: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'paused' ? 'secondary' : 'destructive'}>
                    {sub.status}
                  </Badge>
                  {sub.status === 'active' && (
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(sub.id, 'paused')}>
                      <Pause className="size-4" />
                    </Button>
                  )}
                  {sub.status === 'paused' && (
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(sub.id, 'active')}>
                      <Play className="size-4" />
                    </Button>
                  )}
                  {sub.status !== 'cancelled' && (
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(sub.id, 'cancelled')}>
                      <X className="text-destructive size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
