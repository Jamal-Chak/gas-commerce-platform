'use server';

import { createServiceRoleClient } from '@/lib/supabase/serverClient';

export async function createPromoCode(input: {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  scope: 'cart' | 'product' | 'category' | 'delivery';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const { error } = await supabase.from('promo_codes').insert({
    code: input.code.toUpperCase().trim(),
    description: input.description ?? null,
    type: input.type,
    scope: input.scope,
    value: input.value,
    min_order_amount: input.minOrderAmount,
    max_discount: input.maxDiscount ?? null,
    usage_limit: input.usageLimit ?? null,
    usage_count: 0,
    expires_at: input.expiresAt ?? null,
    active: true,
  });

  if (error) {
    console.error('[admin] Create promo error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function togglePromoActive(promoId: string, active: boolean): Promise<{ ok: boolean }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false };

  await supabase.from('promo_codes').update({ active }).eq('id', promoId);
  return { ok: true };
}

export async function deletePromoCode(promoId: string): Promise<{ ok: boolean }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false };

  await supabase.from('promo_codes').delete().eq('id', promoId);
  return { ok: true };
}
