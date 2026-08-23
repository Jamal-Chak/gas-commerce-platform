EMBER GAS — PHASE 2: SUPABASE DATABASE FOUNDATION

We have completed Phase 1 successfully.

The project is a Next.js 16 + TypeScript application using:

- Next.js 16.3.1
- App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Luma preset
- Supabase
- Zod
- React Hook Form
- Lucide React

GitHub is already configured.

A real Supabase project has already been created.

A local .env file has already been created.

IMPORTANT SECURITY RULES:

DO NOT:
- create another Supabase project
- create another .env file
- overwrite the existing .env
- print or expose secret values
- commit .env
- place SUPABASE_SERVICE_ROLE_KEY in client-side code
- use NEXT_PUBLIC_ for the service-role key
- hard-code Supabase credentials anywhere
- modify Git configuration

You may inspect the existence and names of environment variables, but NEVER output their values.

==================================================
OBJECTIVE
==================================================

Implement the PostgreSQL/Supabase database foundation for the gas-commerce platform.

This platform must support:

- gas refills
- cylinder exchanges
- new cylinder purchases
- customer accounts
- addresses
- orders
- payments
- deliveries
- inventory
- configurable business settings

The database must be designed for a real production application, not a demo-only mock database.

==================================================
DATABASE TABLES
==================================================

Create a version-controlled Supabase migration under:

supabase/migrations/

Use a clear migration name such as:

0001_initial_schema.sql

Create these core tables:

1. business_settings
2. products
3. cylinders
4. inventory
5. customers
6. addresses
7. delivery_zones
8. orders
9. order_items
10. payments
11. deliveries

Do not create unnecessary tables at this stage.

==================================================
BUSINESS SETTINGS
==================================================

business_settings should support configurable client information.

Include appropriate fields for:

- id
- company_name
- logo_url
- tagline
- primary_color
- secondary_color
- phone
- email
- address
- currency
- whatsapp_number
- created_at
- updated_at

The eventual client must be able to change branding without changing application code.

==================================================
PRODUCTS
==================================================

Products must support:

- id
- name
- slug
- description
- service_type
- cylinder_size_kg
- price
- sale_price
- image_url
- active
- featured
- created_at
- updated_at

Service types:

REFILL
EXCHANGE
NEW_CYLINDER

Use PostgreSQL enums or another robust constrained representation.

Do not allow arbitrary invalid service types.

Cylinder sizes must be configurable.

Initial demo sizes:

6KG
9KG
14KG
19KG
48KG

Do not hard-code these values into frontend logic.

==================================================
CYLINDERS
==================================================

Create a cylinder model capable of tracking physical cylinders.

Support:

- id
- size_kg
- serial_number
- status
- created_at
- updated_at

Cylinder statuses:

FULL
EMPTY
RESERVED
SOLD
MAINTENANCE

serial_number should be unique when provided.

Do not assume every business will use serial-number-level tracking.

Design appropriately for both aggregate inventory and future individual cylinder tracking.

==================================================
INVENTORY
==================================================

Inventory must support gas-specific stock management.

Track at minimum:

- product_id
- full_quantity
- empty_quantity
- reserved_quantity
- updated_at

The design must support:

REFILL:
Customer receives gas/refill.

EXCHANGE:
Customer gives an EMPTY cylinder and receives a FULL cylinder.

NEW_CYLINDER:
Customer receives a new/full cylinder.

Do NOT implement inventory simply as:

quantity = quantity - order_quantity

The system must preserve the distinction between full, empty and reserved cylinders.

Prevent negative inventory.

==================================================
CUSTOMERS
==================================================

Customers authenticate using Supabase Auth.

Create a customer profile table linked appropriately to:

auth.users

Support:

- id
- auth_user_id
- full_name
- phone
- created_at
- updated_at

auth_user_id must be unique.

Do not store passwords.

Do not duplicate Supabase authentication credentials.

==================================================
ADDRESSES
==================================================

Customers can have multiple addresses.

Support:

- id
- customer_id
- label
- address_line
- city
- area
- latitude
- longitude
- delivery_instructions
- created_at
- updated_at

Use a foreign key to customers.

==================================================
DELIVERY ZONES
==================================================

Create delivery_zones supporting:

- id
- name
- description
- delivery_fee
- estimated_minutes
- active
- created_at
- updated_at

Delivery fees must be database/configuration driven.

Do not hard-code delivery fees into application code.

==================================================
ORDERS
==================================================

Create orders supporting:

