'use server';

import { DeliveryZone } from '../domain/types';
import { createPublicServerClient } from '../supabase/serverClient';
import { demoDeliveryZones } from './demo/demo-delivery-zones';

/**
 * DELIVERY DATA ACCESS
 * --------------------
 * When Supabase is configured, delivery zones come from the `delivery_zones`
 * table. Falls back to demo data when the database is not connected.
 */

function mapZoneRow(row: Record<string, unknown>): DeliveryZone {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    deliveryFee: Number(row.delivery_fee),
    estimatedMinutes: Number(row.estimated_minutes),
    active: Boolean(row.active),
  };
}

async function fetchZonesFromSupabase(): Promise<DeliveryZone[] | null> {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('active', true)
      .order('delivery_fee');

    if (error) {
      console.error('[delivery] Supabase error:', error.message);
      return null;
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapZoneRow(row));
  } catch (err) {
    console.error('[delivery] Failed to fetch from Supabase:', err);
    return null;
  }
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const dbZones = await fetchZonesFromSupabase();
  if (dbZones && dbZones.length > 0) return dbZones;
  return demoDeliveryZones.filter((zone) => zone.active !== false);
}

export async function getDeliveryZoneById(id: string): Promise<DeliveryZone | null> {
  return (await getDeliveryZones()).find((zone) => zone.id === id) ?? null;
}
