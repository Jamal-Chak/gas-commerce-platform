import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBusinessConfig } from "@/lib/config/business"

const highlights = ["Gas refills", "Cylinder exchanges", "New cylinders", "Reliable delivery"]

export function Hero() {
  const { companyName, tagline } = getBusinessConfig()

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="from-primary/10 via-primary/5 absolute inset-0 -z-10 bg-gradient-to-b to-transparent"
      />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium">
            <Flame className="text-primary size-3.5" aria-hidden="true" />
            {companyName} — gas delivered to your door
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Gas refills, delivered{" "}
            <span className="text-primary">fast</span>.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-lg">{tagline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/products">
                Order Gas
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">Explore Services</Link>
            </Button>
          </div>
          <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <Image
            src="/images/hero-illustration.svg"
            alt="Illustration of a gas cylinder being delivered to a home"
            width={640}
            height={640}
            priority
            className="mx-auto w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </section>
  )
}
