import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddToCartForm } from "@/components/cart/add-to-cart-button"
import { formatCurrency, formatCylinderSize, formatServiceLabel } from "@/lib/utils/format"
import { Product } from "@/lib/domain/types"

interface ProductCardProps {
  product: Product
  currency: string
}

/** Server-rendered catalog card. Prices are for display only. */
export function ProductCard({ product, currency }: ProductCardProps) {
  const price = product.salePrice ?? product.price
  const hasSale =
    product.salePrice != null && product.price != null && product.salePrice < product.price

  return (
    <article className="bg-card group flex flex-col overflow-hidden rounded-4xl border">
      <Link
        href={`/products/${product.slug}`}
        className="bg-muted/50 relative block aspect-square overflow-hidden focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        aria-label={product.name}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="p-6 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary">{formatCylinderSize(product.cylinderSize)}</Badge>
        </div>
        {hasSale ? (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Sale
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {formatServiceLabel(product.serviceType)}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-1 block text-base leading-snug font-semibold hover:underline"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-baseline gap-2">
          {price != null ? (
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(price, currency)}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">Price on request</span>
          )}
          {hasSale && product.price != null ? (
            <span className="text-muted-foreground text-sm line-through tabular-nums">
              {formatCurrency(product.price, currency)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-1">
          {product.active === false ? (
            <Button type="button" disabled className="w-full">
              Currently unavailable
            </Button>
          ) : (
            <AddToCartForm product={product} showQuantity={false} />
          )}
        </div>
      </div>
    </article>
  )
}
