import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Ember Gas',
  description: 'How Ember Gas collects, uses, and protects your personal information in compliance with POPIA.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <div className="bg-primary/10 mb-4 grid size-12 place-items-center rounded-full">
            <Shield className="text-primary size-6" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ember Gas (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa. This policy explains how we collect, use, store, and protect your data.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <ul className="text-muted-foreground text-sm leading-relaxed list-disc pl-6">
              <li><strong>Personal details:</strong> Name, email address, phone number, delivery address</li>
              <li><strong>Order information:</strong> Purchase history, payment method preferences, delivery instructions</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information, cookies</li>
              <li><strong>Usage data:</strong> Pages visited, time spent on site, referral source</li>
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
            <ul className="text-muted-foreground text-sm leading-relaxed list-disc pl-6">
              <li>Process and deliver your gas orders</li>
              <li>Send order confirmations and delivery updates</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send promotional offers (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">4. Your Rights Under POPIA</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You have the right to:
            </p>
            <ul className="text-muted-foreground text-sm leading-relaxed list-disc pl-6">
              <li>Access your personal information that we hold</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to processing of your personal information</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">5. Cookies</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We use essential cookies for site functionality and analytics cookies (with your consent) to improve your experience. You can manage your cookie preferences at any time through our cookie consent banner.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">6. Data Security</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">7. Contact Us</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              For privacy-related inquiries or to exercise your rights:
            </p>
            <Card>
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  <a href="mailto:privacy@embergas.co.za" className="hover:text-foreground">privacy@embergas.co.za</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground size-4" />
                  <a href="tel:+27000000000" className="hover:text-foreground">+27 (0) 00 000 0000</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground size-4" />
                  <span>South Africa</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="text-muted-foreground text-center text-xs">
          <p>
            <Link href="/" className="hover:text-foreground hover:underline">Home</Link>
            {' · '}
            <Link href="/contact" className="hover:text-foreground hover:underline">Contact</Link>
            {' · '}
            <Link href="/safety" className="hover:text-foreground hover:underline">Safety</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
