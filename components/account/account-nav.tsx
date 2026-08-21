'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, LogOut, MapPin, ReceiptText } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOutUser } from "@/lib/auth/auth-service"

const links = [
  { href: "/account", label: "Profile", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: ReceiptText },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOutUser()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav aria-label="Account navigation" className="bg-card flex flex-col gap-1 rounded-3xl border p-2 lg:sticky lg:top-24">
      {links.map((link) => {
        const active =
          link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="text-muted-foreground hover:text-destructive flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-50"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </nav>
  )
}