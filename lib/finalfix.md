EMBER GAS — PHASE 2.3 FINAL DATABASE VERIFICATION

We have completed Phase 2 database security remediation.

Before proceeding to Supabase deployment, perform a FINAL READ-ONLY verification of the actual implementation.

IMPORTANT:

This is a verification task.

DO NOT:
- modify any files
- create new migrations
- delete files
- deploy anything to Supabase
- run supabase db push
- run destructive SQL
- modify .env
- expose environment variable values
- change Git configuration
- implement APIs
- implement authentication UI
- implement checkout
- implement payments
- implement repositories
- implement frontend functionality

Your job is to inspect the CURRENT implementation and prove whether the requested security fixes actually exist.

Do not trust previous reports.
Inspect the actual SQL files and application code.

==================================================
1. FILES TO INSPECT
==================================================

Inspect at minimum:

supabase/migrations/0001_initial_schema.sql
supabase/seed.sql
ARCHITECTURE.md

Also inspect relevant files under:

lib/
app/
components/

only when necessary to verify that database security assumptions are not contradicted by application code.

==================================================
2. ORDERS — CRITICAL VERIFICATION
==================================================

Find every RLS policy on the orders table.

Verify:

CUSTOMERS MUST NOT have a direct INSERT policy.

Specifically search for any policy equivalent to:

FOR INSERT
WITH CHECK (...)

that allows customers to create orders.

There must NOT be a customer-accessible policy allowing direct order creation.

Verify customers cannot directly modify:

- status
- payment_status
- subtotal
- delivery_fee
- total
- customer_id

Customers should only be able to read their own orders at this stage.

Report:

PASS or FAIL

Then show the exact policy names and operation types.

Do NOT expose unrelated secrets.

==================================================
3. ORDER ITEMS — CRITICAL VERIFICATION
==================================================

Verify customers cannot directly:

INSERT order_items
UPDATE order_items
DELETE order_items

Verify customers can only SELECT order_items belonging to their own orders.

The ownership chain should effectively enforce:

order_items
→ orders
→ customers
→ auth.users

Report:

PASS or FAIL

==================================================
4. ADDRESSES — GRANULAR RLS VERIFICATION
==================================================

Verify that there is NO broad:

FOR ALL

customer policy remaining for addresses.

Verify separate policies exist for:

SELECT
INSERT
UPDATE
DELETE

For INSERT:

The customer must only be able to insert an address whose customer_id belongs to auth.uid().

For UPDATE:

Both the existing row and new row must remain owned by the authenticated customer.

For DELETE:

The customer can only delete their own address.

Report:

PASS or FAIL

List the exact policies.

==================================================
5. PAYMENTS — CRITICAL VERIFICATION
==================================================

Inspect every payments RLS policy.

Customers should:

SELECT their own payments.

Customers must NOT:

INSERT payments
UPDATE payments
DELETE payments

Customers must not be able to change:

status
amount
provider
provider_reference

Report:

PASS or FAIL

==================================================
6. DELIVERIES — CRITICAL VERIFICATION
==================================================

Inspect every deliveries policy.

Customers should only SELECT deliveries belonging to their own orders.

Customers must NOT:

INSERT
UPDATE
DELETE

deliveries.

Customers must not be able to change:

status
delivery_fee
driver_name
driver_phone
dispatched_at
delivered_at

Report:

PASS or FAIL

==================================================
7. INVENTORY — CRITICAL VERIFICATION
==================================================

Inspect inventory RLS.

Normal customers/public users must have:

NO INSERT
NO UPDATE
NO DELETE

access.

Normal customers should NOT have unrestricted SELECT access to inventory.

Verify that internal inventory quantities are not exposed publicly.

Report:

PASS or FAIL

==================================================
8. CYLINDERS — CRITICAL VERIFICATION
==================================================

Inspect cylinders RLS.

Normal customers/public users must NOT be able to:

INSERT
UPDATE
DELETE

cylinders.

They should not be able to manipulate:

serial_number
status
size_kg

