import Link from "next/link"
import { cn } from "@/lib/utils"
import { ServiceType } from "@/lib/domain/types"
import { formatServiceLabel } from "@/lib/utils/format"

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: ServiceType.REFILL, label: formatServiceLabel(ServiceType.REFILL) },
  { value: ServiceType.EXCHANGE, label: formatServiceLabel(ServiceType.EXCHANGE) },
  { value: ServiceType.NEW_CYLINDER, label: formatServiceLabel(ServiceType.NEW_CYLINDER) },
]

interface ProductFiltersProps {
  current: string
}

/** Server-rendered filter chips. The active filter is read from the URL. */
export function ProductFilters({ current }: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter products by service">
      {FILTERS.map((filter) => {
        const active = current === filter.value
        const href =
          filter.value === "all" ? "/products" : `/products?service=${filter.value}`
        return (
          <Link
            key={filter.value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
              active
                ? "border-transparent bg-primary text-primary-foreground"
                : "text-muted-foreground bg-background hover:bg-muted"
            )}
          >
            {filter.label}
          </Link>
        )
      })}
    </div>
  )
}
