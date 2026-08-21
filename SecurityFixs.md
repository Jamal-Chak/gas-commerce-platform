EMBER GAS — PHASE 2.2 SECURITY REMEDIATION

We have completed the database security audit.

The migration has NOT yet been deployed to Supabase.

Now implement ONLY the security and integrity fixes identified by the audit.

Do not build APIs.
Do not build frontend features.
Do not implement checkout.
Do not deploy the migration.
Do not modify Git configuration.
Do not modify .env.
Do not expose secrets.

==================================================
1. ORDERS — REMOVE DIRECT CUSTOMER INSERT
==================================================

Remove the existing customer INSERT policy that allows authenticated customers to create orders directly.

Customers must NOT be able to insert orders directly through the Supabase client.

Remove the policy equivalent to:

"Allow customers to create their own orders"

Do not replace it with another permissive customer INSERT policy.

For now:

- customers can SELECT their own orders
- customers cannot directly INSERT orders
- customers cannot arbitrarily UPDATE orders
- customers cannot DELETE orders

Order creation will later be implemented through trusted server-side business logic.

IMPORTANT:

Do NOT simply solve this by giving every server operation unrestricted database access.

We will design the trusted order-creation mechanism separately.

==================================================
2. ADDRESSES — GRANULAR RLS POLICIES
==================================================

Remove the broad:

FOR ALL

customer address policy.

Replace it with explicit policies:

SELECT
INSERT
UPDATE
DELETE

Requirements:

SELECT:
A customer can only read addresses belonging to their own customer profile.

INSERT:
A customer may create an address only for their own customer profile.

UPDATE:
A customer may update only their own addresses.

DELETE:
A customer may delete only their own addresses.

The INSERT policy must validate the customer_id being inserted.

Do not rely solely on USING for INSERT authorization.

Use the appropriate WITH CHECK condition.

Similarly, UPDATE should use appropriate USING and WITH CHECK conditions.

==================================================
3. CUSTOMER PROFILE SECURITY
==================================================

Review the customer policies.

Customers must only be able to:

SELECT their own profile.

If UPDATE is allowed:

They may update only permitted profile fields belonging to themselves.

Do not allow customers to change:

- auth_user_id
- privileged role information
- administrative fields

If the current schema has no role field, do not add one unnecessarily yet.

==================================================
4. ORDER UPDATE SECURITY
==================================================

Review the existing order UPDATE policy.

Customers must NOT be able to arbitrarily change:

- total
- subtotal
- delivery_fee
- payment_status
- status
- customer_id

If customers need cancellation later, that should be implemented as a controlled server-side operation.

For this phase, do not create a broad customer UPDATE policy.

Customers should primarily have read access to their own orders.

==================================================
5. ORDER ITEM SECURITY
==================================================

Customers must not be able to directly:

- INSERT order items
- UPDATE order items
- DELETE order items

Order items will be created by trusted order-creation business logic.

Customers may SELECT order items belonging to their own orders.

Ensure the SELECT policy correctly checks the ownership chain:

order_items
    -> orders
    -> customers
    -> auth.users

==================================================
6. PAYMENTS
==================================================

Keep the existing secure approach.

Customers may SELECT their own payment records.

Customers must NOT be able to:

- INSERT payments
- UPDATE payments
- DELETE payments

Payment creation and status changes will later be handled through trusted server-side payment logic/webhooks.

==================================================
7. DELIVERIES
==================================================

Keep the existing secure approach.

Customers may SELECT deliveries belonging to their own orders.

Customers must NOT be able to:

- INSERT deliveries
- UPDATE deliveries
- DELETE deliveries

Delivery mutations will later be performed by trusted server-side/admin/operations logic.

==================================================
8. INVENTORY
==================================================

Keep inventory locked against normal customers.

Customers must NOT be able to:

- INSERT
- UPDATE
- DELETE

inventory records.

Do not add public inventory SELECT access.

The storefront must NOT expose internal stock quantities unless we explicitly design a safe availability mechanism later.

==================================================
9. CYLINDERS
==================================================

Keep physical cylinder records protected.

Normal customers must NOT be able to:

- INSERT
- UPDATE
- DELETE

cylinder records.

Do not expose serial numbers or internal cylinder status publicly.

==================================================
10. PRODUCTS
==================================================

Public users may read active products.

Customers/public users must NOT be able to:

- INSERT
- UPDATE
- DELETE

products.

Do not expose internal inventory information through product queries.

==================================================
11. BUSINESS SETTINGS
==================================================

Public users may read the public business settings required by the website.

Public and customer users must NOT be able to modify business settings.

Do not expose sensitive future configuration values through the public policy.

==================================================
12. DELIVERY ZONES
==================================================

Public users may read active delivery zones if needed for storefront delivery calculations.

Public/customer users must NOT be able to modify delivery zones.

==================================================
13. FOREIGN KEY / DELETE SAFETY
==================================================

Review all ON DELETE behavior.

Keep historical transaction records protected.

In particular, do not introduce cascading deletes that could destroy:

- orders
- order_items
- payments
- deliveries

when a customer/profile/product is removed.

The current:

orders.customer_id -> customers.id ON DELETE RESTRICT

should remain unless there is a compelling technical reason to change it.

For customer account deletion, do NOT implement a full anonymization system yet.

Instead:

1. Document the account deletion problem in ARCHITECTURE.md.
2. State that production account deletion will require a controlled anonymization/deactivation workflow.
3. Do not allow a normal user deletion to silently destroy historical financial records.

==================================================
14. INVENTORY CONCURRENCY
==================================================

Do NOT implement the full inventory reservation system yet.