Report:

PASS or FAIL

==================================================
9. PRODUCTS — PUBLIC ACCESS VERIFICATION
==================================================

Verify:

Anonymous users can read only active products.

Customers/public users cannot:

INSERT
UPDATE
DELETE

products.

Customers cannot modify:

price
sale_price
service_type
active
inventory-related fields

Report:

PASS or FAIL

==================================================
10. BUSINESS SETTINGS — PUBLIC ACCESS VERIFICATION
==================================================

Verify anonymous/public users can only read the intended public business settings.

They must NOT be able to:

INSERT
UPDATE
DELETE

business settings.

Report:

PASS or FAIL

==================================================
11. DELIVERY ZONES
==================================================

Verify public/customer users can only read active delivery zones.

They must NOT be able to:

INSERT
UPDATE
DELETE

delivery zones.

Report:

PASS or FAIL

==================================================
12. CUSTOMERS TABLE
==================================================

Verify customers are correctly associated with:

auth.users.id

Verify auth_user_id is unique.

Verify customers cannot modify:

auth_user_id

or another customer's profile.

If customer UPDATE is allowed, verify ownership and permitted fields.

Report:

PASS or FAIL

==================================================
13. FOREIGN KEYS / DELETE SAFETY
==================================================

Inspect every foreign key.

Pay special attention to:

customers → auth.users
orders → customers
orders → addresses
order_items → orders
order_items → products
payments → orders
deliveries → orders
deliveries → delivery_zones
inventory → products

Verify that completed financial/order history cannot accidentally be destroyed by deleting a parent record.

Pay particular attention to:

ON DELETE CASCADE

Identify every cascade and explain whether it is safe.

Report:

PASS or FAIL

==================================================
14. ORDER PRICE INTEGRITY
==================================================

Verify order_items contains a historical:

unit_price

and:

line_total

Verify database constraints prevent:

quantity <= 0
unit_price < 0
line_total < 0

Verify the database protects:

line_total = quantity * unit_price

Explain whether subtotal and total are currently protected from client manipulation.

IMPORTANT:

Since direct customer order creation should now be disabled, explain how this changes the security situation.

Report:

PASS or FAIL

==================================================
15. INVENTORY MODEL VERIFICATION
==================================================

Verify inventory contains the intended concepts:

full_quantity
empty_quantity
reserved_quantity

Verify constraints prevent negative values.

Confirm the schema can conceptually support:

REFILL
EXCHANGE
NEW_CYLINDER

Explain any limitations.

Do NOT implement inventory business logic yet.

Report:

PASS or FAIL

==================================================
16. INVENTORY CONCURRENCY DOCUMENTATION
==================================================

Inspect ARCHITECTURE.md.

Verify that it documents the need for atomic inventory operations / transactional reservation logic.

The documentation should explain that future order creation must prevent race conditions and overselling.

If it is missing, report:

FAIL

Do not modify it.

==================================================
17. ACCOUNT DELETION DOCUMENTATION
==================================================

Inspect ARCHITECTURE.md.

Verify that it documents the issue involving:

auth.users
→ customers
→ orders

and that historical orders must be protected.

Verify that future account deletion should use controlled deactivation/anonymization rather than blindly deleting historical financial relationships.

If missing, report:

FAIL

Do not modify it.

==================================================
18. SEED DATA VERIFICATION
==================================================

Inspect:

supabase/seed.sql

Verify:

- no real customer accounts
- no real payments
- no fake production orders
- no passwords
- no secrets
- no service-role keys
- no negative inventory
- product data satisfies constraints
- delivery zones satisfy constraints

Report:

PASS or FAIL

==================================================
19. SERVICE ROLE SECURITY
==================================================

Search the repository for:

SUPABASE_SERVICE_ROLE_KEY

Verify that it is NOT:

- hard-coded
- committed
- included in SQL
- included in seed data
- exposed to client components
- prefixed with NEXT_PUBLIC_

Do not print the actual secret value.

Only report whether a secret was found and where, without exposing its contents.

