import { DeliveryZone } from '../domain/types';
import { demoDeliveryZones } from './demo/demo-delivery-zones';

/**
 * DELIVERY DATA ACCESS
 * --------------------
 * Delivery zones and fees must come from the database in production.
 *
 * CURRENT STATE: backed by demo zones (mirrors `supabase/seed.sql`).
 *
 * PRODUCTION INTEGRATION (once the database is deployed):
 *
 *   const supabase = createServerSupabaseClient();
 *   const { data } = await supabase
 *     .from('delivery_zones')
 *     .select('*')
 *     .eq('active', true);
 *   // map snake_case rows to the domain DeliveryZone type.
 */

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  return demoDeliveryZones.filter((zone) => zone.active !== false);
}

export async function getDeliveryZoneById(id: string): Promise<DeliveryZone | null> {
  return (await getDeliveryZones()).find((zone) => zone.id === id) ?? null;
}
