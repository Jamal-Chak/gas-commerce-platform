import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/products/product-grid"
import { Product } from "@/lib/domain/types"

export function FeaturedProducts({
  products,
  currency,
}: {
  products: Product[]
  currency: string
}) {
  if (products.length === 0) return null
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Popular right now</h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
            A few of our most-requested sizes and services. View the full catalogue to see
            everything.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start sm:self-auto">
          <Link href="/products">
            View all products
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <ProductGrid products={products} currency={currency} />
    </div>
  )
}