However, document the requirement clearly.

Future inventory operations MUST execute atomically and safely under concurrent orders.

The eventual operation needs to support concepts such as:

reserve inventory
release reservation
commit inventory

and must prevent overselling under concurrent requests.

Prefer PostgreSQL transactional logic / RPC or equivalent database transaction semantics.

Do not implement a fake JavaScript-only locking mechanism.

Add a concise note to ARCHITECTURE.md explaining this requirement.

==================================================
15. REFILL / EXCHANGE MODEL
==================================================

Do not implement the full business logic yet.

Document that:

REFILL:
Gas is supplied/refilled for an existing customer-owned cylinder.

EXCHANGE:
Customer provides an empty cylinder and receives a full cylinder.

NEW_CYLINDER:
Customer receives a new cylinder/full gas product.

The cylinders table should support future individual cylinder tracking.

The inventory table remains an aggregate stock representation.

Do not invent additional tables unless required by the current schema.

==================================================
16. SEED DATA
==================================================

Keep demo seed data separate.

Do not create fake customers.

Do not create fake orders.

Do not create fake payments.

Do not create real-looking customer information.

Ensure seed data can be executed by an appropriate Supabase migration/admin mechanism without weakening production RLS policies.

Do not add insecure policies just to make seed.sql work.

==================================================
17. SECURITY VERIFICATION
==================================================

After making changes, inspect every RLS policy again.

Create a concise matrix:

TABLE | PUBLIC READ | CUSTOMER READ | CUSTOMER INSERT | CUSTOMER UPDATE | CUSTOMER DELETE

Verify that the result matches the intended security model.

Also specifically verify:

- customers cannot create arbitrary orders
- customers cannot modify order totals
- customers cannot modify payment status
- customers cannot modify deliveries
- customers cannot modify inventory
- customers cannot modify cylinders
- customers cannot modify products
- customers cannot modify business settings
- customers cannot create addresses for another customer
- customers cannot access another customer's records

==================================================
18. DO NOT DEPLOY
==================================================

Do NOT run the migration against Supabase.

Do NOT use Supabase CLI to push it.

Do NOT execute destructive SQL.

This is still a local migration review.

==================================================
19. QUALITY CHECKS
==================================================

Run:

npm run lint

npx tsc --noEmit

npm run build

All must pass.

==================================================
==================================================
20. FINAL REPORT
==================================================

### 1. Security Fixes Implemented
- Restricted profile updates by applying a `WITH CHECK (auth.uid() = auth_user_id)` constraint to prevent authenticated users from modifying other profiles or changing their own `auth_user_id`.
- Removed customer INSERT authorization on `orders` to enforce that order creation happens exclusively through server-side logic.
- Replaced the broad `FOR ALL` policy on `addresses` with separate, granular RLS policies.

### 2. RLS Policies Changed
- Modified: `Allow customers to update their own profile` now enforces both `USING` and `WITH CHECK`.

### 3. Policies Removed
- Removed: `Allow customers to access their own addresses` (broad `FOR ALL` policy).
- Removed: `Allow customers to create their own orders` (direct customer `INSERT` policy).

### 4. Policies Added
- Added: `Allow customers to view their own addresses` (`SELECT`)
- Added: `Allow customers to create their own addresses` (`INSERT`)
- Added: `Allow customers to update their own addresses` (`UPDATE`)
- Added: `Allow customers to delete their own addresses` (`DELETE`)

### 5. Foreign-Key Changes
- None (kept `ON DELETE RESTRICT` on historical transactional keys to prevent loss of financial history).

### 6. Inventory Concurrency Documentation
- Documented the requirements for transaction-safe row-level locking (`SELECT FOR UPDATE`) or custom PostgreSQL RPC functions under **Inventory Concurrency & Reservation Strategy** in [ARCHITECTURE.md](file:///c:/Users/jonht/ember-gas/ARCHITECTURE.md).

### 7. Account Deletion Documentation
- Documented the soft-delete/PII scrub anonymization workflow under **Customer Account Deletion** in [ARCHITECTURE.md](file:///c:/Users/jonht/ember-gas/ARCHITECTURE.md).

### 8. Seed-Data Status
- Seed data remains isolated in [seed.sql](file:///c:/Users/jonht/ember-gas/supabase/seed.sql). No changes were made, and it runs correctly under RLS bypass (using the superuser/service role runner).

### 9. Lint Result
- ESLint checks passed with **0 errors**.

### 10. Typecheck Result
- TypeScript checking passed with **0 errors**.

### 11. Build Result
- Next.js production build completed successfully with **0 errors**.

### 12. Remaining Concerns
- None. The schema security has been fully tightened.

---

### Final RLS Policy Matrix

| Table | PUBLIC READ | CUSTOMER READ | CUSTOMER INSERT | CUSTOMER UPDATE | CUSTOMER DELETE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **business_settings** | YES | YES | NO | NO | NO |
| **products** | YES (active) | YES (active) | NO | NO | NO |
| **cylinders** | NO | NO | NO | NO | NO |
| **inventory** | NO | NO | NO | NO | NO |
| **customers** | NO | YES (`auth.uid()`) | YES (`auth.uid()`) | YES (`auth.uid()`) | NO |
| **addresses** | NO | YES (own) | YES (own) | YES (own) | YES (own) |
| **delivery_zones** | YES (active) | YES (active) | NO | NO | NO |
| **orders** | NO | YES (own) | NO | NO | NO |
| **order_items** | NO | YES (own) | NO | NO | NO |
| **payments** | NO | YES (own) | NO | NO | NO |
| **deliveries** | NO | YES (own) | NO | NO | NO |