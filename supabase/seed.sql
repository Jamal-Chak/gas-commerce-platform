-- Seed file for Ember Gas (Demo data)

-- 1. business_settings
INSERT INTO business_settings (
    id,
    company_name,
    logo_url,
    tagline,
    primary_color,
    secondary_color,
    phone,
    email,
    address,
    currency,
    whatsapp_number
) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Ember Gas Demo Company',
    'https://example.com/logo.png',
    'Clean Energy, Delivered Fast',
    '#f97316', -- Orange-500
    '#1e293b', -- Slate-800
    '+27115550199',
    'support@embergas-demo.com',
    '123 Main Street, Johannesburg',
    'ZAR',
    '+27115550199'
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    logo_url = EXCLUDED.logo_url,
    tagline = EXCLUDED.tagline,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    currency = EXCLUDED.currency,
    whatsapp_number = EXCLUDED.whatsapp_number;

-- 2. delivery_zones
INSERT INTO delivery_zones (
    id,
    name,
    description,
    delivery_fee,
    estimated_minutes,
    active
) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Zone A - Central', 'Central business district and surrounding areas', 50.00, 30, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Zone B - Suburbs', 'Residential suburban communities', 100.00, 45, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Zone C - Outlying', 'Far outreach and rural areas', 200.00, 75, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    delivery_fee = EXCLUDED.delivery_fee,
    estimated_minutes = EXCLUDED.estimated_minutes,
    active = EXCLUDED.active;

-- 3. products
-- For each cylinder size (6KG, 9KG, 14KG, 19KG, 48KG), we seed REFILL, EXCHANGE, and NEW_CYLINDER options.
INSERT INTO products (
    id,
    name,
    slug,
    description,
    service_type,
    cylinder_size_kg,
    price,
    sale_price,
    image_url,
    active,
    featured
) VALUES
-- 6KG
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f01', '6kg Gas Refill', '6kg-gas-refill-demo', 'Pure LPG gas refill for your 6kg cylinder.', 'REFILL', 6.00, 280.00, NULL, '/images/cylinder-6kg.svg', TRUE, FALSE),
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f02', '6kg Cylinder Exchange', '6kg-cylinder-exchange-demo', 'Bring your empty 6kg cylinder and exchange for a full one.', 'EXCHANGE', 6.00, 350.00, NULL, '/images/cylinder-6kg.svg', TRUE, TRUE),
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f03', 'New 6kg Cylinder', 'new-6kg-cylinder-demo', 'Brand new 6kg cylinder complete with LPG gas.', 'NEW_CYLINDER', 6.00, 850.00, 799.00, '/images/cylinder-6kg.svg', TRUE, FALSE),

-- 9KG
('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f01', '9kg Gas Refill', '9kg-gas-refill-demo', 'Pure LPG gas refill for your 9kg cylinder.', 'REFILL', 9.00, 380.00, NULL, '/images/cylinder-9kg.svg', TRUE, FALSE),
('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f02', '9kg Cylinder Exchange', '9kg-cylinder-exchange-demo', 'Bring your empty 9kg cylinder and exchange for a full one.', 'EXCHANGE', 9.00, 450.00, NULL, '/images/cylinder-9kg.svg', TRUE, TRUE),
('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f03', 'New 9kg Cylinder', 'new-9kg-cylinder-demo', 'Brand new 9kg cylinder complete with LPG gas.', 'NEW_CYLINDER', 9.00, 1100.00, NULL, '/images/cylinder-9kg.svg', TRUE, FALSE),

