'use client';

import Link from "next/link"
import { ArrowRight, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

export function CtaBanner() {
  const { t } = useTranslation()

  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden rounded-4xl px-6 py-12 sm:px-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.cta.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm/relaxed text-primary-foreground/90 sm:text-base">
            {t.cta.subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link href="/products">
              {t.cta.button}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="gap-2 hover:bg-primary-foreground/10">
            <Link href="/contact">
              <PhoneCall aria-hidden="true" />
              {t.nav.contact}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
