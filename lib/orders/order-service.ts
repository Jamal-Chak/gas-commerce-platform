import { Address, OrderStatus, PaymentMethod, PaymentStatus } from '../domain/types';
import { getDeliveryZoneById } from '../data/delivery';
import { CartLine } from '../cart/types';
import { getDemoOrder, PlacedOrder, PlacedOrderLine, saveDemoOrder } from './demo-order-store';

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

/**
 * Places an order through the trusted order-service boundary.
 *
 * DEMO MODE — the real implementation MUST live on the server and:
 *   1. Validate the payload with Zod (see lib/validators/checkout.ts).
 *   2. Recalculate every price from the `products` table — never trust
 *      client-side subtotals/totals.
 *   3. Reserve inventory atomically (PostgreSQL transaction, row locks).
 *   4. Insert `orders`, `order_items`, `payments`, `deliveries` rows with the
 *      service-role client (customers cannot insert orders directly — RLS).
 *   5. Return the persisted order (with real order number + status).
 *
 * Until that server service exists, this returns a clearly-labelled demo
 * order stored in the browser only.
 */
export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  if (!input.lines.length) {
    return { ok: false, code: 'EMPTY_CART', message: 'Your cart is empty.' };
  }

  const zone = await getDeliveryZoneById(input.delivery.zoneId);

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
    zoneName: zone?.name ?? null,
    estimatedMinutes: zone?.estimatedMinutes ?? null,
    paymentMethod: input.paymentMethod,
    createdAt: new Date().toISOString(),
  };

  saveDemoOrder(order);

  return {
    ok: true,
    order,
    notice:
      'Demo order preview. No real order was created — connect the order service to place real orders.',
  };
}

export { getDemoOrder };

export function emptyAddress(): Address {
  return {
    id: '',
    label: '',
    addressLine: '',
    city: '',
    area: '',
    deliveryInstructions: null,
  };
}
