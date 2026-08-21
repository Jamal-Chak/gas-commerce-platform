import type { Metadata } from "next"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/contact/contact-form"
import { getBusinessConfig } from "@/lib/config/business"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us about gas refills, cylinder exchanges or new cylinders.",
}

export default function ContactPage() {
  const { companyName, phone, email, address, whatsapp } = getBusinessConfig()

  const contactItems = [
    { icon: Phone, label: "Call us", value: phone, href: phone ? `tel:${phone}` : null },
    { icon: Mail, label: "Email us", value: email, href: email ? `mailto:${email}` : null },
    { icon: Send, label: "WhatsApp", value: whatsapp, href: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null },
    { icon: MapPin, label: "Visit us", value: address, href: null },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact {companyName}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Have a question about an order, delivery or our services? We&apos;re happy to help.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          {contactItems.map((item) => {
            const Icon = item.icon
            const inner = (
              <>
                <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-2xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value ?? "To be updated"}</span>
                </span>
              </>
            )
            const extraAnchorProps =
              item.label === "WhatsApp" ? { target: "_blank", rel: "noopener noreferrer" } : {}
            return (
              <Card key={item.label} className="gap-0 p-5">
                <CardContent className="p-0">
                  {item.href && item.value ? (
                    <a
                      href={item.href}
                      {...extraAnchorProps}
                      className="flex items-center gap-3 rounded-lg font-medium hover:underline focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                    >
                      {inner}
                    </a>
                  ) : (
                    <span className="flex items-center gap-3 font-medium">{inner}</span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm email={email} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}