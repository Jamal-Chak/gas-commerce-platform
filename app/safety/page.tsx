import { Shield, AlertTriangle, Flame, Wind, Home, CheckCircle, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Gas Safety Guide — Ember Gas',
  description: 'Essential gas safety tips, leak detection, storage guidelines, and emergency procedures for LPG gas cylinders.',
};

const SAFETY_TIPS = [
  { icon: Wind, title: 'Ventilation', desc: 'Always use gas cylinders in well-ventilated areas. Never store indoors or in enclosed spaces.' },
  { icon: Flame, title: 'Keep Away from Heat', desc: 'Store cylinders away from direct sunlight, stoves, heaters, and other heat sources.' },
  { icon: CheckCircle, title: 'Regular Inspections', desc: 'Check hoses, regulators, and connections regularly for wear, cracks, or damage.' },
  { icon: Shield, title: 'Use Certified Equipment', desc: 'Only use SABS-approved regulators and hoses. Never use makeshift or damaged equipment.' },
  { icon: Home, title: 'Secure Storage', desc: 'Store cylinders upright in a well-ventilated outdoor area, secured against falling.' },
  { icon: AlertTriangle, title: 'No Smoking', desc: 'Never smoke near gas cylinders or while handling gas equipment.' },
];

const LEAK_SIGNS = [
  'A strong smell of gas (rotten egg odor)',
  'Hissing sound near the cylinder or regulator',
  'Frost or ice on the cylinder valve or regulator',
  'Dead vegetation near outdoor cylinder storage',
];

const EMERGENCY_STEPS = [
  'Do NOT light matches or switches electrical appliances',
  'Open all doors and windows for ventilation',
  'Turn off the cylinder valve if safe to do so',
  'Evacuate the area immediately',
  'Call emergency services: 082 991 1111',
  'Do not re-enter until the area is declared safe',
];

export default function SafetyPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 grid size-16 place-items-center rounded-full">
          <Shield className="text-primary size-8" />
        </div>
        <h1 className="text-3xl font-bold">Gas Safety Guide</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Your safety is our top priority. Follow these essential guidelines for handling, storing, and using LPG gas cylinders.
        </p>
      </div>

      {/* Safety Tips */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Essential Safety Tips</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_TIPS.map((tip) => (
            <Card key={tip.title}>
              <CardContent className="flex flex-col gap-2 p-5">
                <tip.icon className="text-primary size-5" />
                <h3 className="font-semibold">{tip.title}</h3>
                <p className="text-muted-foreground text-sm">{tip.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Leak Detection */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              <h2 className="text-lg font-semibold">How to Detect a Gas Leak</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {LEAK_SIGNS.map((sign) => (
                <li key={sign} className="flex items-start gap-2 text-sm">
                  <span className="bg-destructive mt-1.5 block size-1.5 shrink-0 rounded-full" />
                  {sign}
                </li>
              ))}
            </ul>
            <div className="bg-muted mt-3 rounded p-3">
              <p className="text-sm font-medium">Soapy Water Test</p>
              <p className="text-muted-foreground text-xs">Apply soapy water to connections. If bubbles form, there&apos;s a leak. Tighten connections or replace the faulty part immediately.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <Phone className="text-primary size-5" />
              <h2 className="text-lg font-semibold">Emergency Procedures</h2>
            </div>
            <p className="text-muted-foreground text-sm">If you suspect a gas leak or smell gas:</p>
            <ol className="flex flex-col gap-2">
              {EMERGENCY_STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-primary text-primary-foreground grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Cylinder Care */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Cylinder Care & Maintenance</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-2 font-semibold">Do&apos;s</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle className="text-green-500 mt-0.5 size-4 shrink-0" /> Keep cylinders upright and secured</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-green-500 mt-0.5 size-4 shrink-0" /> Store in a cool, well-ventilated area</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-green-500 mt-0.5 size-4 shrink-0" /> Use only approved regulators</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-green-500 mt-0.5 size-4 shrink-0" /> Close valves when not in use</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-green-500 mt-0.5 size-4 shrink-0" /> Have installations checked annually</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-2 font-semibold">Don&apos;ts</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2"><AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" /> Never store cylinders indoors</li>
                <li className="flex items-start gap-2"><AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" /> Never expose to direct heat or flames</li>
                <li className="flex items-start gap-2"><AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" /> Never attempt to repair a damaged cylinder</li>
                <li className="flex items-start gap-2"><AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" /> Never use oil or grease on valves</li>
                <li className="flex items-start gap-2"><AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" /> Never dispose of cylinders in regular trash</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-primary text-primary-foreground flex flex-col items-center gap-4 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold">Need Help or Have Questions?</h2>
        <p className="max-w-md text-sm opacity-90">
          Our team is here to help with any gas safety concerns. Contact us for advice or to report a safety issue.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <a href="tel:+27000000000">Call Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
