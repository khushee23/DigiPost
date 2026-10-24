-- Optional, additive India-focused demo data for DigiPost.
-- Run after supabase_schema.sql in the Supabase SQL Editor.
-- All names, email addresses, phone numbers, and parcel records are synthetic.
-- Demo password for all accounts: IndiaDemo@2026
-- The password is stored as a bcrypt hash; do not use these accounts in production.

BEGIN;

INSERT INTO public.users (name, email, password, phone, address, role, station, status)
VALUES
  ('Demo Administrator', 'admin.demo@digipost.in', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00001', 'Postal HQ, Fort, Mumbai, Maharashtra 400001', 'admin', 'India Demo - Headquarters', 'active'),
  ('Demo Courier Mumbai', 'courier.mumbai@digipost.in', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00002', 'Andheri East, Mumbai, Maharashtra 400069', 'employee', 'Mumbai GPO', 'active'),
  ('Demo Courier Delhi', 'courier.delhi@digipost.in', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00003', 'Connaught Place, New Delhi 110001', 'employee', 'New Delhi GPO', 'active'),
  ('Demo Courier Bengaluru', 'courier.bengaluru@digipost.in', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00004', 'Cubbon Road, Bengaluru, Karnataka 560001', 'employee', 'Bengaluru GPO', 'active'),
  ('Asha Sharma', 'asha.sharma@example.com', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00011', 'Fort Area, Mumbai, Maharashtra 400001', 'customer', NULL, 'active'),
  ('Rohan Mehta', 'rohan.mehta@example.com', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00012', 'Baner, Pune, Maharashtra 411045', 'customer', NULL, 'active'),
  ('Priya Iyer', 'priya.iyer@example.com', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00013', 'Indiranagar, Bengaluru, Karnataka 560038', 'customer', NULL, 'active'),
  ('Arjun Verma', 'arjun.verma@example.com', '$2b$10$Nnd94YNGSUWUWBTL4ddiSuEgUe7YZoda3HbmxHiSj/wLMwfFUh9ae', '+91 90000 00014', 'Dwarka Sector 10, New Delhi 110075', 'customer', NULL, 'active')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  role = EXCLUDED.role,
  station = EXCLUDED.station,
  status = EXCLUDED.status,
  updated_at = now();

WITH samples (
  tracking_id, customer_email, employee_email, origin, destination,
  receiver, parcel_type, weight, description, cost, status,
  booking_days_ago, event_days_ago, failure_reason
) AS (
  VALUES
    ('DG-IND-DEMO-001', 'asha.sharma@example.com', 'courier.mumbai@digipost.in', 'Mumbai, Maharashtra', 'Pune, Maharashtra', '{"name":"Rohan Mehta","phone":"+91 90000 00012","address":"Flat 4B, Green View Society, Baner","city":"Pune","state":"Maharashtra","postalCode":"411045"}'::jsonb, 'express', 1.2::numeric, 'Signed university documents', 68.00::numeric, 'DELIVERED', 5, 3, NULL),
    ('DG-IND-DEMO-002', 'rohan.mehta@example.com', 'courier.mumbai@digipost.in', 'Pune, Maharashtra', 'Mumbai, Maharashtra', '{"name":"Asha Sharma","phone":"+91 90000 00011","address":"12 Fort Area, near GPO","city":"Mumbai","state":"Maharashtra","postalCode":"400001"}'::jsonb, 'document', 0.4::numeric, 'College admission documents', 42.00::numeric, 'DELIVERED', 14, 11, NULL),
    ('DG-IND-DEMO-003', 'asha.sharma@example.com', 'courier.mumbai@digipost.in', 'Mumbai, Maharashtra', 'Navi Mumbai, Maharashtra', '{"name":"Neha Kulkarni","phone":"+91 90000 00015","address":"Palm Beach Road, Vashi","city":"Navi Mumbai","state":"Maharashtra","postalCode":"400703"}'::jsonb, 'standard', 2.5::numeric, 'Books and stationery', 95.00::numeric, 'OUT_FOR_DELIVERY', 1, NULL, NULL),
    ('DG-IND-DEMO-004', 'priya.iyer@example.com', 'courier.bengaluru@digipost.in', 'Bengaluru, Karnataka', 'Mysuru, Karnataka', '{"name":"Kavya Rao","phone":"+91 90000 00016","address":"Vijayanagar, Mysuru","city":"Mysuru","state":"Karnataka","postalCode":"570017"}'::jsonb, 'standard', 3.0::numeric, 'Clothing parcel', 110.00::numeric, 'IN_TRANSIT', 2, NULL, NULL),
    ('DG-IND-DEMO-005', 'rohan.mehta@example.com', 'courier.delhi@digipost.in', 'Pune, Maharashtra', 'New Delhi, Delhi', '{"name":"Arjun Verma","phone":"+91 90000 00014","address":"Sector 10, Dwarka","city":"New Delhi","state":"Delhi","postalCode":"110075"}'::jsonb, 'fragile', 1.8::numeric, 'Carefully packed ceramic gifts', 145.00::numeric, 'ASSIGNED', 1, NULL, NULL),
    ('DG-IND-DEMO-006', 'arjun.verma@example.com', NULL, 'New Delhi, Delhi', 'Jaipur, Rajasthan', '{"name":"Meera Joshi","phone":"+91 90000 00017","address":"Malviya Nagar, Jaipur","city":"Jaipur","state":"Rajasthan","postalCode":"302017"}'::jsonb, 'standard', 2.0::numeric, 'Winter clothing', 88.00::numeric, 'PENDING', 0, NULL, NULL),
    ('DG-IND-DEMO-007', 'priya.iyer@example.com', 'courier.bengaluru@digipost.in', 'Bengaluru, Karnataka', 'Chennai, Tamil Nadu', '{"name":"Ananya Kumar","phone":"+91 90000 00018","address":"Adyar, Chennai","city":"Chennai","state":"Tamil Nadu","postalCode":"600020"}'::jsonb, 'express', 0.8::numeric, 'Time-sensitive legal papers', 62.00::numeric, 'FAILED', 9, 7, 'Recipient unavailable; delivery attempted'),
    ('DG-IND-DEMO-008', 'asha.sharma@example.com', 'courier.mumbai@digipost.in', 'Mumbai, Maharashtra', 'Ahmedabad, Gujarat', '{"name":"Dev Patel","phone":"+91 90000 00019","address":"Navrangpura, Ahmedabad","city":"Ahmedabad","state":"Gujarat","postalCode":"380009"}'::jsonb, 'standard', 4.2::numeric, 'Books and household items', 156.00::numeric, 'DELIVERED', 48, 45, NULL),
    ('DG-IND-DEMO-009', 'rohan.mehta@example.com', NULL, 'Pune, Maharashtra', 'Hyderabad, Telangana', '{"name":"Sana Khan","phone":"+91 90000 00020","address":"Himayatnagar, Hyderabad","city":"Hyderabad","state":"Telangana","postalCode":"500029"}'::jsonb, 'heavy', 8.0::numeric, 'Packaged household supplies', 280.00::numeric, 'PENDING', 70, NULL, NULL),
    ('DG-IND-DEMO-010', 'arjun.verma@example.com', 'courier.delhi@digipost.in', 'New Delhi, Delhi', 'Lucknow, Uttar Pradesh', '{"name":"Nisha Singh","phone":"+91 90000 00021","address":"Gomti Nagar, Lucknow","city":"Lucknow","state":"Uttar Pradesh","postalCode":"226010"}'::jsonb, 'document', 0.3::numeric, 'Insurance paperwork', 38.00::numeric, 'DELIVERED', 134, 130, NULL)
),
parcel_values AS (
  SELECT
    sample.*,
    customer.id AS customer_id,
    customer.name AS customer_name,
    customer.phone AS customer_phone,
    customer.address AS customer_address,
    employee.id AS employee_id,
    now() - sample.booking_days_ago * interval '1 day' AS booked_at,
    CASE WHEN sample.event_days_ago IS NOT NULL
      THEN now() - sample.event_days_ago * interval '1 day'
      ELSE NULL
    END AS event_at
  FROM samples AS sample
  JOIN public.users AS customer ON customer.email = sample.customer_email
  LEFT JOIN public.users AS employee ON employee.email = sample.employee_email
)
INSERT INTO public.parcels (
  tracking_id, sender, customer_id, sender_details, receiver, origin, destination,
  parcel_type, weight, description, cost, status, assigned_to, booking_date,
  expected_delivery_date, delivered_date, failure_reason, history
)
SELECT
  sample.tracking_id,
  sample.customer_email,
  sample.customer_id::text,
  jsonb_build_object(
    'name', sample.customer_name,
    'email', sample.customer_email,
    'phone', sample.customer_phone,
    'address', sample.customer_address
  ),
  sample.receiver,
  sample.origin,
  sample.destination,
  sample.parcel_type,
  sample.weight,
  sample.description,
  sample.cost,
  sample.status,
  sample.employee_id::text,
  sample.booked_at,
  sample.booked_at + interval '4 days',
  sample.event_at,
  sample.failure_reason,
  CASE WHEN sample.status = 'PENDING' THEN
    jsonb_build_array(jsonb_build_object('status', 'PENDING', 'timestamp', sample.booked_at, 'location', sample.origin))
  ELSE
    jsonb_build_array(
      jsonb_build_object('status', 'BOOKED', 'timestamp', sample.booked_at, 'location', sample.origin),
      jsonb_build_object('status', sample.status, 'timestamp', COALESCE(sample.event_at, now()), 'location', sample.destination)
    )
  END
FROM parcel_values AS sample
ON CONFLICT (tracking_id) DO NOTHING;

INSERT INTO public.deliveries (
  delivery_id, parcel_id, employee, status, assigned_date, scheduled_date,
  completion_date, failure_reason, location, notes
)
SELECT
  'DEL-' || parcel.tracking_id,
  parcel.id::text,
  parcel.assigned_to,
  parcel.status,
  parcel.booking_date,
  parcel.expected_delivery_date,
  parcel.delivered_date,
  parcel.failure_reason,
  parcel.destination,
  'India demo seed record'
FROM public.parcels AS parcel
WHERE parcel.tracking_id LIKE 'DG-IND-DEMO-%'
  AND parcel.assigned_to IS NOT NULL
ON CONFLICT (delivery_id) DO NOTHING;

INSERT INTO public.complaints (
  complaint_id, customer, customer_name, customer_email, tracking_id,
  category, subject, description, status, resolution_notes, resolved_at
)
SELECT
  'CMP-IND-DEMO-001', customer.id::text, customer.name, customer.email,
  'DG-IND-DEMO-007', 'delivery', 'Delivery attempt follow-up',
  'Please confirm the next delivery attempt after the recipient was unavailable.',
  'OPEN', NULL, NULL
FROM public.users AS customer
WHERE customer.email = 'priya.iyer@example.com'
ON CONFLICT (complaint_id) DO NOTHING;

INSERT INTO public.complaints (
  complaint_id, customer, customer_name, customer_email, tracking_id,
  category, subject, description, status, resolution_notes, resolved_at
)
SELECT
  'CMP-IND-DEMO-002', customer.id::text, customer.name, customer.email,
  'DG-IND-DEMO-001', 'tracking', 'Tracking status clarification',
  'The parcel was delivered successfully; please confirm the recorded delivery.',
  'RESOLVED', 'Delivery status and confirmation were checked against the manifest.', now() - interval '2 days'
FROM public.users AS customer
WHERE customer.email = 'asha.sharma@example.com'
ON CONFLICT (complaint_id) DO NOTHING;

INSERT INTO public.feedback (tracking_id, customer_id, rating, feedback)
SELECT 'DG-IND-DEMO-001', customer.id::text, 5,
  'Parcel arrived safely and the tracking updates were helpful.'
FROM public.users AS customer
WHERE customer.email = 'asha.sharma@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.feedback WHERE tracking_id = 'DG-IND-DEMO-001'
  );

INSERT INTO public.notifications (customer, title, message, type, is_read)
SELECT demo_customer.id::text, 'Parcel delivered',
  'Your parcel DG-IND-DEMO-001 was delivered to Pune, Maharashtra.',
  'parcel', true
FROM public.users AS demo_customer
WHERE demo_customer.email = 'asha.sharma@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications AS notification
    WHERE notification.customer = demo_customer.id::text
      AND notification.title = 'Parcel delivered'
      AND notification.message LIKE '%DG-IND-DEMO-001%'
  );

COMMIT;
