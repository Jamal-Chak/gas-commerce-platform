import { Address, CustomerProfile, Order } from '../domain/types';

/**
 * CUSTOMER DATA ACCESS
 * --------------------
 * Customer-scoped data must come from authenticated server/database
 * operations — never from unauthenticated client calls, and never from
 * hard-coded mock records.
 *
 * CURRENT STATE: the Supabase database and authentication are not deployed
 * yet, so these boundaries intentionally return empty values. The UI
 * (account pages) renders the corresponding empty states until the backend
 * is connected. The real implementations MUST:
 *   1. resolve the authenticated user server-side (Supabase session),
 *   2. query ONLY rows owned by that user (RLS enforced),
 *   3. never accept a customer id from the client.
 */

export async function getCurrentCustomerProfile(): Promise<CustomerProfile | null> {
  // TODO(backend): resolve session server-side and fetch `customers` by auth uid.
  return null;
}

export async function getCurrentUserAddresses(): Promise<Address[]> {
  // TODO(backend): fetch `addresses` for the authenticated customer only.
  return [];
}

export async function getCurrentUserOrders(): Promise<Order[]> {
  // TODO(backend): fetch `orders` for the authenticated customer only.
  return [];
}
