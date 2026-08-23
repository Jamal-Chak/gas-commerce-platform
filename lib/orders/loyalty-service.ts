'use server';

import { createServiceRoleClient, createSupabaseServerClient } from '../supabase/serverClient';
import type { LoyaltyBalance, LoyaltyTransaction, ReferralInfo } from '../domain/types';

/**
 * Get the authenticated customer's loyalty balance and settings.
 */
export async function getMyLoyaltyBalance(): Promise<LoyaltyBalance | null> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return null;

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  const [{ data: customer }, { data: settings }] = await Promise.all([
    supabase.from('customers').select('loyalty_points').eq('auth_user_id', user.id).single(),
    supabase.from('loyalty_settings').select('*').single(),
  ]);

  if (!customer || !settings) return null;

  // Calculate lifetime points from transactions
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('customer_id', customer.id)
    .eq('type', 'earned');

  const lifetimePoints = transactions?.reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.points), 0) ?? 0;

  return {
    points: Number(customer.loyalty_points),
    lifetimePoints,
    pointsPerRandSpent: Number(settings.points_per_rand_spent),
    referralBonusPoints: Number(settings.referral_bonus_points),
    minRedemptionPoints: Number(settings.min_redemption_points),
  };
}

/**
 * Get loyalty transaction history.
 */
export async function getMyLoyaltyTransactions(limit = 20): Promise<LoyaltyTransaction[]> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return [];

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return [];

  const supabase = createServiceRoleClient();
  if (!supabase) return [];

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) return [];

  const { data } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    points: Number(row.points),
    type: row.type as LoyaltyTransaction['type'],
    description: row.description as string | null,
    orderId: row.order_id as string | null,
    createdAt: String(row.created_at),
  }));
}

/**
 * Redeem loyalty points for a discount.
 */
export async function redeemLoyaltyPoints(points: number): Promise<{ ok: boolean; discount: number; error?: string }> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return { ok: false, discount: 0, error: 'Authentication not configured' };

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { ok: false, discount: 0, error: 'Not authenticated' };

  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, discount: 0, error: 'Database not configured' };

  const { data: customer } = await supabase
    .from('customers')
    .select('id, loyalty_points')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) return { ok: false, discount: 0, error: 'Customer not found' };

  const currentPoints = Number(customer.loyalty_points);
  if (points > currentPoints) return { ok: false, discount: 0, error: 'Insufficient points' };

  // 100 points = R10 discount
  const discount = Math.floor(points / 100) * 10;
  if (discount <= 0) return { ok: false, discount: 0, error: 'Not enough points for a discount' };

  // Deduct points
  await supabase
    .from('customers')
    .update({ loyalty_points: currentPoints - points })
    .eq('id', customer.id);

  // Log transaction
  await supabase.from('loyalty_transactions').insert({
    customer_id: customer.id,
    points: -points,
    type: 'redeemed',
    description: `Redeemed ${points} points for R${discount} discount`,
  });

  return { ok: true, discount };
}

/**
 * Get referral info for the authenticated customer.
 */
export async function getMyReferralInfo(): Promise<ReferralInfo | null> {
  const authClient = await createSupabaseServerClient();
  if (!authClient) return null;

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  const { data: customer } = await supabase
    .from('customers')
    .select('id, referral_code')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) return null;

  // Generate referral code if not exists
  let referralCode = customer.referral_code as string | null;
  if (!referralCode) {
    referralCode = `EMBER-${user.id.slice(0, 6).toUpperCase()}`;
    await supabase
      .from('customers')
      .update({ referral_code: referralCode })
      .eq('id', customer.id);
  }

  // Count referrals
  const { data: referrals } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', customer.id);

  const total = referrals?.length ?? 0;
  const completed = referrals?.filter((r: Record<string, unknown>) => r.status === 'completed' || r.status === 'rewarded').length ?? 0;

  // Calculate points earned from referrals
  const { data: referralTxns } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('customer_id', customer.id)
    .eq('type', 'referral');

  const totalPointsEarned = referralTxns?.reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.points), 0) ?? 0;

  return {
    code: referralCode,
    totalReferrals: total,
    completedReferrals: completed,
    totalPointsEarned,
  };
}
