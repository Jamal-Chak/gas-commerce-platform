'use server';

import { OrderStatus, PaymentMethod, PaymentStatus } from '../domain/types';
import { getDeliveryZoneById } from '../data/delivery';
import { CartLine } from '../cart/types';
import { getDemoOrder, PlacedOrder, PlacedOrderLine, saveDemoOrder } from './demo-order-store';
import { checkoutSchema } from '../validators/checkout';
import { createServiceRoleClient, createSupabaseServerClient } from '../supabase/serverClient';

export type { PlacedOrder, PlacedOrderLine };

export interface OrderCustomerInput {
  fullName: string;
  phone: string;
  email: string;
}

export interface OrderDeliveryInput {
  zoneId: string;
  addressLabel: string;
  addressLine: string;
  city: string;
  area: string;
  deliveryInstructions?: string;
}

export interface OrderInput {
  lines: CartLine[];
  customer: OrderCustomerInput;
  delivery: OrderDeliveryInput;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder; notice: string }
  | {
      ok: false;
      code: 'ORDER_SERVICE_UNAVAILABLE' | 'INVALID_INPUT' | 'EMPTY_CART';
      message: string;
    };

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateOrderNumber(): string {
  const suffix = Date.now().toString().slice(-8);
  return `ORD-${suffix}`;
}

/**
 * Places an order through the trusted server-side order service.
 *
 * PRODUCTION FLOW (when Supabase is configured):
 *   1. Validate the payload with Zod.
 *   2. Recalculate every price from the `products` table — never trust
 *      client-side subtotals/totals.
 *   3. Insert `orders`, `order_items` rows with the service-role client.
 *   4. Return the persisted order with a real order number + status.
 *
 * DEMO FLOW (when Supabase is not configured):
 *   Returns a clearly-labelled demo order stored in the browser only.
 */
export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  if (!input.lines.length) {
    return { ok: false, code: 'EMPTY_CART', message: 'Your cart is empty.' };
  }

  // Validate input with Zod.
  const parsed = checkoutSchema.safeParse({
    contact: input.customer,
    delivery: input.delivery,
    payment: { method: input.paymentMethod },
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: parsed.error.issues.map((e: { message: string }) => e.message).join(' '),
    };
  }

  // Try the real database flow first.
  const dbResult = await placeOrderInDatabase(input);
  if (dbResult) return dbResult;

  // Fallback to demo mode when Supabase is not configured.
  return placeDemoOrder(input);
}

/**
 * Attempts to place the order in the Supabase database.
 * Returns null if Supabase is not configured (caller falls back to demo).
 */
async function placeOrderInDatabase(
  input: OrderInput
): Promise<PlaceOrderResult | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  try {
    // 1. Get the authenticated user.
    const authClient = await createSupabaseServerClient();
    if (!authClient) return null;

    const { data: { user } } = await authClient.auth.getUser();

    // 2. Resolve or create the customer record.
    let customerId: string | null = null;
    if (user) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (existing) {
        customerId = existing.id as string;
      } else {
        const { data: newCustomer, error: custErr } = await supabase
          .from('customers')
          .insert({
            auth_user_id: user.id,
            full_name: input.customer.fullName,
            phone: input.customer.phone,
          })
          .select('id')
          .single();

        if (custErr || !newCustomer) {
          console.error('[order] Failed to create customer:', custErr?.message);
          return null;
        }
        customerId = newCustomer.id as string;
      }
    }

    // 3. Recalculate prices from the products table (never trust client prices).
    const productIds = input.lines.map((l) => l.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', productIds);

    const priceMap = new Map<string, number>();
    if (products) {
      for (const p of products as { id: string; price: number; sale_price: number | null }[]) {
        priceMap.set(p.id, p.sale_price ?? p.price);
      }
    }

    // 4. Calculate totals from server-side prices.
    let serverSubtotal = 0;
    const validatedLines: { line: CartLine; unitPrice: number; lineTotal: number }[] = [];
    for (const line of input.lines) {
      const unitPrice = priceMap.get(line.productId) ?? line.unitPrice ?? 0;
      const lineTotal = unitPrice * line.quantity;
      serverSubtotal += lineTotal;
      validatedLines.push({ line, unitPrice, lineTotal });
    }

    // 5. Look up the delivery zone fee from the database.
    const zone = await getDeliveryZoneById(input.delivery.zoneId);
    const serverDeliveryFee = zone?.deliveryFee ?? input.deliveryFee;
    const serverTotal = serverSubtotal + serverDeliveryFee;

    // 6. Insert the address if we have a customer.
    let addressId: string | null = null;
    if (customerId) {
      const { data: addr } = await supabase
        .from('addresses')
        .insert({
          customer_id: customerId,
          label: input.delivery.addressLabel,
          address_line: input.delivery.addressLine,
          city: input.delivery.city,
          area: input.delivery.area,
          delivery_instructions: input.delivery.deliveryInstructions || null,
        })
        .select('id')
        .single();

      if (addr) addressId = addr.id as string;
    }

    // 7. Insert the order.
    const orderNumber = generateOrderNumber();
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: 'PENDING',
        subtotal: serverSubtotal,
        delivery_fee: serverDeliveryFee,
        total: serverTotal,
        payment_status: input.paymentMethod === 'pay_online' ? 'PENDING' : 'PENDING',
        delivery_address_id: addressId,
      })
      .select('id, order_number, status, subtotal, delivery_fee, total, payment_status, created_at')
      .single();

    if (orderErr || !orderRow) {
      console.error('[order] Failed to create order:', orderErr?.message);
      return {
        ok: false,
        code: 'ORDER_SERVICE_UNAVAILABLE',
        message: 'Could not create your order. Please try again.',
      };
    }

    // 8. Insert order items.
    const orderItems = validatedLines.map(({ line, unitPrice, lineTotal }) => ({
      order_id: orderRow.id as string,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
      console.error('[order] Failed to create order items:', itemsErr.message);
    }

    // 9. Build the result.
    const order: PlacedOrder = {
      id: orderRow.id as string,
      orderNumber: orderRow.order_number as string,
      demo: false,
      lines: validatedLines.map(({ line, unitPrice, lineTotal }, idx) => ({
        id: `line-${idx}`,
        name: line.name,
        slug: line.slug,
        serviceType: line.serviceType,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice,
        totalPrice: lineTotal,
        cylinderSize: line.cylinderSize,
      })),
      subtotal: orderRow.subtotal as number,
      deliveryFee: orderRow.delivery_fee as number,
      total: orderRow.total as number,
      status: (orderRow.status as string).toLowerCase() as OrderStatus,
      paymentStatus: (orderRow.payment_status as string).toLowerCase() as PaymentStatus,
      customer: { ...input.customer },
      deliveryAddress: {
        id: addressId ?? 'new',
        label: input.delivery.addressLabel,
        addressLine: input.delivery.addressLine,
        city: input.delivery.city,
        area: input.delivery.area,
        deliveryInstructions: input.delivery.deliveryInstructions || null,
      },
      zoneName: zone?.name ?? null,
      estimatedMinutes: zone?.estimatedMinutes ?? null,
      paymentMethod: input.paymentMethod,
      createdAt: orderRow.created_at as string,
    };

    return {
      ok: true,
      order,
      notice: 'Your order has been placed successfully!',
    };
  } catch (err) {
    console.error('[order] Database error:', err);
    return null;
  }
}

