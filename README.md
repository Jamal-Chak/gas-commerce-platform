# Ember Gas

A gas-commerce platform for ordering **gas refills**, **cylinder exchanges** and **new cylinders** with delivery to your door.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (Luma preset), Radix UI, Lucide icons, React Hook Form + Zod, and Supabase.

> **Status:** Frontend implementation complete against a clearly-marked demo data layer. The Supabase schema (`supabase/migrations/0001_initial_schema.sql`) is written and security-audited but **not yet deployed**. Everything that depends on the database (catalog, auth, orders, payments, delivery zones, accounts) is connected through clean boundaries in `lib/data/`, `lib/orders/` and `lib/auth/` and will light up automatically once Supabase is configured.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env` and fill in the values. Nothing is required for the demo UI — the app falls back to the temporary **Ember Gas** demo identity and demo catalog.

```bash
cp .env.example .env
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Home — hero, services, how it works, featured products, delivery zones |
| `/products` | Product catalogue (filter by service) |
| `/products/[slug]` | Product detail + add to cart |
| `/services` | Service explainers |
| `/cart` | Cart with quantity controls |
| `/checkout` | Checkout — contact, delivery, payment, summary (RHF + Zod) |
| `/order/[id]` | Order confirmation + delivery status tracker |
| `/login` `/signup` `/forgot-password` | Supabase Auth UI |
| `/account` `/account/orders` `/account/addresses` | Protected customer area |
| `/contact` | Contact cards + form |

## Branding

Branding is centralized in `lib/config/business.ts` and consumed via the `BusinessConfig` provider. The temporary "Ember Gas" identity is used until the client provides the real company name, logo and colors — everything replaces through environment variables (`.env.example`) without touching components.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Docs

- `ARCHITECTURE.md` — architecture and database design
- `FRONTEND_IMPLEMENTATION_REPORT.md` — frontend implementation details
- `supabase/migrations/0001_initial_schema.sql` — PostgreSQL schema (not yet deployed)
