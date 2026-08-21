EMBER GAS — PHASE 2.1 DATABASE SECURITY AUDIT

We have completed the initial PostgreSQL/Supabase schema migration.

The migration has NOT yet been deployed to Supabase.

Do NOT modify the migration yet.

Your task is to perform a rigorous security and data-integrity audit of:

supabase/migrations/0001_initial_schema.sql

and:

supabase/seed.sql

IMPORTANT:

Do not create a new migration.

Do not deploy anything.

Do not modify .env.

Do not expose any secret values.

Do not modify Git configuration.

==================================================
AUDIT 1 — ROW LEVEL SECURITY
==================================================

Inspect every table and determine:

- Is RLS enabled?
- What SELECT policies exist?
- What INSERT policies exist?
- What UPDATE policies exist?
- What DELETE policies exist?
- Who can execute each operation?
- Does the policy correctly use auth.uid()?
- Can one customer access another customer's records?

Explicitly audit:

business_settings
products
cylinders
inventory
customers
addresses
delivery_zones
orders
order_items
payments
deliveries

Do not assume a table is secure simply because RLS is enabled.

==================================================
AUDIT 2 — CUSTOMER SECURITY
==================================================

A normal authenticated customer must NOT be able to:

- read another customer's profile
- modify another customer's profile
- read another customer's addresses
- modify another customer's addresses
- read another customer's orders
- modify another customer's orders
- read another customer's order items
- modify another customer's order items
- modify product prices
- modify product active status
- modify inventory
- modify cylinder status
- modify business settings
- modify payment status
- mark payments as paid
- modify delivery driver information
- mark deliveries as delivered
- access administrative data

Verify these assumptions against the actual SQL policies.

==================================================
AUDIT 3 — PAYMENTS
==================================================

Inspect the payments policies carefully.

Customers may need to READ their own payment records.

Customers must NOT be able to arbitrarily:

- create fake successful payments
- change payment status to PAID
- change payment amount
- change provider reference
- mark payments refunded

Payment status changes should eventually be performed by trusted server-side/payment webhook logic.

If the current schema allows customer manipulation of payment records, identify it as a security issue.

==================================================
AUDIT 4 — DELIVERIES
==================================================

Customers should be able to view delivery information associated with their own orders.

Customers should NOT be able to arbitrarily change:

- driver_name
- driver_phone
- delivery status
- dispatched_at
- delivered_at
- delivery fee

Identify any policy that permits this.

==================================================
AUDIT 5 — INVENTORY
==================================================

Inventory is business-critical.

Determine whether normal customers can:

- read inventory
- modify inventory
- insert inventory
- delete inventory

Normal customers must not be able to mutate inventory.

Also verify whether negative inventory can occur despite database constraints.

==================================================
AUDIT 6 — CYLINDERS
==================================================

Physical cylinders are business assets.

Determine whether normal customers can:

- read cylinder records
- modify cylinder status
- modify serial numbers
- create cylinders
- delete cylinders

Normal customers must not be able to mutate cylinder inventory.

==================================================
AUDIT 7 — PRODUCTS
==================================================

Public users should only be able to read appropriate active products.

Customers/public users must NOT be able to:

- change product prices
- change product inventory
- change service types
- deactivate products
- create arbitrary products

Check the actual policies.

==================================================
AUDIT 8 — BUSINESS SETTINGS
==================================================

Public users may read the settings needed by the public website.

Public users must NOT be able to:

- modify company information
- change prices
- change branding
- modify payment configuration
- modify WhatsApp number
- modify delivery configuration

Check the actual SQL.

==================================================
AUDIT 9 — DELETE BEHAVIOR
==================================================

Review every foreign key and ON DELETE action.

Pay special attention to:

inventory -> products
orders -> customers
orders -> addresses
order_items -> orders
order_items -> products
payments -> orders
deliveries -> orders
deliveries -> delivery_zones

Determine whether deleting a record could accidentally destroy:

- financial history
- order history
- inventory information
- delivery history

