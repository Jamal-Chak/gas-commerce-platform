'use client';

import { Check, Package, ShoppingCart, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n"

const STEP_ICONS = [ShoppingCart, Package, Truck, Check] as const

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    { title: t.howItWorks.step1Title, description: t.howItWorks.step1Desc },
    { title: t.howItWorks.step2Title, description: t.howItWorks.step2Desc },
    { title: t.howItWorks.step3Title, description: t.howItWorks.step3Desc },
  ]

  return (
    <section>
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        {t.howItWorks.title}
      </h2>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index]
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
    </section>
  )
}
