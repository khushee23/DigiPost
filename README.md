# DigiPost — Post Office Automation System

A modern, full-stack **Post Office Automation System** designed to digitize and streamline postal logistics operations. The system reduces manual paperwork, eliminates physical ledger bottlenecks, and provides reliable parcel booking, delivery tracking, courier route management, complaints processing, customer reviews, and administrative analytics.

Built for a third-year Software Engineering group project using **React, Vite, Express.js, Supabase, and Node.js**.

---

## 🚀 Features & Role-Based Portals

The application implements three dedicated, role-specific experiences with complete client-side route guards, secure server-side role authorization, and state persistence:

### 1. Public Portal
- **Landing Page**: Postal services hero section, quick tracking lookup box, service feature cards, "How It Works" 4-step workflow, and role demonstration quick-access.
- **Sign In & Register**: Clean authentication interface with show/hide password, field validation, and 1-click role demo shortcuts.
- **Public Parcel Tracking**: Real-time multi-step tracking progress timeline and event logs with complete privacy protection (never exposes private phone numbers, passwords, or personal details).

### 2. Customer Portal (`/customer/*`)
- **Customer Dashboard**: Overview KPI cards (Total Consignments, Pending, In Transit, Delivered), status breakdown donut chart, recent bookings table, and quick actions.
- **Book a Parcel**: Sender, recipient, and consignment specifications forms with live postage rate calculation, delivery window estimation, and instant tracking ID generation modal.
- **My Parcels**: Responsive table/card consignment history with search, status filters, and pagination.
- **Parcel Cancellation**: Self-service cancellation for eligible bookings in `PENDING` state before dispatch.
- **Parcel Details & Tracking**: Comprehensive milestone tracking timeline, sender/recipient records, courier info, and fast links to file complaints or submit reviews.
- **Complaints & Support**: Submit support tickets linked to booked parcels and track administrative resolution notes.
- **Feedback & Reviews**: 5-star ratings and written reviews on delivered packages.
- **Customer Notifications & Profile**: Contact information updates and secure password change.

### 3. Postal Courier / Employee Portal (`/employee/*`)
- **Employee Dashboard**: Route KPIs (Assigned, In Transit, Delivered, Failed Attempts) and today's active delivery queue.
- **My Assigned Deliveries**: Filterable manifest of dispatches allocated strictly to the courier.
- **Today's Delivery Queue**: Quick access to dispatches scheduled for current date.
- **Delivery Details**: Doorstep delivery instructions, recipient contact info, and consignment notes.
- **Update Delivery Status**: Strict state machine transition workflow (`ASSIGNED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` or `FAILED`), mandatory failure reason entry, location logging, and confirmation dialogs.
- **Delivery History & Profile**: Performance statistics (success rate %) and courier credentials.

### 4. Administrator Portal (`/admin/*`)
- **Admin Command Center**: Executive KPI cards, weekly volume trends bar charts, status distribution donut charts, and recent dispatches.
- **Customer Management**: Customer registry, booking counts, details modal, and account deactivation/activation toggles.
- **Employee & Fleet Management**: Postal courier roster, depot station assignment, route load tracking, and "Provision New Courier" modal.
- **Parcel Management**: Global parcel directory with search, status filters, and unassigned consignment isolation.
- **Delivery Assignment Center**: Allocate unassigned packages to active couriers based on depot hub and current route load.
- **Delivery Reassignment**: Reallocate failed or delayed deliveries to alternate active couriers.
- **Delivery Monitoring**: Real-time monitoring of all active and historical dispatches across all routes.
- **Complaint Management**: Customer ticket investigation, status updates, and posting administrative determination notes.
- **Reports & Analytics**: Volume growth charts, weekly dispatch inflow/outflow, and printable summary based on live database aggregations.

---

## 🎨 Design System

- **Primary Red**: `#D71920`
- **Deep Red**: `#A80F17`
- **Charcoal / Dark Surface**: `#1C1C1C`
- **Black**: `#111111`
- **Light Background**: `#F5F5F5`
- **Typography**: Clean sans-serif (`Inter`)
- **Responsive Layout**: Designed for mobile smartphones, tablets, laptops, and ultra-wide desktops.

---

## 📦 Tech Stack

