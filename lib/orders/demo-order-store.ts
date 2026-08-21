import {
  Address,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceType,
} from '../domain/types';

/**
 * DEMO ORDER STORE (client-only)
 * ------------------------------
 * Stores orders created by the checkout in demo mode so the confirmation
 * screen can be previewed. This uses `localStorage` and therefore must only
 * be called from Client Components.
 *
 * When the real order service is connected, this file becomes obsolete:
 * orders will be persisted server-side and `/order/[id]` will read from the
 * database through an authenticated server lookup.
 */

const STORAGE_KEY = 'ember-gas.demo-orders';

export interface PlacedOrderLine extends OrderItem {
  name: string;
  slug: string;
  serviceType: ServiceType;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  demo: boolean;
  lines: PlacedOrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  } | null;
  deliveryAddress: Address | null;
  zoneName: string | null;
  estimatedMinutes: number | null;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export function saveDemoOrder(order: PlacedOrder): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const orders: PlacedOrder[] = raw ? (JSON.parse(raw) as PlacedOrder[]) : [];
    orders.unshift(order);
    // Keep only the 20 most recent demo orders.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 20)));
  } catch {
    // localStorage may be unavailable (private browsing / storage disabled).
  }
}

export function getDemoOrder(id: string): PlacedOrder | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const orders = JSON.parse(raw) as PlacedOrder[];
    return orders.find((order) => order.id === id) ?? null;
  } catch {
    return null;
  }
}
