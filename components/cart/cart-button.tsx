'use client'

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { cn } from "@/lib/utils"

/** Header cart button — opens the cart drawer and shows the item count. */
export function CartButton({ className }: { className?: string }) {
  const { itemCount, openCart } = useCart()
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("relative", className)}
      onClick={openCart}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <ShoppingCart aria-hidden="true" />
      {itemCount > 0 ? (
        <span
          className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold"
          aria-hidden="true"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Button>
  )
}
