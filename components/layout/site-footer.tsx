'use client'

import Link from "next/link"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Separator } from "@/components/ui/separator"
import { useBusinessConfig } from "@/components/providers/business-config-provider"
import { useTranslation } from "@/lib/i18n"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Gas Products" },
  { href: "/services", label: "Services" },
  { href: "/bulk-order", label: "Bulk Orders" },
  { href: "/safety", label: "Gas Safety" },
  { href: "/contact", label: "Contact" },
]

const serviceLinks = [
  { href: "/services#refill", label: "Gas Refills" },
  { href: "/services#exchange", label: "Cylinder Exchange" },
  { href: "/services#new-cylinder", label: "New Cylinders" },
  { href: "/#how-it-works", label: "How It Works" },
]

export function SiteFooter() {
  const { companyName, tagline, phone, email, address, whatsapp } = useBusinessConfig()
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm">{tagline}</p>
          </div>

          <nav aria-label="Quick links">
            <h2 className="text-sm font-semibold">{t.footer.quickLinks}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h2 className="text-sm font-semibold">{t.nav.services}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">{t.footer.contactUs}</h2>
            <ul className="mt-3 flex flex-col gap-3 text-sm">
              {phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${phone}`} className="text-muted-foreground hover:text-foreground">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="text-muted-foreground hover:text-foreground">
                    {email}
                  </a>
                </li>
              ) : null}
              {address ? (
                <li className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="text-muted-foreground">{address}</span>
                </li>
              ) : null}
              {whatsapp ? (
                <li className="flex items-center gap-2">
                  <Send className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {!phone && !email && !address ? (
                <li className="text-muted-foreground text-sm">
                  Contact details will appear here once the business configuration is provided.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <Separator className="mt-10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {companyName}. {t.footer.rights}
          </p>
          <p>Temporary demo identity — real company details pending.</p>
        </div>
      </div>
    </footer>
  )
}
