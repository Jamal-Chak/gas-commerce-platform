import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Clock, ShieldCheck, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddToCartForm } from "@/components/cart/add-to-cart-button"
import { ProductReviews } from "@/components/products/product-reviews"
import { getBusinessConfig } from "@/lib/config/business"
import { getProductBySlug, getProductReviews } from "@/lib/data/catalog"
import { formatCurrency, formatCylinderSize, formatServiceLabel } from "@/lib/utils/format"
import { SITE_URL } from "@/lib/config/business"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) {
    return { title: "Product not found" }
  }
  const { companyName } = getBusinessConfig()
  const { averageRating, reviews } = await getProductReviews(product.id)
  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} from ${companyName ?? "Ember Gas"} — delivered to your door.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `${product.name} — gas delivered to your door.`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const { currency, companyName } = getBusinessConfig()
  const { reviews, averageRating } = await getProductReviews(product?.id ?? '')

  if (!product) {
    notFound()
  }

  const price = product.salePrice ?? product.price
  const hasSale =
    product.salePrice != null && product.price != null && product.salePrice < product.price
  const unavailable = product.active === false

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${product.name} — gas delivered to your door.`,
    image: product.imageUrl ? `${SITE_URL}${product.imageUrl}` : undefined,
    brand: { '@type': 'Brand', name: companyName ?? 'Ember Gas' },
    offers: {
      '@type': 'Offer',
      price: price ?? 0,
      priceCurrency: currency ?? 'ZAR',
      availability: unavailable ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
    } : undefined,
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/products"
        className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:rounded-sm focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All products
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="bg-muted/50 relative aspect-square overflow-hidden rounded-4xl border">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatCylinderSize(product.cylinderSize)}</Badge>
              <Badge variant="outline">{formatServiceLabel(product.serviceType)}</Badge>
              {hasSale ? <Badge variant="destructive">Sale</Badge> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            {product.description ? (
              <p className="text-muted-foreground mt-3">{product.description}</p>
            ) : null}
          </div>

          <div className="flex items-baseline gap-3">
            {price != null ? (
              <span className="text-3xl font-semibold tabular-nums">
                {formatCurrency(price, currency ?? "USD")}
              </span>
            ) : (
              <span className="text-muted-foreground">Price on request</span>
            )}
            {hasSale && product.price != null ? (
              <span className="text-muted-foreground text-lg line-through tabular-nums">
                {formatCurrency(product.price, currency ?? "USD")}
              </span>
            ) : null}
          </div>

          <Separator />

          {unavailable ? (
            <div className="flex flex-col gap-3">
              <p className="text-destructive text-sm font-medium">
                This product is currently unavailable.
              </p>
              <Button type="button" disabled>
                Currently unavailable
              </Button>
            </div>
          ) : (
            <AddToCartForm product={product} />
          )}

          <p className="text-muted-foreground text-xs">
            The price shown is an estimate. Final prices are confirmed by our system when your
            order is placed.
          </p>

          <Card className="gap-4 p-5">
            <CardContent className="p-0">
              <ul className="grid gap-3 text-sm">
                <li className="flex items-center gap-2">
                  <Truck className="text-primary size-4 shrink-0" aria-hidden="true" />
                  Delivery to your door
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="text-primary size-4 shrink-0" aria-hidden="true" />
                  Safety-checked cylinders and certified gas
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="text-primary size-4 shrink-0" aria-hidden="true" />
                  Estimated delivery time shown at checkout
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
                  Pay on delivery available
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Reviews */}
          <div className="mt-8">
            <ProductReviews
              productId={product.id}
              reviews={reviews}
              averageRating={averageRating}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