- id
- order_number
- customer_id
- status
- subtotal
- delivery_fee
- total
- payment_status
- delivery_address_id
- created_at
- updated_at

Order statuses:

PENDING
CONFIRMED
PREPARING
DISPATCHED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

Payment statuses:

PENDING
PAID
FAILED
REFUNDED

order_number must be unique.

Do not trust totals submitted by the client/browser.

The eventual server-side order service must calculate totals from database product prices.

==================================================
ORDER ITEMS
==================================================

Create order_items supporting:

- id
- order_id
- product_id
- quantity
- unit_price
- line_total
- created_at

IMPORTANT:

unit_price must preserve the product price at the moment the order was created.

Historical orders must NOT change if the product price changes later.

Use appropriate constraints to prevent:

- zero quantity
- negative quantity
- negative prices
- invalid totals

==================================================
PAYMENTS
==================================================

Create payments supporting:

- id
- order_id
- provider
- provider_reference
- amount
- status
- created_at
- updated_at

Payment provider must remain configurable.

Do not hard-code a specific payment provider into the schema.

Payment statuses:

PENDING
PAID
FAILED
REFUNDED

Do not store card numbers, CVVs, passwords, or other sensitive payment credentials.

==================================================
DELIVERIES
==================================================

Create deliveries supporting:

- id
- order_id
- delivery_zone_id
- status
- delivery_fee
- estimated_minutes
- driver_name
- driver_phone
- dispatched_at
- delivered_at
- created_at
- updated_at

Use appropriate delivery statuses such as:

PENDING
ASSIGNED
DISPATCHED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

Do not invent unnecessary logistics functionality.

==================================================
RELATIONSHIPS
==================================================

Establish proper foreign keys.

Expected relationships include:

customers
  -> addresses

customers
  -> orders

orders
  -> order_items

products
  -> order_items

orders
  -> payments

orders
  -> deliveries

delivery_zones
  -> deliveries

products
  -> inventory

Use appropriate ON DELETE behavior.

Do not casually use CASCADE on historical financial/order records.

Historical order records must be protected.

==================================================
CONSTRAINTS AND INDEXES
==================================================

Use appropriate:

- primary keys
- foreign keys
- unique constraints
- NOT NULL constraints
- CHECK constraints
- indexes

Useful indexes should include appropriate lookup fields such as:

- products.slug
- products.active
- products.service_type
- customers.auth_user_id
- orders.customer_id
- orders.order_number
- orders.status
- order_items.order_id
- deliveries.order_id
- delivery_zones.active

Do not create indexes blindly on every column.

==================================================
ROW LEVEL SECURITY
==================================================

Enable RLS on all customer-facing tables.

Design policies so authenticated customers can access ONLY their own data.

Customers should eventually be able to access their own:

- customer profile
- addresses
- orders
- order items belonging to their orders
- payments belonging to their orders
- deliveries belonging to their orders

Customers must NOT be able to:

- view another customer's orders
- modify another customer's profile
- modify inventory
- modify product prices
- modify business settings
- modify payment records arbitrarily
- access administrative data

Do not create:

USING (true)

or other unrestricted policies.

IMPORTANT:

Administrative authorization should not rely solely on hiding UI elements.

Prepare the schema for secure server-side/admin authorization.

==================================================
AUTHENTICATION
==================================================

Do not build the complete authentication UI in this phase.

Only prepare the database relationship between:

auth.users

and:

customers

Do not create passwords or authentication credentials in the database.

==================================================
SEED DATA
==================================================

Create a separate seed SQL file if useful.

Demo seed data may include:

- example business settings
- example products
- example delivery zones

BUT:

Clearly mark all demo data.

Do not create fake customer accounts.

Do not create fake payment records.

Do not create fake orders.

Do not invent real company information.

==================================================
MIGRATIONS
==================================================

Create:

supabase/migrations/0001_initial_schema.sql

If seed data is created, place it separately, for example:

supabase/seed.sql

Do NOT automatically apply the migration to the production Supabase database.

We will inspect the migration first.

==================================================
APPLICATION CODE
==================================================

At this stage:

DO NOT implement:

- product APIs
- order APIs
- checkout
- payment integrations
- delivery integrations
- admin dashboard
- customer dashboard
- full authentication UI
- repositories
- complex business logic

This phase is ONLY the database foundation.

You may make minimal updates to types if necessary so the TypeScript domain model remains aligned with the database.

==================================================
ENVIRONMENT
==================================================

The .env file already exists.

Do not overwrite it.

