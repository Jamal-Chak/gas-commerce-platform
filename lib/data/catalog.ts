import { Product, ServiceType } from '../domain/types';
import { demoProducts } from './demo/demo-products';

/**
 * CATALOG DATA ACCESS
 * -------------------
 * Single place the storefront reads products from.
 *
 * CURRENT STATE: backed by the clearly-marked demo catalog in
 * `lib/data/demo/demo-products.ts` because the Supabase database is not yet
 * deployed. The production integration point is documented below so the UI
 * components do NOT need to change when the database is connected.
 *
 * PRODUCTION INTEGRATION (once `supabase/migrations/0001_initial_schema.sql`
 * is deployed and environment variables are set):
 *
 *   const supabase = createServerSupabaseClient();
 *   const { data, error } = await supabase
 *     .from('products')
 *     .select('*')
 *     .eq('active', true)
 *     .order('cylinder_size_kg');
 *   if (error) throw error;
 *   return (data ?? []).map(mapProductRowToDomain); // snake_case -> domain
 */

export async function getProducts(): Promise<Product[]> {
  return demoProducts.filter((product) => product.active !== false);
}

export async function getActiveProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const featured = (await getProducts()).filter((product) => product.featured === true);
  if (featured.length >= limit) return featured.slice(0, limit);
  // Fill up the featured section with the first products if not enough are marked featured.
  return featured.concat((await getProducts()).filter((p) => p.featured !== true)).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return (await getProducts()).find((product) => product.id === id) ?? null;
}

export async function getProductsByService(serviceType: ServiceType): Promise<Product[]> {
  return (await getProducts()).filter((product) => product.serviceType === serviceType);
}

export function serviceTypes(): ServiceType[] {
  return [ServiceType.REFILL, ServiceType.EXCHANGE, ServiceType.NEW_CYLINDER];
}
