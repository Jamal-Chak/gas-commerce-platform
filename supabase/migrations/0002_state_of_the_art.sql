-- ============================================================
-- Migration 0002: State-of-the-Art Features
-- Adds: Real-time tracking, subscriptions, payments, WhatsApp,
--       admin roles, cylinder deposits, load shedding, PWA,
--       loyalty, referrals, reviews, promos, notifications
-- ============================================================

-- ── New enums ──────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'admin', 'super_admin');
CREATE TYPE payment_provider AS ENUM ('payfast', 'ozow', 'yoco', 'snapscan', 'zapper', 'cash_on_delivery', 'manual');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push', 'in_app');
CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_confirmed', 'order_dispatched', 'order_out_for_delivery',
    'order_delivered', 'order_cancelled', 'payment_received', 'payment_failed',
    'driver_assigned', 'delivery_eta_update', 'refill_reminder', 'loyalty_reward',
    'subscription_renewal', 'promo_applied', 'review_request'
);
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE promo_type AS ENUM ('percentage', 'fixed', 'free_delivery');
CREATE TYPE promo_scope AS ENUM ('cart', 'product', 'category', 'delivery');

-- ── 1. REAL-TIME ORDER TRACKING ───────────────────────────

-- Add driver location + proof-of-delivery to deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS driver_latitude NUMERIC(9,6);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS driver_longitude NUMERIC(9,6);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS driver_id UUID;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS proof_signature TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS notes TEXT;

-- Order status timeline for real-time tracking
CREATE TABLE order_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    previous_status order_status,
    changed_by UUID REFERENCES auth.users(id),
    changed_by_name TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_order_status_events_order ON order_status_events(order_id, created_at DESC);

-- Order notifications (multi-channel)
CREATE TABLE order_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL DEFAULT 'in_app',
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_order_notifications_order ON order_notifications(order_id);
CREATE INDEX idx_order_notifications_customer ON order_notifications(customer_id, created_at DESC);

-- ── 2. SMART REORDER / SUBSCRIPTIONS ──────────────────────

-- Subscription schedules (auto-refill)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    interval_days INTEGER NOT NULL CHECK (interval_days > 0),
    next_delivery_date DATE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    payment_method payment_provider DEFAULT 'cash_on_delivery',
    last_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id, status);
CREATE INDEX idx_subscriptions_next_delivery ON subscriptions(next_delivery_date) WHERE status = 'active';

-- Order line items for reorder tracking
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_reorder BOOLEAN DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- ── 3. PAYMENT GATEWAYS ───────────────────────────────────

-- Extend payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider payment_provider NOT NULL DEFAULT 'cash_on_delivery';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS redirect_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS callback_data JSONB DEFAULT '{}';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2);

-- Payment method settings per business
CREATE TABLE payment_provider_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider payment_provider NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 4. WHATSAPP INTEGRATION ───────────────────────────────

-- WhatsApp message log
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    message_type TEXT NOT NULL DEFAULT 'text',
    body TEXT NOT NULL,
    media_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_message_id TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_whatsapp_messages_customer ON whatsapp_messages(customer_id);

-- Notification preferences per customer
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    order_updates BOOLEAN NOT NULL DEFAULT TRUE,
    promotions BOOLEAN NOT NULL DEFAULT FALSE,
    refill_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 5. ADMIN / ROLES ──────────────────────────────────────

-- Extend customers with role
ALTER TABLE customers ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Admin audit log
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_user_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT,
    vehicle_registration TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Link deliveries to drivers table
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_order_id_fkey;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- ── 6. CYLINDER DEPOSIT TRACKING ──────────────────────────

CREATE TABLE cylinder_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    cylinder_size_kg NUMERIC(5,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    deposit_amount NUMERIC(10,2) NOT NULL CHECK (deposit_amount >= 0),
    deposit_paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    returned_at TIMESTAMP WITH TIME ZONE,
    refund_amount NUMERIC(10,2),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_cylinder_deposits_customer ON cylinder_deposits(customer_id);

-- Deposit pricing settings
CREATE TABLE deposit_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinder_size_kg NUMERIC(5,2) NOT NULL UNIQUE,
    deposit_amount NUMERIC(10,2) NOT NULL CHECK (deposit_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── 7. LOAD SHEDDING ──────────────────────────────────────

CREATE TABLE load_shedding_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_code TEXT NOT NULL,
    area_name TEXT NOT NULL,
    stage INTEGER NOT NULL DEFAULT 1,
    schedule_data JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_load_shedding_area ON load_shedding_schedule(area_code);

-- Delivery area to load-shedding zone mapping
ALTER TABLE delivery_zones ADD COLUMN IF NOT EXISTS area_code TEXT;
ALTER TABLE delivery_zones ADD COLUMN IF NOT EXISTS load_shedding_adjustment_minutes INTEGER DEFAULT 0;

-- ── 8. LOYALTY & REFERRALS ────────────────────────────────

CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired', 'referral')),
    description TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id, created_at DESC);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
    reward_points INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Loyalty settings (singleton)
CREATE TABLE loyalty_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    points_per_rand_spent NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    referral_bonus_points INTEGER NOT NULL DEFAULT 500,
    min_redemption_points INTEGER NOT NULL DEFAULT 1000,
    points_expiry_days INTEGER NOT NULL DEFAULT 365,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_loyalty_row CHECK (id = '00000000-0000-0000-0000-000000000001'::UUID)
);
INSERT INTO loyalty_settings (id) VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT (id) DO NOTHING;

