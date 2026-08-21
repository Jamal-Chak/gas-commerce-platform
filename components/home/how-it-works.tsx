import { Check, Package, ShoppingCart, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS: { title: string; description: string; icon: typeof Check }[] = [
  {
    title: "Order online",
    description: "Pick your cylinder size and service, then check out in a few taps.",
    icon: ShoppingCart,
  },
  {
    title: "We prepare",
    description: "Your gas is filled, checked and loaded onto a delivery van.",
    icon: Package,
  },
  {
    title: "We deliver",
    description: "We bring it safely to your door within the estimated time.",
    icon: Truck,
  },
  {
    title: "You're all set",
    description: "Unpack, connect and get back to cooking without the hassle.",
    icon: Check,
  },
]

export function HowItWorks() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => {
        const Icon = step.icon
        return (
          <li key={step.title} className="relative flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "bg-primary/10 text-primary grid size-12 place-items-center rounded-full"
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span
                className="text-muted-foreground/40 text-4xl font-semibold tabular-nums"
                aria-hidden="true"
              >
                {index + 1}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
