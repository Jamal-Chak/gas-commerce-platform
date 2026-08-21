import { Product } from "@/lib/domain/types"
import { ProductCard } from "./product-card"

export function ProductGrid({
  products,
  currency,
}: {
  products: Product[]
  currency: string
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currency={currency} />
      ))}
    </div>
  )
}
