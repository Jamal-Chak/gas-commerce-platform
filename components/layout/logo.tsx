import Link from "next/link"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBusinessConfig } from "@/components/providers/business-config-provider"

interface LogoProps {
  className?: string
}

/**
 * Temporary Ember Gas logo. Uses the centralized BusinessConfig identity —
 * swap `logoUrl` in the business configuration to use the client's real logo.
 */
export function Logo({ className }: LogoProps) {
  const { companyName, logoUrl } = useBusinessConfig()

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- remote logo from config; replaceable asset
    return <img src={logoUrl} alt={`${companyName} logo`} className={cn("h-8 w-auto", className)} />
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
        <Flame className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg leading-none font-semibold tracking-tight">{companyName}</span>
    </span>
  )
}

export function LogoLink({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("rounded-sm focus-visible:ring-3 focus-visible:ring-ring/30 outline-none", className)}>
      <Logo />
    </Link>
  )
}