Report:

PASS or FAIL

==================================================
20. ENVIRONMENT SECURITY
==================================================

Verify:

.env exists locally if accessible.

Verify:

.env is ignored by Git.

Verify:

.env.example contains only placeholders.

Do not display actual .env values.

Report:

PASS or FAIL

==================================================
21. RLS COMPLETE TABLE AUDIT
==================================================

Create a final table:

| Table | RLS Enabled | Public SELECT | Customer SELECT | Customer INSERT | Customer UPDATE | Customer DELETE |
|------|-------------|---------------|-----------------|-----------------|-----------------|-----------------|

Populate it based on the ACTUAL SQL.

Do not guess.

The expected security model is approximately:

business_settings:
public read where appropriate
no public write

products:
public read active products
no public/customer write

cylinders:
no public/customer access

inventory:
no public/customer access

customers:
own customer profile only

addresses:
own addresses only
granular CRUD policies

delivery_zones:
public read active zones
no public/customer write

orders:
customer read own orders
NO direct customer INSERT
NO unrestricted customer UPDATE
NO customer DELETE

order_items:
customer read through own orders
NO direct customer INSERT/UPDATE/DELETE

payments:
customer read through own orders
NO INSERT/UPDATE/DELETE

deliveries:
customer read through own orders
NO INSERT/UPDATE/DELETE

If the actual implementation differs, report the difference.

==================================================
22. SEARCH FOR SECURITY ANTI-PATTERNS
==================================================

Search the repository for dangerous patterns including:

USING (true)
WITH CHECK (true)

unrestricted INSERT policies

unrestricted UPDATE policies

unrestricted DELETE policies

service-role usage in client components

NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

hard-coded Supabase secrets

hard-coded passwords

hard-coded payment credentials

client-side trust of:

price
total
payment status
order status
inventory quantity

Report every finding.

Do not modify anything.

==================================================
23. TYPESCRIPT / APPLICATION VERIFICATION
==================================================

Run:

npm run lint

npx tsc --noEmit

npm run build

All must pass.

If they fail, report the exact errors.

Do not fix them during this verification.

==================================================
24. FINAL VERDICT
==================================================

Produce a final verdict:

READY FOR SUPABASE DEPLOYMENT

or:

NOT READY FOR SUPABASE DEPLOYMENT

Do NOT say "ready" merely because lint/typecheck/build pass.

The database is READY only if:

- direct customer order creation is disabled
- customer order manipulation is blocked
- order item manipulation is blocked
- payment manipulation is blocked
- delivery manipulation is blocked
- inventory is protected
- cylinders are protected
- products are protected
- business settings are protected
- delivery zones are protected
- address RLS is granular
- customer isolation is correct
- destructive cascades are acceptable
- inventory concurrency requirements are documented
- account deletion requirements are documented
- no secrets are exposed
- no dangerous unrestricted policies exist
- lint passes
- typecheck passes
- build passes

==================================================
25. FINAL REPORT FORMAT
==================================================

Return:

# Ember Gas — Phase 2.3 Final Verification

## Overall Verdict

READY / NOT READY

## Critical Security Checks

- Orders
- Order Items
- Payments
- Deliveries
- Inventory
- Cylinders
- Products
- Business Settings
- Addresses
- Customer isolation

Each must say PASS or FAIL.

## RLS Matrix

Provide the complete table.

## Foreign Key Review

List concerning ON DELETE behavior.

## Inventory Model

Explain whether REFILL, EXCHANGE, and NEW_CYLINDER are supported conceptually.

## Documentation Verification

- Inventory concurrency: PASS/FAIL
- Account deletion: PASS/FAIL

## Secret/Environment Verification

PASS/FAIL without exposing secret values.

## Anti-Pattern Scan

List findings.

## Quality Checks

Lint:
Typecheck:
Build:

## Remaining Issues

List every issue, even LOW severity.

STOP AFTER THIS REPORT.

DO NOT MODIFY ANY FILES.
DO NOT DEPLOY ANYTHING.