Historical transaction records should be protected wherever appropriate.

==================================================
AUDIT 10 — ORDER INTEGRITY
==================================================

Verify:

- order numbers are unique
- quantities cannot be zero/negative
- prices cannot be negative
- line totals are validated
- historical unit prices are preserved
- totals cannot become negative
- foreign keys are valid

IMPORTANT:

Do not assume a CHECK constraint is enough to protect business logic that requires transactions.

Identify business rules that must eventually be implemented in trusted server-side code or PostgreSQL functions/transactions.

==================================================
AUDIT 11 — INVENTORY BUSINESS LOGIC
==================================================

Review whether the current schema can correctly support:

REFILL:

Full gas inventory decreases appropriately.

EXCHANGE:

Customer gives EMPTY cylinder.

Business provides FULL cylinder.

Conceptually:

full_quantity - 1
empty_quantity + 1

NEW CYLINDER:

A new/full cylinder leaves inventory.

Determine whether the current schema is sufficient for these operations.

Do NOT implement the business logic yet.

Only identify whether the schema supports it safely.

==================================================
AUDIT 12 — SEED DATA
==================================================

Review seed.sql.

Ensure:

- no real customer accounts are created
- no real payment records are created
- no fake production transactions are created
- demo products are clearly demo data
- demo business settings are clearly temporary
- seed data does not violate constraints
- seed data does not create negative inventory

==================================================
AUDIT 13 — SERVICE ROLE
==================================================

Confirm that no service-role key appears in SQL, seed data, client-side code, or committed configuration.

Do not print secret values.

==================================================
AUDIT 14 — PUBLIC ACCESS
==================================================

Identify every table accessible to anonymous/public users.

For each one explain:

- what can be read
- what can be inserted
- what can be updated
- what can be deleted

There should be no accidental public write access.

==================================================
FINAL REPORT
==================================================

A. PASSING AREAS
- **Authentication Setup**: No passwords or credentials are stored. The `customers` table maps to `auth.users` cleanly.
- **Service Role Isolation**: No service role key or secret is committed or leaked in any schema/seed file.
- **Product and Setting Policies**: Read access is properly restricted to active entries, and write access is completely blocked for public/authenticated users.
- **Cylinders and Inventory RLS**: Both `cylinders` and `inventory` tables are fully locked down, with RLS enabled and zero access policies for public/customers.
- **Delivery Zone RLS**: Delivery fees and estimate configurations are read-only for public/customers, and write access is completely blocked.
- **Seed Data Compliance**: Demo data is clearly labeled, contains no dummy customer profiles, doesn't violate database constraints, and does not create negative quantities.

B. SECURITY ISSUES
- **Direct Order Manipulation**:
  - severity: HIGH
  - affected table: `orders`
  - affected SQL policy/constraint: `Allow customers to create their own orders`
  - explanation: Allowing authenticated customers to insert orders directly means they can define their own `status`, `payment_status`, `subtotal`, `delivery_fee`, and `total`. A user could bypass backend validation using their browser's Supabase client and insert an order marked as `status = 'DELIVERED'` and `total = 0.00`.
  - recommended fix: Drop this INSERT policy. Orders must only be created via trusted server-side Next.js route handlers or Server Actions that use the service-role client bypass, verifying pricing and stock before insertion.

C. DATA-INTEGRITY ISSUES
- **Negative Inventory Triggers**:
  - severity: MEDIUM
  - affected table: `inventory`
  - affected SQL policy/constraint: CHECK constraints on quantities (`>= 0`)
  - explanation: While the check constraints prevent negative integers, concurrent transactions checking and subtracting quantities can cause race conditions or fail abruptly during heavy concurrent orders.
  - recommended fix: Implement a row-level locking mechanism (e.g. `SELECT FOR UPDATE`) or a transactional RPC database function to handle inventory reservation and stock reduction safely in PostgreSQL before inserting orders.

