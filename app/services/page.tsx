import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Flame, Package, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceType } from "@/lib/domain/types"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Gas refills, cylinder exchanges and new cylinder purchases — explained, with fast delivery to your door.",
}

const SERVICES: {
  id: string
  service: ServiceType
  title: string
  description: string
  points: string[]
  icon: typeof Flame
  href: string
}[] = [
  {
    id: "refill",
    service: ServiceType.REFILL,
    title: "Gas Refill",
    description:
      "Refill your existing gas cylinder and get back to cooking. Order online and we take care of the rest.",
    points: [
      "Refill your own cylinder, delivered back to you",
      "Available in 6kg, 9kg, 14kg, 19kg and 48kg",
      "Certified, quality-checked gas",
    ],
    icon: Flame,
    href: "/products?service=REFILL",
  },
  {
    id: "exchange",
    service: ServiceType.EXCHANGE,
    title: "Cylinder Exchange",
    description:
      "Swap your empty cylinder for a full one at the door — the fastest way to get cooking again.",
    points: [
      "No need to travel to the depot",
      "Your empty cylinder is collected on delivery",
      "Great value for homes and small businesses",
    ],
    icon: RefreshCw,
    href: "/products?service=EXCHANGE",
  },
  {
    id: "new-cylinder",
    service: ServiceType.NEW_CYLINDER,
    title: "New Cylinder",
    description:
      "Purchase a brand new cylinder complete with gas — perfect for first-time setups or replacing an old cylinder.",
    points: [
      "Brand new, safety-tested cylinder",
      "Delivered full of gas and ready to connect",
      "Ideal for rentals, events and commercial use",
    ],
    icon: Package,
    href: "/products?service=NEW_CYLINDER",
  },
]

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Our services</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Whether you need a quick refill, a full-cylinder swap or a brand new cylinder, we
          deliver safe, reliable gas straight to your door.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.id} id={service.id} className="scroll-mt-24">
              <CardHeader>
                <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-2xl">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <CardTitle className="mt-2">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm">{service.description}</p>
                <ul className="flex flex-col gap-2 text-sm">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-auto gap-2">
                  <Link href={service.href}>
                    Browse options
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
