import Link from "next/link"
import { Flame, Package, RefreshCw } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceType } from "@/lib/domain/types"

const SERVICES: {
  service: ServiceType
  title: string
  description: string
  icon: typeof Flame
  href: string
}[] = [
  {
    service: ServiceType.REFILL,
    title: "Gas Refills",
    description:
      "Refill your existing gas cylinder and get back to cooking. We handle the refill safely and deliver it back to you.",
    icon: Flame,
    href: "/products?service=REFILL",
  },
  {
    service: ServiceType.EXCHANGE,
    title: "Cylinder Exchange",
    description: "Swap your empty cylinder for a full one at the door — no waiting at the depot.",
    icon: RefreshCw,
    href: "/products?service=EXCHANGE",
  },
  {
    service: ServiceType.NEW_CYLINDER,
    title: "New Cylinders",
    description:
      "Purchase a new cylinder complete with gas. Ideal for first-time setups or replacing an old cylinder.",
    icon: Package,
    href: "/products?service=NEW_CYLINDER",
  },
]

export function ServiceCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {SERVICES.map((service) => {
        const Icon = service.icon
        return (
          <Card key={service.service} className="group transition-shadow hover:shadow-md">
            <CardHeader>
              <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-2xl">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <CardTitle className="mt-2">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={service.href}
                className="text-sm font-semibold text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:rounded-sm focus-visible:outline-none"
              >
                <span className="inline-flex items-center gap-1">
                  Browse {service.title.toLowerCase()}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