D. RLS ISSUES
- **Vague RLS on Addresses**:
  - severity: MEDIUM
  - affected table: `addresses`
  - affected SQL policy/constraint: `Allow customers to access their own addresses`
  - explanation: The policy uses `FOR ALL USING (...)`. Under `FOR ALL`, the `USING` clause applies to SELECT, INSERT, UPDATE, and DELETE. Defining one policy for all operations is risky, as it makes it easier to accidentally permit operations that require different logic (e.g., preventing deletion of addresses if they are tied to historic orders, or inserting an address for another customer's ID).
  - recommended fix: Split the `FOR ALL` policy into explicit, granular policies: `FOR SELECT`, `FOR INSERT`, `FOR UPDATE`, and `FOR DELETE`.

E. DELETE/FOREIGN-KEY ISSUES
- **Accidental Cascading of Customer Profiles**:
  - severity: LOW
  - affected table: `customers`
  - affected SQL policy/constraint: `auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - explanation: If an auth user deletes their account, their profile in the `customers` table is cascade deleted. Because `orders.customer_id` is set to `ON DELETE RESTRICT`, this deletion would fail if the customer has historical orders. This prevents accidental deletion of financial records, which is good. However, it can cause the account deletion process to throw a PostgreSQL foreign key error.
  - recommended fix: Keep `ON DELETE RESTRICT` on orders to protect transactions. However, set up a soft-delete mechanism or anonymization function rather than throwing an unhandled database constraint error on auth user deletion.

F. INVENTORY DESIGN ISSUES
- **Refill vs. New vs. Exchange State Tracking**:
  - severity: LOW
  - affected table: `inventory`
  - affected SQL policy/constraint: Columns `full_quantity`, `empty_quantity`, `reserved_quantity`
  - explanation: The columns are sufficient to track basic cylinder exchanges. However, for a pure `REFILL` where a customer's specific cylinder is sent out, refilled, and returned, we need to ensure the system keeps track of customer-owned cylinders in transit, which the aggregate inventory table does not model natively.
  - recommended fix: Confirm that individual cylinder tracing is handled via the `cylinders` table and that the `inventory` table remains an aggregate counter.

G. PAYMENT SECURITY ISSUES
- **No Direct Payments Creation**:
  - severity: PASSING (No issues found)
  - affected table: `payments`
  - affected SQL policy/constraint: `Allow customers to view their own payments`
  - explanation: The schema correctly permits only SELECT for payments, preventing customers from inserting fake successful payment records.
  - recommended fix: Maintain this approach; payment insertion/updates must happen exclusively via server-side payment gateway webhook handlers.

H. DELIVERY SECURITY ISSUES
- **No Direct Deliveries Modification**:
  - severity: PASSING (No issues found)
  - affected table: `deliveries`
  - affected SQL policy/constraint: `Allow customers to view their own deliveries`
  - explanation: Customers can only select/read delivery information. They cannot modify status, driver details, or fees.
  - recommended fix: Maintain this approach.

I. SEED DATA ISSUES
- **Missing Explicit Seed RLS Checks**:
  - severity: LOW
  - affected table: `products` and `delivery_zones`
  - affected SQL policy/constraint: `seed.sql` inserts
  - explanation: The seed script uses static UUIDs which is excellent. However, if RLS policies are enabled during migration run, seeding using default authenticated users could fail.
  - recommended fix: Ensure the migration runner is executed using a superuser/admin role (e.g. `service_role`) that automatically bypasses RLS during the seeding phase.

J. REQUIRED CHANGES BEFORE DEPLOYMENT
1. **Remove Orders INSERT Policy**: Drop `Allow customers to create their own orders` from the migration.
2. **Granularize Addresses Policy**: Split the `FOR ALL` policy on `addresses` into distinct `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.
3. **Draft Soft-Delete / Anonymization Logic**: Handle `auth.users` deletion gracefully without violating `ON DELETE RESTRICT` constraints on historical orders.
4. **Draft Inventory Reservation Database Functions**: Prepare a stored procedure or transaction script to handle concurrent inventory checks and subtractions.