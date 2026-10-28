-- ==============================================================================
-- DigiPost / Post Office Automation System — Complete Supabase Database Migration
-- Run this script in the Supabase Dashboard -> SQL Editor
-- This script is idempotent: it is safe to run multiple times.
--
-- 💡 NOTE: If you previously created empty or incompatible tables in Supabase
-- and want a completely fresh, clean start, you can run this command first:
-- DROP TABLE IF EXISTS public.notifications, public.feedback, public.complaints, public.deliveries, public.parcels, public.users CASCADE;
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'customer',
    station VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS station VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 2. PARCELS TABLE
CREATE TABLE IF NOT EXISTS public.parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id VARCHAR(50) UNIQUE,
    sender TEXT,
    customer_id TEXT,
    sender_details JSONB,
    receiver JSONB,
    origin TEXT,
    destination TEXT,
    parcel_type VARCHAR(50) DEFAULT 'standard',
    weight NUMERIC(10,2) DEFAULT 1.0,
    description TEXT,
    cost NUMERIC(10,2) DEFAULT 15.00,
    status VARCHAR(50) DEFAULT 'PENDING',
    assigned_to TEXT,
    booking_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    expected_delivery_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    failure_reason TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations if public.parcels already existed
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(50);
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS sender TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS sender_details JSONB;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS receiver JSONB;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS parcel_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2) DEFAULT 1.0;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS cost NUMERIC(10,2) DEFAULT 15.00;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS booking_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMPTZ;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS delivered_date TIMESTAMPTZ;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'parcels_tracking_id_key'
    ) THEN
        ALTER TABLE public.parcels ADD CONSTRAINT parcels_tracking_id_key UNIQUE (tracking_id);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_parcels_tracking_id ON public.parcels(tracking_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_sender ON public.parcels(sender);
CREATE INDEX IF NOT EXISTS idx_parcels_customer_id ON public.parcels(customer_id);

UPDATE public.parcels AS parcel
SET customer_id = customer.id::text,
    sender_details = COALESCE(
        parcel.sender_details,
        jsonb_build_object(
            'name', customer.name,
            'email', customer.email,
            'phone', customer.phone,
            'address', customer.address
        )
    )
FROM public.users AS customer
WHERE parcel.customer_id IS NULL
  AND lower(parcel.sender) = lower(customer.email);

-- 3. DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id VARCHAR(50) UNIQUE,
    parcel_id TEXT,
    employee TEXT,
    status VARCHAR(50) DEFAULT 'ASSIGNED',
    assigned_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    scheduled_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    failure_reason TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations if public.deliveries already existed
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS delivery_id VARCHAR(50);
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS parcel_id TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS employee TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ASSIGNED';
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'deliveries_delivery_id_key'
    ) THEN
        ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_delivery_id_key UNIQUE (delivery_id);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_deliveries_employee ON public.deliveries(employee);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_parcel_id ON public.deliveries(parcel_id);

-- 4. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(50) UNIQUE,
    customer TEXT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    tracking_id VARCHAR(50),
    category VARCHAR(100) DEFAULT 'general',
    subject TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations if public.complaints already existed
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS complaint_id VARCHAR(50);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS customer TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(50);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'OPEN';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'complaints_complaint_id_key'
    ) THEN
        ALTER TABLE public.complaints ADD CONSTRAINT complaints_complaint_id_key UNIQUE (complaint_id);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_complaints_customer ON public.complaints(customer);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- 5. FEEDBACK / REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id VARCHAR(50),
    customer_id TEXT,
    rating INTEGER DEFAULT 5,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations if public.feedback already existed
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(50);
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_feedback_tracking_id ON public.feedback(tracking_id);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer TEXT,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations if public.notifications already existed
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS customer TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'info';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON public.notifications(customer);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY
-- The Express API connects with the server-only service-role key. Do not expose
-- that key to the frontend or grant direct table access to anon/authenticated.
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for users table" ON public.users;
DROP POLICY IF EXISTS "Allow all for parcels table" ON public.parcels;
DROP POLICY IF EXISTS "Allow all for deliveries table" ON public.deliveries;
DROP POLICY IF EXISTS "Allow all for complaints table" ON public.complaints;
DROP POLICY IF EXISTS "Allow all for feedback table" ON public.feedback;
DROP POLICY IF EXISTS "Allow all for notifications table" ON public.notifications;
REVOKE ALL ON TABLE public.users, public.parcels, public.deliveries, public.complaints, public.feedback, public.notifications FROM anon, authenticated;
GRANT ALL ON TABLE public.users, public.parcels, public.deliveries, public.complaints, public.feedback, public.notifications TO service_role;

