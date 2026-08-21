import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatCylinderSize, formatServiceShortLabel } from "@/lib/utils/format"
import type { PlacedOrder, PlacedOrderLine } from "@/lib/orders/order-service"
import { OrderStatus, PaymentStatus, ServiceType } from "@/lib/domain/types"

function paymentLabel(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PAID:
      return "Paid"
    case PaymentStatus.PENDING:
      return "Pending"
    case PaymentStatus.FAILED:
      return "Payment failed"
    case PaymentStatus.REFUNDED:
      return "Refunded"
    default:
      return status
  }
}

function orderLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Out for delivery"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function OrderSummaryCard({
  order,
  currency,
}: {
  order: PlacedOrder
  currency: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={order.paymentStatus === PaymentStatus.PAID ? "success" : "secondary"}>
          {paymentLabel(order.paymentStatus)}
        </Badge>
        <Badge variant="outline">{orderLabel(order.status)}</Badge>
        {order.demo ? <Badge variant="warning">Demo order</Badge> : null}
      </div>

      <ul className="flex flex-col gap-4">
        {order.lines.map((line: PlacedOrderLine) => (
          <li key={line.id} className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/products/${line.slug}`}
                className="text-sm font-medium hover:underline"
              >
                {line.name}
              </Link>
              <p className="text-muted-foreground text-xs">
                {formatCylinderSize(line.cylinderSize as ServiceType | null)}{" "}
                {line.cylinderSize ? "·" : ""} {formatServiceShortLabel(line.serviceType as ServiceType)} · Qty {line.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrency(line.totalPrice, currency)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(order.subtotal, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery fee</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(order.deliveryFee, currency)}</dd>
        </div>
        <div className="flex items-center justify-between text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(order.total, currency)}</dd>
        </div>
      </dl>
    </div>
  )
}
