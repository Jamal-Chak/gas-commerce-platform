import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserOrders } from "@/lib/data/customer"

interface OrderDetailProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
}

export default async function AccountOrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params
  const orders = await getCurrentUserOrders()
  const order = orders.find((candidate) => candidate.id === id)

  if (!order) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
        <span className="bg-muted grid size-14 place-items-center rounded-full">
          <PackageSearch className="text-muted-foreground size-6" aria-hidden="true" />
        </span>
        <h2 className="font-semibold">Order not found</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          We couldn&apos;t find that order on your account. If you just placed it, it may still be
          processing.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/account/orders">Back to my orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-muted-foreground mb-4 text-sm">
        Order details, items, totals and live delivery tracking will appear here once the order
        service is connected.
      </p>
    </div>
  )
}