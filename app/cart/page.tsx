'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/providers/cart-provider"
import { useBusinessConfig } from "@/components/providers/business-config-provider"
import { formatCurrency, formatCylinderSize, formatServiceShortLabel } from "@/lib/utils/format"
import { ServiceType } from "@/lib/domain/types"

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotal, itemCount, clearCart } = useCart()
  const { currency } = useBusinessConfig()

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="bg-muted grid size-16 place-items-center rounded-full">
          <ShoppingCart className="text-muted-foreground size-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Add a gas refill, cylinder exchange or new cylinder and we&apos;ll bring it to your door.
        </p>
        <Button asChild size="lg" className="mt-2 gap-2">
          <Link href="/products">
            Browse gas products
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {itemCount} item{itemCount === 1 ? "" : "s"} ready to check out.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={clearCart}>
          Clear cart
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="flex flex-col gap-4">
          {lines.map((line) => {
            const price = line.salePrice ?? line.unitPrice ?? 0
            return (
              <li key={line.productId} className="bg-card flex gap-4 rounded-3xl border p-4">
                <Link
                  href={`/products/${line.slug}`}
                  className="bg-muted/50 relative block size-24 shrink-0 overflow-hidden rounded-2xl"
                >
                  {line.imageUrl ? (
                    <Image src={line.imageUrl} alt="" fill sizes="96px" className="object-contain p-2" />
                  ) : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${line.slug}`} className="font-medium hover:underline">
                        {line.name}
                      </Link>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatCylinderSize(line.cylinderSize as ServiceType | null)} ·{" "}
                        {formatServiceShortLabel(line.serviceType as ServiceType)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      className="text-muted-foreground hover:text-destructive grid size-8 shrink-0 place-items-center rounded-lg focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                      aria-label={`Remove ${line.name} from cart`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div className="border-input flex items-center rounded-full border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span aria-live="polite" className="min-w-8 text-center text-sm font-medium tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(price * line.quantity, currency ?? "USD")}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <Card className="sticky top-24 gap-5 p-6">
          <CardContent className="flex flex-col gap-4 p-0">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(subtotal, currency ?? "USD")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Estimated total</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(subtotal, currency ?? "USD")}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Your final total is confirmed when the order is placed.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/checkout">
                Go to checkout
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

