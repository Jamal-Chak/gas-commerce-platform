**Architecture Overview**

This document describes the Phase 1 architecture for the Ember Gas gas-commerce platform.

**Goals for Phase 1**
- Establish a domain-oriented code structure.
- Prepare Supabase integration (no credentials committed).
- Provide foundational types and validation.
- Add a central business configuration approach.

**Folder structure (important locations)**
- `app/` — Next.js App Router pages and layouts (UI entrypoints).
- `components/` — Reusable UI components.
- `lib/domain/` — Domain types and enums (Products, Cylinders, Orders).
- `lib/supabase/` — Supabase client factories (browser/server).
- `lib/validators/` — Zod schemas for input validation.
- `lib/config/` — Business configuration loader.

**Domain boundaries**
- Business configuration: centralized in `lib/config/business.ts` and should be fed from environment variables or a CMS/Supabase table at runtime.
- Products: modelled in `lib/domain/types.ts` and validated with Zod.
- Cylinders & Inventory: cylinder sizes and states are enums to ensure consistency across services.
- Orders: statuses and payment statuses are explicit enums.

**Configuration strategy**
- Use `NEXT_PUBLIC_*` env vars for values safe to expose to the browser.
- Use server-only env vars (e.g. `SUPABASE_SERVICE_ROLE_KEY`) for privileged operations.
- Provide `.env.example` as a template; do not commit secrets.

**Supabase strategy**
- `lib/supabase/browserClient.ts` exports a factory using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase/serverClient.ts` exports a server-side factory that must be used only in server code and reads `SUPABASE_SERVICE_ROLE_KEY`.
- Row Level Security and policies will be added later; server-side privileged operations must use the server client.

**Authentication & Authorization (preparation)**
- Architect for two principal roles: `customer` and `admin`.
- Use Supabase Auth (or external provider) for authentication.
- Enforce authorization on server-side APIs and via Supabase Row Level Security policies.

**Validation**
- Use Zod schemas in `lib/validators/` for input validation on server and client (where appropriate).

**Branding / Theming**
- Do not hard-code brand values. Expose a `BusinessConfig` that can be populated from env vars, a Supabase table, or an admin UI in later phases.

**Database Architecture & Supabase Schema**

We use Supabase (PostgreSQL) as our database. The schema is defined in [0001_initial_schema.sql](file:///c:/Users/jonht/ember-gas/supabase/migrations/0001_initial_schema.sql) and initial demo data in [seed.sql](file:///c:/Users/jonht/ember-gas/supabase/seed.sql).

- **Table Responsibilities**:
  1. `business_settings`: Holds branding and config parameters (colors, email, whatsapp, etc.) enforced to a single row.
  2. `products`: Lists gas refill, exchange, and new cylinder services categorized by cylinder weight size.
  3. `cylinders`: Tracks individual physical cylinder inventory and states (e.g. status, serial number).
  4. `inventory`: Manages aggregate quantities (full, empty, reserved) per product.
  5. `customers`: User profile extension, linked to Supabase Auth (`auth.users.id`).
  6. `addresses`: Multiple delivery locations associated with a customer.
  7. `delivery_zones`: Serviceable areas with their respective fees and estimated delivery times.
  8. `orders`: Order totals, status, payment status, and delivery association.
  9. `order_items`: Line items capturing historical product price at creation time.
  10. `payments`: Payment transaction references and status.
  11. `deliveries`: Driver details, estimated timing, and dispatch/delivery status.

- **Inventory Model**:
  Inventory is tracked using specialized counters (`full_quantity`, `empty_quantity`, `reserved_quantity`) rather than simple subtraction to accommodate gas exchange operations:
  - *Refill*: Gas refill given to user.
  - *Exchange*: Customer exchanges an `EMPTY` cylinder for a `FULL` cylinder.
  - *New Cylinder*: Customer purchases a new `FULL` cylinder with no empty cylinder returned.

- **RLS & Security Strategy**:
  Row Level Security is enabled on all tables.
  - Public/Authenticated read policies exist for `business_settings`, `products`, and `delivery_zones`.
  - Customer-specific tables (`customers`, `addresses`, `orders`, `order_items`, `payments`, `deliveries`) have policy checks enforcing `auth.uid()` match. Customers can only read and create their own records.
  - All modifications to administrative data (products, business settings, inventory) bypass RLS via service role client credentials on the server.

- **Customer Account Deletion**:
  Because `orders.customer_id` has a foreign key constraint set to `ON DELETE RESTRICT` to protect financial history, deleting a customer record directly will fail if that customer has past orders. In production, account deletion must be handled via a controlled anonymization workflow. The workflow will scrub PII (name, phone, address details) from the profile while retaining the customer record ID and historical order amounts for accounting and audit integrity.

- **Inventory Concurrency & Reservation Strategy**:
  Under heavy concurrent ordering, simple checks on the application server could lead to race conditions (e.g., selling products that are out of stock). To ensure atomic operations, future stock allocations must be handled using row-level locking (e.g., `SELECT FOR UPDATE` in PostgreSQL transactions) or a database-level RPC function. The reservation system must support:
  1. *Reserve*: Incrementing `reserved_quantity` and decrementing `full_quantity` atomically.
  2. *Release*: Reverting the reservation back to `full_quantity` if checkout fails or is abandoned.
  3. *Commit*: Clearing the `reserved_quantity` and finalizing the sale when payment is confirmed.
