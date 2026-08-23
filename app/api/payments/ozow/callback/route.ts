import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentCallback } from '@/lib/orders/payment-service';
import crypto from 'node:crypto';

/**
 * Ozow payment callback endpoint.
 * Receives POST callbacks from Ozow when payment status changes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify Ozow callback signature
    const apiKey = process.env.OZOW_API_KEY;
    if (apiKey && apiKey !== 'your-ozow-key') {
      const receivedHash = request.headers.get('X-Ozow-Checksum');
      const payload = JSON.stringify(body);
      const expectedHash = crypto
        .createHmac('sha256', apiKey)
        .update(payload)
        .digest('hex');

      if (receivedHash !== expectedHash) {
        console.error('[Ozow Callback] Signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Map Ozow status to our status
    const ozowStatus = body.Status ?? body.TransactionStatus;
    let status: 'success' | 'failed' | 'pending';
    if (ozowStatus === 'Complete' || ozowStatus === 3) status = 'success';
    else if (ozowStatus === 'Failed' || ozowStatus === 4) status = 'failed';
    else status = 'pending';

    const orderId = body.MerchantReference ?? body.TransactionReference;
    const amount = Number(body.Amount ?? 0);
    const reference = body.BankReference ?? '';

    if (orderId) {
      await handlePaymentCallback({
        provider: 'ozow',
        orderId: String(orderId),
        reference,
        status,
        amount,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[Ozow Callback] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
