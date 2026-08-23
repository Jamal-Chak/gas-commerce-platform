'use client';

import { useEffect, useState } from 'react';
import { Star, Loader2, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getMyLoyaltyBalance, getMyLoyaltyTransactions, redeemLoyaltyPoints } from '@/lib/orders/loyalty-service';
import type { LoyaltyBalance, LoyaltyTransaction } from '@/lib/domain/types';

export default function LoyaltyPage() {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    (async () => {
      const [bal, txns] = await Promise.all([
        getMyLoyaltyBalance(),
        getMyLoyaltyTransactions(),
      ]);
      setBalance(bal);
      setTransactions(txns);
      setLoading(false);
    })();
  }, []);

  const handleRedeem = async () => {
    if (!balance || balance.points < balance.minRedemptionPoints) return;
    setRedeeming(true);
    const result = await redeemLoyaltyPoints(balance.points);
    if (result.ok) {
      setBalance((prev) => prev ? { ...prev, points: 0 } : prev);
    }
    setRedeeming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading loyalty info…</p>
      </div>
    );
  }

  const canRedeem = balance && balance.points >= balance.minRedemptionPoints;
  const redeemValue = balance ? Math.floor(balance.points / 100) * 10 : 0;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Loyalty rewards</h2>

      {/* Balance card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="bg-primary/10 grid size-16 place-items-center rounded-full">
            <Star className="text-primary size-8" />
          </div>
          <div>
            <p className="text-4xl font-bold tabular-nums">{balance?.points ?? 0}</p>
            <p className="text-muted-foreground text-sm">points available</p>
          </div>
          {balance && (
            <p className="text-muted-foreground text-xs">
              Earn {balance.pointsPerRandSpent} point per R1 spent · {balance.referralBonusPoints} points for each referral
            </p>
          )}
          <Button
            onClick={handleRedeem}
            disabled={!canRedeem || redeeming}
            className="gap-2"
          >
            {redeeming ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />}
            Redeem {redeemValue > 0 ? `R${redeemValue}` : `${balance?.minRedemptionPoints ?? 1000} pts needed`}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <TrendingUp className="text-muted-foreground size-5" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{balance?.lifetimePoints ?? 0}</p>
              <p className="text-muted-foreground text-xs">Lifetime points earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Gift className="text-muted-foreground size-5" />
            <div>
              <p className="text-2xl font-bold tabular-nums">R{redeemValue}</p>
              <p className="text-muted-foreground text-xs">Available discount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Points history</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No points earned yet. Place an order to start earning!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={txn.type === 'earned' ? 'default' : txn.type === 'redeemed' ? 'secondary' : 'outline'}>
                      {txn.type}
                    </Badge>
                    <div>
                      <p className="text-sm">{txn.description ?? txn.type}</p>
                      <p className="text-muted-foreground text-xs">{new Date(txn.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold tabular-nums ${txn.points > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {txn.points > 0 ? '+' : ''}{txn.points} pts
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
