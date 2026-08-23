'use server';

import crypto from 'node:crypto';
import { createServiceRoleClient } from '../supabase/serverClient';

/**
 * PayFast payment gateway integration.
 * Handles signature generation, payment initiation, and ITN (Instant Transaction Notification) callbacks.
 * 
 * @see https://developers.payfast.co.za/docs
 */

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

function getPayFastConfig(): PayFastConfig | null {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? '';

  if (!merchantId || !merchantKey || merchantId === 'your-merchant-id') return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    merchantId,
    merchantKey,
    passphrase,
    returnUrl: `${siteUrl}/order/payment-success`,
    cancelUrl: `${siteUrl}/order/payment-cancelled`,
    notifyUrl: `${siteUrl}/api/payments/payfast/itn`,
  };
}

/**
 * Generate MD5 signature for PayFast payment form.
 */
function generatePayFastSignature(data: Record<string, string>, passphrase: string): string {
  // Step 1: Create parameter string from sorted key-value pairs
  const sortedKeys = Object.keys(data).sort();
  const params = sortedKeys.map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`).join('&');

  // Step 2: Append passphrase if set
  const signatureString = passphrase ? `${params}&passphrase=${encodeURIComponent(passphrase)}` : params;

  // Step 3: Generate MD5 hash
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Initiate a PayFast payment.
 * Returns form data that must be POSTed to PayFast.
 */
export async function initiatePayFastPayment(orderId: string): Promise<{
  ok: boolean;
  formData?: Record<string, string>;
  gatewayUrl?: string;
  error?: string;
}> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const config = getPayFastConfig();
  if (!config) {
    return { ok: false, error: 'PayFast not configured. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.' };
  }

  // Fetch the order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, order_number, total, customer_id')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return { ok: false, error: 'Order not found' };
  }

  // Create payment record
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      provider: 'payfast',
      amount: order.total,
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (payErr || !payment) {
    return { ok: false, error: 'Failed to create payment record' };
  }

  // Update order payment provider
  await supabase
    .from('orders')
    .update({ payment_provider: 'payfast' })
    .eq('id', orderId);

  // Build PayFast form data
  const amount = Number(order.total).toFixed(2);
  const formData: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
    name_first: 'Customer',
    name_last: 'Name',
    email_address: 'customer@example.com',
    m_payment_id: String(payment.id),
    amount: amount,
    item_name: `Order ${order.order_number}`,
    custom_str1: orderId,
  };

  // Generate signature
  formData.signature = generatePayFastSignature(formData, config.passphrase);

  // Determine gateway URL (sandbox vs production)
  const isSandbox = process.env.PAYFAST_SANDBOX !== 'false';
  const gatewayUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  return {
    ok: true,
    formData,
    gatewayUrl,
  };
}

/**
 * Verify PayFast ITN (Instant Transaction Notification) callback.
 * Validates the signature and updates payment status.
 */
export async function verifyPayFastCallback(formData: Record<string, string>): Promise<{
  ok: boolean;
  orderId?: string;
  status?: 'success' | 'failed' | 'pending';
  amount?: number;
  error?: string;
}> {
  const config = getPayFastConfig();
  if (!config) return { ok: false, error: 'PayFast not configured' };

  // Verify signature
  const receivedSignature = formData.signature;
  const { signature: _, ...dataWithoutSig } = formData;
  const calculatedSignature = generatePayFastSignature(dataWithoutSig, config.passphrase);

  if (receivedSignature !== calculatedSignature) {
    console.error('[PayFast] Signature mismatch');
    return { ok: false, error: 'Invalid signature' };
  }

  // Determine payment status
  const paymentStatus = formData.payment_status;
  let status: 'success' | 'failed' | 'pending';
  if (paymentStatus === 'COMPLETE') status = 'success';
  else if (paymentStatus === 'FAILED') status = 'failed';
  else status = 'pending';

  const amount = parseFloat(formData.amount_gross ?? '0');
  const orderId = formData.custom_str1;

  return {
    ok: true,
    orderId,
    status,
    amount,
  };
}

/**
 * Initiate an Ozow payment.
 * Creates a payment link via the Ozow API.
 * 
 * @see https://support.ozow.com/hc/en-us/sections/121831-Integration
 */
export async function initiateOzowPayment(orderId: string): Promise<{
  ok: boolean;
  redirectUrl?: string;
  error?: string;
}> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const apiKey = process.env.OZOW_API_KEY;
  const merchantId = process.env.OZOW_MERCHANT_ID;

  if (!apiKey || !merchantId || apiKey === 'your-ozow-key') {
    return { ok: false, error: 'Ozow not configured. Set OZOW_API_KEY and OZOW_MERCHANT_ID.' };
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total')
    .eq('id', orderId)
    .single();

  if (!order) return { ok: false, error: 'Order not found' };

  // Create payment record
  const { data: payment } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      provider: 'ozow',
      amount: order.total,
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (!payment) {
    return { ok: false, error: 'Failed to create payment record' };
  }

  await supabase
    .from('orders')
    .update({ payment_provider: 'ozow' })
    .eq('id', orderId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Call Ozow API to create payment link
  try {
    const response = await fetch('https://api.ozow.com/post/CreateHostPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ozow-ApiKey': apiKey,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        AccountId: merchantId,
        BankReference: order.order_number,
        Amount: Number(order.total),
        TransactionReference: String(payment.id),
        CancelUrl: `${siteUrl}/order/payment-cancelled`,
        ReturnUrl: `${siteUrl}/order/payment-success`,
        NotifyUrl: `${siteUrl}/api/payments/ozow/callback`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Ozow] API error:', errorText);
      return { ok: false, error: 'Ozow API request failed' };
    }

    const result = await response.json();

    return {
      ok: true,
      redirectUrl: result.Url ?? result.RedirectUrl,
    };
  } catch (err) {
    console.error('[Ozow] Request failed:', err);
    return { ok: false, error: 'Failed to create Ozow payment' };
  }
}

/**
 * Handle payment callback from external gateway.
 * Called by PayFast/Ozow webhook to confirm payment.
 */
export async function handlePaymentCallback(input: {
  provider: string;
  orderId: string;
  reference: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: 'Database not configured' };

  const paymentStatus = input.status === 'success' ? 'PAID' : input.status === 'failed' ? 'FAILED' : 'PENDING';

  // Update payment record
  const { error: payErr } = await supabase
    .from('payments')
    .update({
      status: paymentStatus,
      provider_reference: input.reference,
      paid_at: input.status === 'success' ? new Date().toISOString() : null,
      callback_data: { provider: input.provider, raw_status: input.status },
    })
    .eq('order_id', input.orderId)
    .eq('provider', input.provider);

  if (payErr) {
    console.error('[payment] Callback update error:', payErr.message);
    return { ok: false, error: 'Failed to update payment' };
  }

  // Update order payment status
  if (input.status === 'success') {
    await supabase
      .from('orders')
      .update({ payment_status: 'PAID' })
      .eq('id', input.orderId);
  } else if (input.status === 'failed') {
    await supabase
      .from('orders')
      .update({ payment_status: 'FAILED' })
      .eq('id', input.orderId);
  }

  return { ok: true };
}

/**
 * Validate promo code and calculate discount.
 */
export async function validatePromoCode(code: string, cartTotal: number): Promise<{
  valid: boolean;
  discount: number;
  message: string;
  promoId?: string;
}> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { valid: false, discount: 0, message: 'System unavailable' };

  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();

  if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };

  const now = new Date().toISOString();

  if (promo.starts_at > now) return { valid: false, discount: 0, message: 'This promo code is not yet active' };
  if (promo.expires_at && promo.expires_at < now) return { valid: false, discount: 0, message: 'This promo code has expired' };
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit) return { valid: false, discount: 0, message: 'This promo code has reached its usage limit' };
  if (cartTotal < (promo.min_order_amount ?? 0)) return { valid: false, discount: 0, message: `Minimum order amount is R${promo.min_order_amount}` };

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = cartTotal * (Number(promo.value) / 100);
    if (promo.max_discount) discount = Math.min(discount, Number(promo.max_discount));
  } else if (promo.type === 'fixed') {
    discount = Number(promo.value);
  } else if (promo.type === 'free_delivery') {
    discount = -1; // Signal for free delivery
  }

  discount = Math.min(discount, cartTotal);

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    message: `Promo applied! You save R${discount.toFixed(2)}`,
    promoId: String(promo.id),
  };
}
