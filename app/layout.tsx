import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getBusinessConfig, SITE_URL } from "@/lib/config/business";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const business = getBusinessConfig();
const companyName = business.companyName ?? "Ember Gas";
const tagline =
  business.tagline ?? "Order gas refills, cylinder exchanges and new cylinders online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${companyName} — Gas Refills & Cylinder Delivery`,
    template: `%s | ${companyName}`,
  },
  description: tagline,
  keywords: [
    "gas refill",
    "cylinder exchange",
    "new gas cylinder",
    "LPG delivery",
    "cooking gas",
    companyName,
  ],
  openGraph: {
    title: `${companyName} — Gas Refills & Cylinder Delivery`,
    description: tagline,
    type: "website",
    siteName: companyName,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </AppProviders>
      </body>
    </html>
  );
}

