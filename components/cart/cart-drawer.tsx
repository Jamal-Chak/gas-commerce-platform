'use client'

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/providers/cart-provider"
import { useBusinessConfig } from "@/components/providers/business-config-provider"
import { formatCurrency, formatCylinderSize, formatServiceShortLabel } from "@/lib/utils/format"
import { ServiceType } from "@/lib/domain/types"

/** Slide-out shopping cart accessible from any page. */
export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeLine, subtotal, itemCount } = useCart()
  const { currency } = useBusinessConfig()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pr-10">
          <SheetTitle>Shopping cart</SheetTitle>
          <SheetDescription>
            {lines.length === 0
              ? "Your cart is empty."
              : `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="bg-muted grid size-14 place-items-center rounded-full">
                <ShoppingCart className="text-muted-foreground size-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-muted-foreground max-w-56 text-sm">
                Add a gas refill, exchange or new cylinder to get started.
              </p>
              <Button asChild className="mt-2">
                <Link href="/products" onClick={closeCart}>
                  Browse gas products
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map((line) => {
                const price = line.salePrice ?? line.unitPrice ?? 0
                return (
                  <li key={line.productId} className="flex gap-3">
                    <div className="bg-muted/50 relative size-16 shrink-0 overflow-hidden rounded-xl">
                      {line.imageUrl ? (
                        <Image
                          src={line.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={closeCart}
                          className="text-sm leading-snug font-medium hover:underline"
                        >
                          {line.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeLine(line.productId)}
                          className="text-muted-foreground hover:text-destructive grid size-7 shrink-0 place-items-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                          aria-label={`Remove ${line.name} from cart`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatCylinderSize(line.cylinderSize as ServiceType | null)}{" "}
                        {line.cylinderSize ? "·" : ""}{" "}
                        {formatServiceShortLabel(line.serviceType as ServiceType)}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="border-input flex items-center rounded-full border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                            aria-label={`Decrease quantity of ${line.name}`}
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <span aria-live="polite" className="min-w-6 text-center text-xs font-medium tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                            aria-label={`Increase quantity of ${line.name}`}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(price * line.quantity, currency ?? "USD")}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (

          <SheetFooter>
            <Separator className="-mt-1" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(subtotal, currency ?? "USD")}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Delivery fee and estimate are calculated at checkout.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout" onClick={closeCart}>
                Go to checkout
              </Link>
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