/**
 * Demo-mode order placement (browser-only, no database).
 */
function placeDemoOrder(input: OrderInput): PlaceOrderResult {
  const order: PlacedOrder = {
    id: newId(),
    orderNumber: `DEMO-${Date.now().toString().slice(-8)}`,
    demo: true,
    lines: input.lines.map((line, index) => ({
      id: `line-${index}`,
      name: line.name,
      slug: line.slug,
      serviceType: line.serviceType,
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice ?? 0,
      totalPrice: (line.unitPrice ?? 0) * line.quantity,
      cylinderSize: line.cylinderSize,
    })),
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    customer: { ...input.customer },
    deliveryAddress: {
      id: 'demo-address',
      label: input.delivery.addressLabel,
      addressLine: input.delivery.addressLine,
      city: input.delivery.city,
      area: input.delivery.area,
      deliveryInstructions: input.delivery.deliveryInstructions || null,
    },
    zoneName: null,
    estimatedMinutes: null,
    paymentMethod: input.paymentMethod,
    createdAt: new Date().toISOString(),
  };

  saveDemoOrder(order);

  return {
    ok: true,
    order,
    notice:
      'Demo order preview. No real order was created — connect Supabase to place real orders.',
  };
}

export { getDemoOrder };

/**
 * Looks up an order by ID — checks the database first (for real orders),
 * then falls back to the demo localStorage store.
 */
export async function getOrderById(id: string): Promise<PlacedOrder | null> {
  // Try the database first.
  try {
    const supabase = createServiceRoleClient();
    if (supabase) {
      const { data: orderRow, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && orderRow) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        return {
          id: orderRow.id as string,
          orderNumber: orderRow.order_number as string,
          demo: false,
          lines: (items ?? []).map((item: Record<string, unknown>) => ({
            id: String(item.id),
            name: '',
            slug: '',
            serviceType: 'REFILL' as import('../domain/types').ServiceType,
            productId: String(item.product_id),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.line_total),
            cylinderSize: null,
          })),
          subtotal: Number(orderRow.subtotal),
          deliveryFee: Number(orderRow.delivery_fee),
          total: Number(orderRow.total),
          status: (orderRow.status as string).toLowerCase() as OrderStatus,
          paymentStatus: (orderRow.payment_status as string).toLowerCase() as PaymentStatus,
          customer: null,
          deliveryAddress: null,
          zoneName: null,
          estimatedMinutes: null,
          paymentMethod: 'pay_on_delivery',
          createdAt: String(orderRow.created_at),
        };
      }
    }
  } catch {
    // Fall through to demo lookup.
  }

  // Fallback to demo store.
  return getDemoOrder(id);
}
