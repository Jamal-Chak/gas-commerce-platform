'use server';

import { getOrderById, type PlacedOrder } from '@/lib/orders/order-service';

/**
 * Server action to look up an order by ID.
 * Checks the database first (real orders), then falls back to
 * the demo localStorage store.
 */
export async function lookupOrderAction(id: string): Promise<PlacedOrder | null> {
  return getOrderById(id);
}