- **Frontend Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios (Centralized instance with JWT Bearer interceptor)
- **State & Context**: Context API (`AuthContext`, `ToastContext`)
- **Icons & Visuals**: Lucide React + Recharts
- **Backend Framework**: Express.js 5 + Node.js
- **Database**: Supabase PostgreSQL (server-only service-role access with RLS) and a local JSON mode when Supabase credentials are not configured
- **Security**: JWT Authentication + bcryptjs password hashing + Role-Based Access Control (RBAC)

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24 recommended)
- **npm**: v9.0.0 or higher

### 2. Configure Backend Environment
Configure `backend/.env`. `SUPABASE_SERVICE_ROLE_KEY` is a server-only secret; never put it in a `VITE_*` variable or frontend file.
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Generate `JWT_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Run `backend/supabase_schema.sql` in the Supabase SQL Editor before starting the API. When Supabase credentials are configured, the API loads application data from Supabase at startup and fails visibly if the connection/schema is unavailable. Without Supabase credentials, it uses `backend/data/store.json` in local-only mode; writes in this mode are not synchronized to Supabase.

### 3. Start Backend Server
```bash
cd backend
npm run dev
```
The API server will listen at `http://localhost:5000`.

### 4. Configure Frontend Environment
In the root directory, configure `.env`:
```env
VITE_API_BASE_URL=/api
VITE_USE_MOCK_API=false
```

### 5. Start Frontend Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Run Backend Tests
```bash
cd backend
npm test
```
`npm run test:api` is an integration suite that requires the API server to be running. It creates and updates test records, so run it only against an isolated local data file and never against a production Supabase project.

---

## 🔑 Demo Login Accounts

Pre-seeded accounts are provided for immediate testing and presentation:

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Administrator** | `admin@postoffice.gov` | `DigiPostAdmin@2026` | Root administrator (`/admin/*`) |
| **Postal Employee** | `employee@postoffice.gov` | `DigiPostCourier@2026` | Central Hub 01 Courier (`/employee/*`) |
| **Customer** | `sarah.customer@gmail.com` | `customer123` | Active customer with consignments (`/customer/*`) |

> *Tip: Select the matching role on the Login page; the demo email and password will be filled in automatically.*

For an existing Supabase project, run `backend/reset_standard_demo_credentials.sql` once in the Supabase SQL Editor to reset the administrator and employee passwords. The updated credentials are also applied when the standard demo users are seeded by `backend/supabase_schema.sql`.

### India-focused Supabase demo data (optional)

After running `backend/supabase_schema.sql`, you can add fictional Indian postal records without deleting existing data by running `backend/supabase_india_demo_seed.sql` in Supabase SQL Editor. The seed is safe to rerun; demo account records are refreshed and parcel/complaint/delivery rows are inserted only once.

All India demo accounts use `IndiaDemo@2026`:

| Role | Email |
|---|---|
| Administrator | `admin.demo@digipost.in` |
| Courier | `courier.mumbai@digipost.in` |
| Courier | `courier.delhi@digipost.in` |
| Courier | `courier.bengaluru@digipost.in` |
| Customer | `asha.sharma@example.com` |
| Customer | `rohan.mehta@example.com` |
| Customer | `priya.iyer@example.com` |
| Customer | `arjun.verma@example.com` |

The data is synthetic and for local/classroom demonstrations only. Do not use the demo credentials in a deployed environment. App-postage amounts are project estimates for testing, not official India Post tariffs.

Use the Asha customer account for the following booking examples (the form's default sender is in Mumbai). Use the same synthetic recipient phone, `+91 90000 00022`, or another fictitious 10-digit Indian mobile number:

| Recipient city and PIN | Parcel type | Weight | Description |
|---|---|---:|---|
| Pune, Maharashtra `411045` | Standard | `1.2 kg` | Books and stationery |
| Bengaluru, Karnataka `560038` | Express | `0.5 kg` | Signed university documents |
| Chennai, Tamil Nadu `600020` | Fragile | `1.8 kg` | Carefully packed ceramic gifts |
| Hyderabad, Telangana `500029` | Heavy | `8.0 kg` | Packaged household supplies |

Use complete street/locality, city, state, six-digit PIN code, recipient name, and an optional email such as `recipient@example.com`. These charges are application estimates for testing, not official India Post tariffs.

---

---

## 📄 Documentation Deliverables

* [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) — Comprehensive feature matrix, gap audit, and security review.
* [`API_INVENTORY.md`](./API_INVENTORY.md) — Complete REST API contract, request/response schemas, and role permissions.
* [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — Prioritized implementation roadmap and progress log.
* [`TESTING_REPORT.md`](./TESTING_REPORT.md) — Test suite results, verification reports, and resolution logs.
