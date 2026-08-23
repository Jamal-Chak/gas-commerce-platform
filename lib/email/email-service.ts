'use server';

import { Resend } from 'resend';

/**
 * Email notification service powered by Resend.
 * Falls back to console logging when RESEND_API_KEY is not configured.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_xxxx') return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? 'orders@embergas.co.za';
}

export async function sendOrderConfirmation(email: string, orderId: string, total: number): Promise<{ ok: boolean }> {
  if (!email || !orderId) return { ok: false };

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Ember Gas</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
        <h2 style="margin: 0 0 16px;">Order Confirmed!</h2>
        <p style="color: #6b7280; margin: 0 0 16px;">
          Thank you for your order. We're preparing your gas cylinders for delivery.
        </p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 0 0 16px;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 0;"><strong>Total:</strong> R${total.toFixed(2)}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          You can track your order status at any time in your account dashboard.
        </p>
      </div>
      <div style="padding: 16px 24px; background: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          &copy; Ember Gas — Safe gas delivery, powered by technology.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order ${orderId} Confirmed — Ember Gas`, html });
}

export async function sendOrderStatusUpdate(email: string, orderId: string, status: string): Promise<{ ok: boolean }> {
  if (!email || !orderId) return { ok: false };

  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    preparing: 'Your gas cylinders are being prepared for delivery.',
    out_for_delivery: 'Your order is out for delivery! Expect it soon.',
    delivered: 'Your order has been delivered. Thank you for choosing Ember Gas!',
    cancelled: 'Your order has been cancelled. Please contact us if you have questions.',
  };

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Ember Gas</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
        <h2 style="margin: 0 0 16px;">Order Update</h2>
        <p style="color: #6b7280; margin: 0 0 16px;">
          ${statusMessages[status] ?? `Your order status has been updated to: ${status}`}
        </p>
        <p style="margin: 0;"><strong>Order:</strong> ${orderId}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order ${orderId} Update — Ember Gas`, html });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ ok: boolean }> {
  if (!email) return { ok: false };

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Ember Gas</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
        <h2 style="margin: 0 0 16px;">Password Reset</h2>
        <p style="color: #6b7280; margin: 0 0 16px;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: 'Reset Your Password — Ember Gas', html });
}

async function sendEmail(options: EmailOptions): Promise<{ ok: boolean }> {
  const resend = getResendClient();

  if (!resend) {
    // Fallback: log to console when Resend is not configured
    console.log(`[Email] To: ${options.to} | Subject: ${options.subject}`);
    return { ok: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return { ok: false };
  }
}
