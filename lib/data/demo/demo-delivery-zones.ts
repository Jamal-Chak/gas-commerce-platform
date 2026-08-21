import { DeliveryZone } from '../../domain/types';

/**
 * DEMO DELIVERY ZONES
 * -------------------
 * Temporary values mirroring `supabase/seed.sql`. Replace this data source
 * with the Supabase `delivery_zones` table via `lib/data/delivery.ts`.
 * Production delivery fees must come from the database, never be hard-coded.
 */
export const demoDeliveryZones: DeliveryZone[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Zone A — Downtown',
    description: 'Central business district and surrounding areas',
    deliveryFee: 5,
    estimatedMinutes: 30,
    active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Zone B — Suburbs',
    description: 'Residential suburban communities',
    deliveryFee: 10,
    estimatedMinutes: 45,
    active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    name: 'Zone C — Outer Rim',
    description: 'Far outreach and rural areas',
    deliveryFee: 20,
    estimatedMinutes: 75,
    active: true,
  },
];
