'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, Copy, Check, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getMyReferralInfo } from '@/lib/orders/loyalty-service';
import type { ReferralInfo } from '@/lib/domain/types';

export default function ReferralsPage() {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getMyReferralInfo();
      setInfo(data);
      setLoading(false);
    })();
  }, []);

  const handleCopy = async () => {
    if (!info?.code) return;
    await navigator.clipboard.writeText(info.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading referral info…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Refer &amp; Earn</h2>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="bg-primary/10 grid size-16 place-items-center rounded-full">
            <Users className="text-primary size-8" />
          </div>
          <h3 className="text-lg font-semibold">Share the love, earn rewards</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Give your friends your referral code. When they place their first order,
            you both earn 500 loyalty points (R50 value).
          </p>

          {info?.code && (
            <div className="flex w-full max-w-xs gap-2">
              <Input value={info.code} readOnly className="text-center font-mono text-lg font-bold" />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-5 text-center">
            <p className="text-3xl font-bold tabular-nums">{info?.totalReferrals ?? 0}</p>
            <p className="text-muted-foreground text-xs">Total referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-5 text-center">
            <p className="text-3xl font-bold tabular-nums">{info?.completedReferrals ?? 0}</p>
            <p className="text-muted-foreground text-xs">Completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-5 text-center">
            <div className="flex items-center gap-1">
              <Gift className="text-primary size-4" />
              <p className="text-3xl font-bold tabular-nums">{info?.totalPointsEarned ?? 0}</p>
            </div>
            <p className="text-muted-foreground text-xs">Points earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <h3 className="font-medium">How it works</h3>
          <ol className="flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">1</span>
              <span>Share your referral code with friends and family</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">2</span>
              <span>They sign up and place their first order using your code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold">3</span>
              <span>You both earn 500 loyalty points automatically</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