-- ==============================================================================
-- 8. SEED INITIAL USERS
-- Passwords:
--   * admin@postoffice.gov       => DigiPostAdmin@2026
--   * employee@postoffice.gov    => DigiPostCourier@2026
--   * sarah.customer@gmail.com   => customer123
-- ==============================================================================

INSERT INTO public.users (name, email, password, phone, address, role, station, status)
VALUES
(
    'Victoria Stirling',
    'admin@postoffice.gov',
    '$2b$10$mwvh093k2c1dGXcvCzYSKOr2WunfVPelUcM0JRMX6cPq9So5qaJpS',
    '+1 (555) 019-2831',
    'Postal HQ Command, 100 Federal Plaza',
    'admin',
    'Headquarters - Central Command',
    'active'
),
(
    'John Carrier',
    'employee@postoffice.gov',
    '$2b$10$fVJLYBiZst4af08lrcC6qOaeupUWP0SzLzvlqYz1zkMhGHRlTcMkq',
    '+1 (555) 234-5678',
    'Distribution Branch 01',
    'employee',
    'Central Sorting Hub 01',
    'active'
),
(
    'Sarah Jenkins',
    'sarah.customer@gmail.com',
    '$2b$10$omZjbbaKHUi55nMi3rcusuA.Glpvq9gToSuQ.C5AF2ClDz2DVGWzG',
    '+1 (555) 912-3456',
    '742 Evergreen Terrace, Springfield, IL 62704',
    'customer',
    NULL,
    'active'
)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    station = EXCLUDED.station,
    status = EXCLUDED.status;

-- 9. SEED INITIAL PARCELS
INSERT INTO public.parcels (tracking_id, sender, receiver, origin, destination, parcel_type, weight, description, cost, status, booking_date)
VALUES
(
    'PO-84920184',
    'sarah.customer@gmail.com',
    '{"name": "Michael Scott", "phone": "+1 (555) 349-2049", "address": "1725 Slough Ave", "city": "Scranton", "state": "PA"}'::jsonb,
    'Springfield, IL',
    'Scranton, PA',
    'express',
    2.5,
    'Confidential contracts',
    33.25,
    'OUT_FOR_DELIVERY',
    now() - interval '3 days'
),
(
    'PO-98231019',
    'sarah.customer@gmail.com',
    '{"name": "Emma Watson", "phone": "+1 (555) 678-1234", "address": "450 Lexington Ave", "city": "New York", "state": "NY"}'::jsonb,
    'Springfield, IL',
    'New York, NY',
    'standard',
    1.2,
    'Gift box',
    16.00,
    'DELIVERED',
    now() - interval '7 days'
)
ON CONFLICT (tracking_id) DO NOTHING;

UPDATE public.parcels AS parcel
SET customer_id = customer.id::text,
    sender_details = COALESCE(
        parcel.sender_details,
        jsonb_build_object(
            'name', customer.name,
            'email', customer.email,
            'phone', customer.phone,
            'address', customer.address
        )
    )
FROM public.users AS customer
WHERE parcel.customer_id IS NULL
  AND lower(parcel.sender) = lower(customer.email);
