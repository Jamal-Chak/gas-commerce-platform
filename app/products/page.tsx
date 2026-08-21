import type { Metadata } from "next"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { Alert } from "@/components/ui/alert"
import { getBusinessConfig } from "@/lib/config/business"
import { getProducts } from "@/lib/data/catalog"
import { ServiceType } from "@/lib/domain/types"
import { formatServiceLabel } from "@/lib/utils/format"

export const metadata: Metadata = {
  title: "Gas Products",
  description:
    "Browse gas refills, cylinder exchanges and new cylinders in every size — delivered to your door.",
}

const SERVICE_FILTERS: string[] = [
  ServiceType.REFILL,
  ServiceType.EXCHANGE,
  ServiceType.NEW_CYLINDER,
]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { service } = await searchParams
  const serviceParam = typeof service === "string" ? service : "all"
  const isValidFilter = SERVICE_FILTERS.includes(serviceParam)

  const allProducts = await getProducts()
  const products = isValidFilter
    ? allProducts.filter((product) => product.serviceType === serviceParam)
    : allProducts

  const { currency } = getBusinessConfig()

  const heading = isValidFilter
    ? formatServiceLabel(serviceParam as ServiceType)
    : "All gas products"
  const subheading = isValidFilter
    ? `Browse our ${heading.toLowerCase()} options, delivered to your door.`
    : "Refills, exchanges and new cylinders in every size."

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">{subheading}</p>
      </header>

      <div className="mt-6">
        <ProductFilters current={isValidFilter ? serviceParam : "all"} />
      </div>

      <div className="mt-10">
        {products.length === 0 ? (
          <Alert variant="info" title="No products found">
            <p>
              We couldn&apos;t find any products matching that filter. Try another service type.
            </p>
          </Alert>
        ) : (
          <ProductGrid products={products} currency={currency ?? "USD"} />
        )}
      </div>
    </div>
  )
}
