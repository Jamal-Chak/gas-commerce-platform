import { Check, Clock, Package, Truck } from "lucide-react"
import { OrderStatus } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

const STEPS: { status: OrderStatus; label: string; description: string; icon: typeof Check }[] = [
  { status: OrderStatus.PENDING, label: "Pending", description: "Order received", icon: Clock },
  { status: OrderStatus.CONFIRMED, label: "Confirmed", description: "Order confirmed", icon: Check },
  { status: OrderStatus.PREPARING, label: "Preparing", description: "Preparing your gas", icon: Package },
  { status: OrderStatus.DISPATCHED, label: "Dispatched", description: "Left our depot", icon: Truck },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: "Out for delivery", description: "On the way to you", icon: Truck },
  { status: OrderStatus.DELIVERED, label: "Delivered", description: "Enjoy your gas", icon: Check },
]

interface OrderStatusTrackerProps {
  status: OrderStatus
}

/**
 * Visual, read-only order status stepper. Only displays the states returned
 * from the backend — the customer can never modify order status from here.
 */
export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const currentIndex = STEPS.findIndex((step) => step.status === status)
  const activeIndex = currentIndex === -1 ? -1 : currentIndex

  return (
    <ol className="flex flex-col" aria-label="Order status">
      {STEPS.map((step, index) => {
        const completed = index < activeIndex
        const current = index === activeIndex
        const Icon = step.icon
        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border",
                  completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary bg-background text-primary"
                      : "border-border text-muted-foreground"
                )}
                aria-hidden="true"
              >
                {completed || current ? <Icon className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("w-px flex-1", completed || current ? "bg-primary" : "bg-border")}
                />
              ) : null}
            </div>
            <div className={cn("pb-7", index === STEPS.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  current ? "text-primary" : completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {current ? (
                  <span className="bg-primary ml-2 inline-block size-1.5 animate-pulse rounded-full align-middle" aria-hidden="true" />
                ) : null}
              </p>
              <p className="text-muted-foreground text-xs">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
