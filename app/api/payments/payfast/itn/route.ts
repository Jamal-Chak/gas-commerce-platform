import { NextRequest, NextResponse } from 'next/server';
import { verifyPayFastCallback, handlePaymentCallback } from '@/lib/orders/payment-service';

/**
 * PayFast ITN (Instant Transaction Notification) endpoint.
 * Receives POST callbacks from PayFast when payment status changes.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    const result = await verifyPayFastCallback(data);

    if (!result.ok) {
      console.error('[PayFast ITN] Verification failed:', result.error);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    if (result.orderId && result.status && result.amount != null) {
      await handlePaymentCallback({
        provider: 'payfast',
        orderId: result.orderId,
        reference: data.pf_payment_id ?? '',
        status: result.status,
        amount: result.amount,
      });
    }

    // PayFast expects a 200 response with body "OK" or "FAIL"
    return NextResponse.json('OK', { status: 200 });
  } catch (err) {
    console.error('[PayFast ITN] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
