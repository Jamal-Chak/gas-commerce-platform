'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoLink } from "@/components/layout/logo"
import { CartButton } from "@/components/cart/cart-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "@/lib/i18n"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", labelKey: "nav.home" as const },
  { href: "/products", labelKey: "nav.products" as const },
  { href: "/services", labelKey: "nav.services" as const },
  { href: "/bulk-order", labelKey: "nav.bulkOrder" as const },
  { href: "/safety", labelKey: "nav.safety" as const },
  { href: "/contact", labelKey: "nav.contact" as const },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href.startsWith("/#")) return false
  return pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()

  const getLabel = (key: string) => {
    const parts = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = t
    for (const p of parts) val = val?.[p]
    return val ?? key
  }

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <LogoLink />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
                isActive(pathname, item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {getLabel(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <CartButton />
          <Button asChild variant="outline" className="hidden gap-2 sm:inline-flex">
            <Link href="/login">
              <LogIn className="size-4" aria-hidden="true" />
              {t.nav.signIn}
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="sm:hidden" aria-label="Go to account">
            <Link href="/account">
              <User className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-xs">
              <SheetHeader className="pr-10">
                <SheetTitle>{t.nav.home}</SheetTitle>
                <SheetDescription>{t.hero.subtitle}</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
                      isActive(pathname, item.href) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {getLabel(item.labelKey)}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                >
                  {t.account.title}
                </Link>
              </nav>
              <div className="p-4">
                <Button asChild className="w-full gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <LogIn className="size-4" aria-hidden="true" />
                    {t.nav.signIn} / {t.nav.signUp}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
