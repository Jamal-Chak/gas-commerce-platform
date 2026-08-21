import type { Metadata } from "next"
import Link from "next/link"
import { ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserOrders } from "@/lib/data/customer"

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
}

export default async function AccountOrdersPage() {
  const orders = await getCurrentUserOrders()

  return (
    <div>
      {orders.length === 0 ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
          <span className="bg-muted grid size-14 place-items-center rounded-full">
            <ReceiptText className="text-muted-foreground size-6" aria-hidden="true" />
          </span>
          <h2 className="font-semibold">No orders yet</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            When you place an order, it will show up here with delivery tracking. Orders are only
            ever visible on the account that placed them.
          </p>
          <Button asChild className="mt-2">
            <Link href="/products">Browse gas products</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="bg-card flex flex-col gap-2 rounded-3xl border p-5 hover:bg-muted/50">
                <span className="font-semibold">{order.id}</span>
                <span className="text-muted-foreground text-sm">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}