Do not expose its values.

Check that the application expects appropriate variables.

The expected conceptual variables are:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY

The service-role key must only be used in trusted server-side code.

==================================================
DOCUMENTATION
==================================================

Update ARCHITECTURE.md with:

- database architecture
- table responsibilities
- relationships
- inventory model
- order model
- RLS strategy
- authentication relationship
- migration strategy

Keep documentation concise.

==================================================
QUALITY CHECKS
==================================================

After implementation run:

npm run lint

npx tsc --noEmit

npm run build

Fix errors caused by your implementation.

Do not hide errors using:

- eslint-disable
- @ts-ignore
- @ts-nocheck

unless there is a genuine documented reason.

Do not claim the Supabase database has been deployed.

The migration is only considered created, not deployed, until we manually apply and verify it.

==================================================
FINAL REPORT
==================================================

When finished, provide a concise report containing:

1. Files created
2. Files modified
3. Tables created
4. Relationships
5. Constraints
6. Indexes
7. RLS policies
8. Seed data, if any
9. Environment changes
10. Lint result
11. Typecheck result
12. Build result
13. Any unresolved concerns

STOP after the database foundation.

DO NOT proceed to APIs or frontend.

We will inspect the SQL migration before deploying it.


Sign in failed

Authentication is not configured yet. Ask an administrator to set the Supabase environment variables.


Sign in failed

Authentication is not configured yet. Ask an administrator to set the Supabase environment variables.

project url : https://azxmjjvqspgkgahsxptt.supabase.co/rest/v1/

anon public key :   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eG1qanZxc3Bna2dhaHN4cHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODgzNDMsImV4cCI6MjEwMjQ2NDM0M30.njJ5sXAt1pEzxe9qJGXKviNNy3JtTnFm0Ruc5k4XO2U

 service_role key :   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eG1qanZxc3Bna2dhaHN4cHR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg4ODM0MywiZXhwIjoyMTAyNDY0MzQzfQ.K6yp29xoWsm0cf934749k1Z9OjvIJZij3GWO7F260Dk

 Sign in failed

Authentication is not configured yet. Ask an administrator to set the Supabase environment variables.

Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:
- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


You're importing a module that depends on "next/headers". This API is only available in Server Components in the App Router, but you are using it in the Pages Router.
./lib/supabase/serverClient.ts (2:1)

Error: You're importing a module that depends on "next/headers". This API is only available in Server Components in the App Router, but you are using it in the Pages Router.
    Learn more: https://nextjs.org/docs/app/building-your-application/rendering/server-components
  1 | import { createServerClient } from '@supabase/ssr';
> 2 | import { cookies } from 'next/headers';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  3 | import { readEnv } from '@/lib/config/env';
  4 |
  5 | /**

Ecmascript file had an error

Import traces:
  Server Component:
    ./lib/supabase/serverClient.ts
    ./lib/data/load-shedding.ts

  Client Component Browser:
    ./lib/supabase/serverClient.ts [Client Component Browser]
    ./lib/data/customer.ts [Client Component Browser]
    ./app/account/orders/page.tsx [Client Component Browser]
    ./app/account/orders/page.tsx [Server Component]

  Client Component SSR:
    ./lib/supabase/serverClient.ts [Client Component SSR]
    ./lib/data/customer.ts [Client Component SSR]
    ./app/account/orders/page.tsx [Client Component SSR]
    ./app/account/orders/page.tsx [Server Component]



    You are importing next/headers inside ./lib/supabase/serverClient.ts, which is being bundled into client components or shared code.Because next/headers requires the App Router server environment, you must pass request cookies explicitly or separate your client and server Supabase helper files.Fixing the Supabase ClientSplit your Supabase utility into separate files or accept a cookie object argument instead of calling cookies() globally at the top level of a shared utility file.Remove import { cookies } from 'next/headers' from files that can be imported by client-side components.Steps to ResolveUpdate ./lib/supabase/serverClient.ts to take cookies as an argument (for Pages/Client usage) or ensure it is strictly isolated to App Router server components/actions.Use @supabase/ssr with explicit cookie getters and setters tied to req and res if used across boundaries, or create a distinct browser client file using createBrowserClient.Check import paths in ./lib/data/customer.ts and ./lib/data/load-shedding.ts to ensure server-only code is not leaking into client bundles.If you can share the code inside ./lib/supabase/serverClient.ts, I can show you the exact code changes needed to fix this import error.        


    https://github.com/Jamal-Chak/gas-commerce-platform.git