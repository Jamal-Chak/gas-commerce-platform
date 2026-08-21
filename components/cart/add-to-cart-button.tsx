'use client'

import { useState } from "react"
import { Check, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { Product } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

interface AddToCartFormProps {
  product: Product
  showQuantity?: boolean
  className?: string
}

/**
 * Quantity selector + Add to Cart. The cart is a pure UI concern — the
 * server/database remains authoritative for prices and stock at checkout.
 */
export function AddToCartForm({ product, showQuantity = true, className }: AddToCartFormProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (product.active === false) {
    return (
      <Button type="button" disabled className={className}>
        This product is currently unavailable
      </Button>
    )
  }

  const handleAdd = () => {
    addToCart(product, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      {showQuantity ? (
        <div className="border-input flex h-11 w-full items-center justify-between rounded-full border sm:w-auto">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span aria-live="polite" className="min-w-8 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <Button type="button" size="lg" onClick={handleAdd} className="gap-2">
        {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
        {added ? "Added to cart" : "Add to Cart"}
      </Button>
    </div>
  )
}