-- ── 9. REVIEWS & RATINGS ──────────────────────────────────

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    admin_reply TEXT,
    admin_replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT one_review_per_order_product UNIQUE (order_id, product_id)
);
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id, created_at DESC);

-- ── 10. PROMO CODES ───────────────────────────────────────

CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    type promo_type NOT NULL,
    scope promo_scope NOT NULL DEFAULT 'cart',
    value NUMERIC(10,2) NOT NULL CHECK (value >= 0),
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount NUMERIC(10,2),
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    per_customer_limit INTEGER DEFAULT 1,
    applicable_product_ids UUID[],
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_promo_codes_code ON promo_codes(code) WHERE active = TRUE;

CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    discount_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_usage_customer ON promo_code_usage(customer_id);

-- Add promo to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider payment_provider DEFAULT 'cash_on_delivery';

-- ── 11. PUSH SUBSCRIPTIONS (PWA) ──────────────────────────

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_push_subscriptions_customer ON push_subscriptions(customer_id);

-- ── RLS POLICIES ──────────────────────────────────────────

-- Enable RLS on new tables
ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cylinder_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_shedding_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read on load_shedding_schedule" ON load_shedding_schedule FOR SELECT USING (TRUE);
CREATE POLICY "Public read on deposit_pricing" ON deposit_pricing FOR SELECT USING (TRUE);
CREATE POLICY "Public read on active promo_codes" ON promo_codes FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read on public product_reviews" ON product_reviews FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Public read on loyalty_settings" ON loyalty_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public read on payment_provider_settings" ON payment_provider_settings FOR SELECT USING (enabled = TRUE);

-- Customer self-service policies
CREATE POLICY "Customer read own status events" ON order_status_events FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
);
CREATE POLICY "Customer read own notifications" ON order_notifications FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer update own notifications" ON order_notifications FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read own subscriptions" ON subscriptions FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer manage own subscriptions" ON subscriptions FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read own whatsapp messages" ON whatsapp_messages FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer manage own notification prefs" ON notification_preferences FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read own deposits" ON cylinder_deposits FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read own loyalty txns" ON loyalty_transactions FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read own referrals" ON referrals FOR SELECT USING (
    referrer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR referred_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer read/write own reviews" ON product_reviews FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer insert own reviews" ON product_reviews FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customer manage own push subs" ON push_subscriptions FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

-- Driver policies
CREATE POLICY "Drivers read own record" ON drivers FOR SELECT USING (
    auth_user_id = auth.uid()
);
CREATE POLICY "Drivers update own location" ON drivers FOR UPDATE USING (
    auth_user_id = auth.uid()
);

-- Admin policies (service role has full access, these are for admin users)
CREATE POLICY "Admin read audit log" ON admin_audit_log FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM customers WHERE auth_user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- ── SUPABASE REALTIME ─────────────────────────────────────

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_events;
ALTER PUBLICATION supabase_realtime ADD TABLE order_notifications;

-- ── TRIGGERS ──────────────────────────────────────────────

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_messages_updated_at BEFORE UPDATE ON whatsapp_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deposit_pricing_updated_at BEFORE UPDATE ON deposit_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_settings_updated_at BEFORE UPDATE ON loyalty_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_provider_settings_updated_at BEFORE UPDATE ON payment_provider_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── AUTO-UPDATE loyalty points on order completion ────────
CREATE OR REPLACE FUNCTION award_loyalty_points() RETURNS TRIGGER AS $$
DECLARE
    pts INTEGER;
    customer_uuid UUID;
BEGIN
    IF NEW.status = 'DELIVERED' AND (OLD.status IS DISTINCT FROM 'DELIVERED') THEN
        SELECT id INTO customer_uuid FROM customers WHERE id = NEW.customer_id;
        IF customer_uuid IS NOT NULL THEN
            pts := FLOOR(NEW.total::NUMERIC);
            UPDATE customers SET loyalty_points = loyalty_points + pts WHERE id = customer_uuid;
            INSERT INTO loyalty_transactions (customer_id, points, type, description, order_id)
            VALUES (customer_uuid, pts, 'earned', 'Points earned from order ' || NEW.order_number, NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_loyalty_points
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION award_loyalty_points();

-- ── AUTO-CREATE order_status_event on order status change ─
CREATE OR REPLACE FUNCTION log_order_status_change() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO order_status_events (order_id, status, previous_status)
        VALUES (NEW.id, NEW.status, OLD.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();
