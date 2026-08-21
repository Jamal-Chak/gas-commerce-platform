import { Clock, MapPin } from "lucide-react"
import { Hero } from "@/components/home/hero"
import { ServiceCards } from "@/components/home/service-cards"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CtaBanner } from "@/components/home/cta-banner"
import { getBusinessConfig } from "@/lib/config/business"
import { getFeaturedProducts } from "@/lib/data/catalog"
import { getDeliveryZones } from "@/lib/data/delivery"
import { formatCurrency, formatMinutes } from "@/lib/utils/format"

export default async function HomePage() {
  const [featured, zones] = await Promise.all([getFeaturedProducts(6), getDeliveryZones()])
  const { currency } = getBusinessConfig()

  return (
    <div className="flex flex-col gap-20 py-8 sm:py-12">
      <Hero />

      <section aria-labelledby="services-heading" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="services-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What we do
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Choose the service that fits how you use gas at home or at work.
          </p>
        </div>
        <ServiceCards />
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            From order to doorstep in four simple steps.
          </p>
        </div>
        <HowItWorks />
      </section>

      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="featured-heading">
          <FeaturedProducts products={featured} currency={currency ?? "USD"} />
        </div>
      </section>

      <section aria-labelledby="zones-heading" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-4xl border p-6 sm:p-8">
          <h2 id="zones-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Where we deliver
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Delivery fees and estimates are based on your area. They are confirmed at checkout
            from the live service configuration.
          </p>
          {zones.length === 0 ? (
            <p className="text-muted-foreground mt-6 text-sm">
              Delivery zones will appear here once the delivery configuration is connected.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {zones.map((zone) => (
                <li key={zone.id} className="border-border flex flex-col gap-2 rounded-2xl border p-5">
                  <p className="flex items-center gap-2 font-semibold">
                    <MapPin className="text-primary size-4 shrink-0" aria-hidden="true" />
                    {zone.name}
                  </p>
                  {zone.description ? (
                    <p className="text-muted-foreground text-sm">{zone.description}</p>
                  ) : null}
                  <p className="text-muted-foreground mt-auto flex items-center gap-2 text-sm">
                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                    Delivery fee {formatCurrency(zone.deliveryFee, currency ?? "USD")} · approx.{" "}
                    {formatMinutes(zone.estimatedMinutes)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <CtaBanner />
      </section>
    </div>
  )
}

