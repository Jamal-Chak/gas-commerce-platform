import { Product, ServiceType, CylinderSize } from '../domain/types';
import { createPublicServerClient } from '../supabase/serverClient';
import { demoProducts } from './demo/demo-products';

/**
 * CATALOG DATA ACCESS
 * -------------------
 * Single place the storefront reads products from.
 *
 * When Supabase is configured (env vars set + migration deployed), products
 * are fetched from the `products` table with RLS enforced. When Supabase is
 * NOT configured, the demo catalog is used as a fallback so the UI remains
 * functional during development.
 */

function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : undefined,
    cylinderSize: row.cylinder_size_kg ? mapCylinderSize(Number(row.cylinder_size_kg)) : undefined,
    serviceType: String(row.service_type) as ServiceType,
    price: row.price != null ? Number(row.price) : undefined,
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function mapCylinderSize(kg: number): CylinderSize | undefined {
  if (kg <= 6) return CylinderSize.KG6;
  if (kg <= 9) return CylinderSize.KG9;
  if (kg <= 14) return CylinderSize.KG14;
  if (kg <= 19) return CylinderSize.KG19;
  return CylinderSize.KG48;
}

async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('cylinder_size_kg');

    if (error) {
      console.error('[catalog] Supabase error:', error.message);
      return null;
    }

    return (data ?? []).map((row: Record<string, unknown>) => mapProductRow(row));
  } catch (err) {
    console.error('[catalog] Failed to fetch from Supabase:', err);
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const dbProducts = await fetchProductsFromSupabase();
  if (dbProducts && dbProducts.length > 0) return dbProducts;
  // Fallback to demo data when Supabase is not configured or returns empty.
  return demoProducts.filter((product) => product.active !== false);
}

export async function getActiveProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((product) => product.featured === true);
  if (featured.length >= limit) return featured.slice(0, limit);
  return featured.concat(products.filter((p) => p.featured !== true)).slice(0, limit);
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

/**
 * Get reviews for a product.
 */
export async function getProductReviews(productId: string): Promise<{
  reviews: Array<{
    id: string;
    customer_name: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_verified_purchase: boolean;
    created_at: string;
  }>;
  averageRating: number;
}> {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) return { reviews: [], averageRating: 0 };

    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, customer_name, rating, title, body, is_verified_purchase, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error || !data) return { reviews: [], averageRating: 0 };

    const avgRating = data.length > 0
      ? data.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.rating), 0) / data.length
      : 0;

    return {
      reviews: data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        customer_name: String(r.customer_name),
        rating: Number(r.rating),
        title: (r.title as string) ?? null,
        body: (r.body as string) ?? null,
        is_verified_purchase: Boolean(r.is_verified_purchase),
        created_at: String(r.created_at),
      })),
      averageRating: avgRating,
    };
  } catch {
    return { reviews: [], averageRating: 0 };
  }
}