-- 14KG
('14c9bd38-0a11-4ef8-bb6d-a0eebc995f01', '14kg Gas Refill', '14kg-gas-refill-demo', 'Pure LPG gas refill for your 14kg cylinder.', 'REFILL', 14.00, 520.00, NULL, '/images/cylinder-14kg.svg', TRUE, FALSE),
('14c9bd38-0a11-4ef8-bb6d-a0eebc995f02', '14kg Cylinder Exchange', '14kg-cylinder-exchange-demo', 'Bring your empty 14kg cylinder and exchange for a full one.', 'EXCHANGE', 14.00, 620.00, NULL, '/images/cylinder-14kg.svg', TRUE, TRUE),
('14c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 'New 14kg Cylinder', 'new-14kg-cylinder-demo', 'Brand new 14kg cylinder complete with LPG gas.', 'NEW_CYLINDER', 14.00, 1600.00, NULL, '/images/cylinder-14kg.svg', TRUE, FALSE),

-- 19KG
('19c9bd38-0a11-4ef8-bb6d-a0eebc995f01', '19kg Gas Refill', '19kg-gas-refill-demo', 'Pure LPG gas refill for your 19kg cylinder.', 'REFILL', 19.00, 680.00, NULL, '/images/cylinder-19kg.svg', TRUE, FALSE),
('19c9bd38-0a11-4ef8-bb6d-a0eebc995f02', '19kg Cylinder Exchange', '19kg-cylinder-exchange-demo', 'Bring your empty 19kg cylinder and exchange for a full one.', 'EXCHANGE', 19.00, 780.00, 749.00, '/images/cylinder-19kg.svg', TRUE, TRUE),
('19c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 'New 19kg Cylinder', 'new-19kg-cylinder-demo', 'Brand new 19kg cylinder complete with LPG gas.', 'NEW_CYLINDER', 19.00, 2100.00, NULL, '/images/cylinder-19kg.svg', TRUE, FALSE),

-- 48KG
('48c9bd38-0a11-4ef8-bb6d-a0eebc995f01', '48kg Gas Refill', '48kg-gas-refill-demo', 'Pure LPG gas refill for your 48kg cylinder.', 'REFILL', 48.00, 1500.00, NULL, '/images/cylinder-48kg.svg', TRUE, FALSE),
('48c9bd38-0a11-4ef8-bb6d-a0eebc995f02', '48kg Cylinder Exchange', '48kg-cylinder-exchange-demo', 'Bring your empty 48kg cylinder and exchange for a full one.', 'EXCHANGE', 48.00, 1700.00, NULL, '/images/cylinder-48kg.svg', TRUE, FALSE),
('48c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 'New 48kg Cylinder', 'new-48kg-cylinder-demo', 'Brand new 48kg cylinder complete with LPG gas.', 'NEW_CYLINDER', 48.00, 4200.00, NULL, '/images/cylinder-48kg.svg', TRUE, FALSE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    service_type = EXCLUDED.service_type,
    cylinder_size_kg = EXCLUDED.cylinder_size_kg,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    image_url = EXCLUDED.image_url,
    active = EXCLUDED.active,
    featured = EXCLUDED.featured;

-- 4. inventory
-- Seed initial inventory for all products to prevent negative stock errors
INSERT INTO inventory (
    product_id,
    full_quantity,
    empty_quantity,
    reserved_quantity
) VALUES
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f01', 50, 10, 0),
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f02', 50, 10, 0),
('6bc9bd38-0a11-4ef8-bb6d-a0eebc995f03', 25, 5, 0),

('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f01', 40, 12, 0),
('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f02', 40, 12, 0),
('9bc9bd38-0a11-4ef8-bb6d-a0eebc995f03', 20, 4, 0),

('14c9bd38-0a11-4ef8-bb6d-a0eebc995f01', 30, 8, 0),
('14c9bd38-0a11-4ef8-bb6d-a0eebc995f02', 30, 8, 0),
('14c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 15, 3, 0),

('19c9bd38-0a11-4ef8-bb6d-a0eebc995f01', 20, 6, 0),
('19c9bd38-0a11-4ef8-bb6d-a0eebc995f02', 20, 6, 0),
('19c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 10, 2, 0),

('48c9bd38-0a11-4ef8-bb6d-a0eebc995f01', 10, 2, 0),
('48c9bd38-0a11-4ef8-bb6d-a0eebc995f02', 10, 2, 0),
('48c9bd38-0a11-4ef8-bb6d-a0eebc995f03', 5, 1, 0)
ON CONFLICT (product_id) DO UPDATE SET
    full_quantity = EXCLUDED.full_quantity,
    empty_quantity = EXCLUDED.empty_quantity,
    reserved_quantity = EXCLUDED.reserved_quantity;
