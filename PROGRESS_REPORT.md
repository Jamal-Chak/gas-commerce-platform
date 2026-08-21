# Ember Gas — Phase 1 Progress Report

Date: 2026-08-15

## Summary

Phase 1 (application architecture and domain foundation) is complete. Core domain types, validation foundation, Supabase client placeholders, an environment template, and architecture documentation were added. The repository typechecks, lints, and builds successfully.

## What I implemented

- Domain types and enums: [lib/domain/types.ts](lib/domain/types.ts)
- Supabase client factories (browser/server): [lib/supabase/browserClient.ts](lib/supabase/browserClient.ts), [lib/supabase/serverClient.ts](lib/supabase/serverClient.ts)
- Zod validation foundation: [lib/validators/product.ts](lib/validators/product.ts), [lib/validators/index.ts](lib/validators/index.ts)
- Business configuration loader: [lib/config/business.ts](lib/config/business.ts)
- Environment template: [.env.example](.env.example)
- Architecture document: [ARCHITECTURE.md](ARCHITECTURE.md)

## Architecture decisions

- Domain-first layout under `lib/` to centralize business types and logic.
- Clear separation between UI (`app/`, `components/`) and domain/data layers (`lib/`).
- Branding and business info are loaded from environment variables via a centralized `BusinessConfig` loader — no hard-coded branding.
- Service types (`REFILL`, `EXCHANGE`, `NEW_CYLINDER`) are modeled as domain enums (not UI-only labels).

## Supabase preparation

- Added browser and server client factories; server factory expects `SUPABASE_SERVICE_ROLE_KEY` for privileged server operations.
- Added `.env.example` with placeholders; NO secrets committed.

## Validation & Security preparation

- Added foundational Zod schema for product inputs and an index export for validators.
- Prepared for authentication roles (`customer`, `admin`) and Row Level Security (RLS) — design notes in `ARCHITECTURE.md`.

## Quality checks performed

- Typecheck: `npx tsc --noEmit` — passed.
- Lint: `npm run lint` — ran with no errors.
- Build: `npm run build` — Next.js build completed and prerendered static routes (`/`, `/_not-found`).

## Remaining / Next steps (Phase 2 scope)

1. Database schema & migrations (Postgres) for products, cylinders, inventory, orders, payments, deliveries.
2. Implement server-side repositories/DAOs using `createServerSupabaseClient()`.
3. Add API endpoints for product/cylinder CRUD and order creation with server-side inventory/reservation logic.
4. Implement authentication flows and RLS policies for secure data access.
5. Integrate payment provider sandbox and delivery/zone logic.
6. Add UI foundation: `BusinessConfig` provider wired to layout and theme tokens.
7. Configure CI/CD, secrets management, and add tests.

## How to reproduce locally

1. Copy the env template and populate local values (do NOT commit):

```powershell
cp .env.example .env
# Fill values locally
```

2. Run checks and build:

```powershell
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Notes

- No database or authentication has been provisioned — secure keys and Supabase project are required before implementing DB-backed features.
- Nothing production-sensitive was committed; secrets are left to your environment.

---

If you want, I can now (pick one):
- implement server repositories + product API, or
- scaffold Postgres migration SQL and a migration runner, or
- wire `BusinessConfig` into the Next layout and add theme tokens.
