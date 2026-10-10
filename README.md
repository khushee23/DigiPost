# Post Office Automation System — Frontend

A complete, responsive, and modern postal services frontend built for a third-year Software Engineering group project. Developed using **React, Vite, Tailwind CSS, React Router, Axios, and Context API**, featuring a **Red and Black** visual identity.

---

## 🚀 Features & Role-Based Portals

The application implements three dedicated, role-specific experiences with complete client-side route guards and realistic state persistence:

### 1. Public Portal
- **Landing Page**: Postal services hero section, quick tracking lookup box, service feature cards, "How It Works" 4-step workflow, and role demonstration quick-access.
- **Sign In & Register**: Clean authentication interface with show/hide password, field validation, and 1-click role demo shortcuts.
- **Public Parcel Tracking**: Real-time multi-step tracking progress timeline and event logs with complete privacy protection (never exposes private phone numbers, passwords, or personal details).

### 2. Customer Portal (`/customer/*`)
- **Customer Dashboard**: Overview KPI cards (Total Consignments, Pending, In Transit, Delivered), status breakdown donut chart, recent bookings table, and quick actions.
- **Book a Parcel**: Sender, recipient, and consignment specifications forms with live postage rate calculation, delivery window estimation, and instant tracking ID generation modal.
- **My Parcels**: Responsive table/card consignment history with search, status filters, and pagination.
- **Parcel Details & Tracking**: Comprehensive milestone tracking timeline, sender/recipient records, courier info, and fast links to file complaints or submit reviews.
- **Complaints & Support**: Submit support tickets linked to booked parcels and track administrative resolution notes.
- **Feedback & Reviews**: 5-star ratings and written reviews on delivered packages.
- **Customer Notifications & Profile**: Contact information updates and secure password change.

### 3. Postal Courier / Employee Portal (`/employee/*`)
- **Employee Dashboard**: Route KPIs (Assigned, In Transit, Delivered, Failed Attempts) and today's active delivery queue.
- **My Assigned Deliveries**: Filterable manifest of dispatches allocated to the courier.
- **Delivery Details**: Doorstep delivery instructions, recipient contact info, and consignment notes.
- **Update Delivery Status**: Strict state machine transition workflow (`PENDING` → `ASSIGNED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` or `FAILED`), mandatory failure reason entry, location logging, and confirmation dialogs.
- **Delivery History & Profile**: Performance statistics (success rate %) and courier credentials.

### 4. Administrator Portal (`/admin/*`)
- **Admin Command Center**: Executive KPI cards, weekly volume trends bar charts, status distribution donut charts, and recent dispatches.
- **Customer Management**: Customer registry, booking counts, details modal, and account deactivation/activation toggles.
- **Employee & Fleet Management**: Postal courier roaster, depot station assignment, route load tracking, and "Provision New Courier" modal.
- **Parcel Management**: Global parcel directory with search, status filters, and unassigned consignment isolation.
- **Delivery Assignment Center**: Allocate unassigned packages to active couriers based on depot hub and current route load.
- **Delivery Monitoring**: Real-time monitoring of all active and historical dispatches across all routes.
- **Complaint Management**: Customer ticket investigation, status updates, and posting administrative determination notes.
- **Reports & Analytics**: 6-month revenue & volume growth area charts, weekly dispatch inflow/outflow, and printable summary.

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

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Navigation**: React Router v7
- **HTTP Client**: Axios (Centralized instance with JWT Bearer interceptor)
- **State & Context**: Context API (`AuthContext`, `ToastContext`)
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Data Simulation & Persistence**: `localStorage` mock engine with seamless toggle to live backend APIs.

---

## 🛠️ Getting Started

### 1. Installation
Navigate into the frontend project directory and install dependencies:
```bash
cd post-office-frontend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_API=true
```
- When `VITE_USE_MOCK_API=true`, the application runs with full local data persistence—allowing all features, forms, and workflows to be evaluated immediately without requiring the backend server to be running.
- When `VITE_USE_MOCK_API=false`, all requests route to your live Node.js/Express backend at `VITE_API_BASE_URL`.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Login Accounts

Pre-seeded accounts are provided with realistic tracking histories for immediate evaluation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@postoffice.gov` | `admin123` | Root postal administrator (Full access) |
| **Postal Employee** | `employee@postoffice.gov`<br>*(or `john.carrier@postoffice.gov`)* | `employee123` | Courier at Central Hub 01 (`/employee/*`) |
| **Customer** | `sarah.customer@gmail.com` | `customer123` | Active customer with booked parcels |

> *Tip: The Login page features 1-click demo filler buttons for instant role switching during presentations.*

---

## 📄 Backend Integration

Refer to [`BACKEND_API_CONTRACT.md`](./BACKEND_API_CONTRACT.md) for the exact REST API schema specifications and endpoints required when connecting to the Express/MongoDB backend.
