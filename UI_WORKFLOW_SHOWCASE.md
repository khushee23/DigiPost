# DigiPost — Comprehensive UI Workflow & Dashboard Showcase

This document catalogs every UI feature and role-based dashboard implemented in **DigiPost (Post Office Automation System)**, presented in the exact chronological sequence of the real-world postal logistics workflow.

All full-resolution images are located locally in the [`./screenshots/`](./screenshots/) directory.

---

## 🧭 Workflow Architecture Overview

```mermaid
graph TD
    subgraph Phase 1: Public & Authentication
        A[01. Landing Page] --> B[02. Public Tracking]
        A --> C[03. Unified Sign In]
        A --> D[04. Customer Registration]
    end

    subgraph Phase 2: Customer Consignment Lifecycle
        C --> E[05. Customer Dashboard]
        E --> F[06 & 07. Book Parcel & Live Calculation]
        F --> G[08. My Parcels Directory]
        G --> H[09. Milestone Tracking Timeline]
        H --> I[10. Customer Complaints]
        H --> J[11. Service Feedback & Rating]
        E --> K[12. In-App Notifications]
        E --> L[13. Profile & Settings]
    end

    subgraph Phase 4: Administrator Command & Governance
        C --> M[21. Admin Command Center]
        M --> N[22. Global Parcel Directory]
        N --> O[23. Delivery Assignment Center]
        O --> P[24. Real-Time Fleet Monitoring]
        M --> Q[25. Courier Fleet Management]
        M --> R[26. Customer Registry]
        M --> S[27. Complaint Resolution Desk]
        M --> T[28. Operations Reports & Analytics]
        M --> U[29. Administrator Profile]
    end

    subgraph Phase 3: Postal Courier Field Operations
        O -.-> V[14. Courier Duty Desk]
        V --> W[15. Assigned Route Manifest]
        W --> X[16. Delivery Doorstep Details]
        X --> Y[17. Status Progression & Checkpoints]
        Y --> Z[18. Delivery History & Stats]
        V --> AA[19. Courier Notifications]
        V --> AB[20. Courier Profile & Hub]
    end
```

---

## Phase 1: Public Portal & Onboarding Workflow

### 1. Public Landing Page
The landing page introduces users to DigiPost services, featuring a quick parcel tracking lookup, dynamic service capability cards, and a 4-step workflow overview.

![01. Public Landing Page](./screenshots/01_landing_page.png)

### 2. Privacy-Safe Public Parcel Tracking
Enables recipients and customers to check live dispatch progress without logging in, strictly masking private phone numbers and street addresses while presenting regional hub milestones.

![02. Public Parcel Tracking](./screenshots/02_public_tracking.png)

### 3. Unified Authentication & Role Demonstration Switcher
Secure JWT login with preset role selectors (`Customer`, `Postal Employee / Courier`, `Administrator`) and 1-click credential autofill buttons for evaluation.

![03. Unified Sign In](./screenshots/03_login_page.png)

### 4. Customer Onboarding & Registration
New customer account registration with client-side field validation, phone formatting, and automatic security role sandboxing.

![04. Customer Registration](./screenshots/04_register_page.png)

---

## Phase 2: Customer Consignment & Self-Service Lifecycle

### 5. Customer Dashboard & KPI Overview
The customer command view displays real-time package metrics (Total Consignments, Pending, In Transit, Delivered), shipment breakdown donut charts, quick booking shortcuts, and recent consignments.

![05. Customer Dashboard](./screenshots/05_customer_dashboard.png)

### 6. Parcel Booking Form
Sender information, recipient delivery address, category selection (Standard, Express, Fragile, Registered), weight inputs, and live rate calculation.

![06. Parcel Booking Form](./screenshots/06_customer_book_parcel.png)

### 7. Real-Time Rate & Delivery Estimation
Dynamic cost engine automatically updates postage pricing ($14.50+), computes delivery windows (3-5 days), and renders a booking confirmation summary.

![07. Parcel Booking Calculated](./screenshots/07_customer_book_parcel_calculated.png)

### 8. My Parcels Directory & Status Filters
Consignment directory supporting search queries, status tabs (`All`, `Pending`, `In Transit`, `Delivered`, `Failed`), and self-service cancellation for pre-dispatch bookings.

![08. My Parcels Directory](./screenshots/08_customer_my_parcels.png)

### 9. Detailed Consignment Tracking & Milestones
Interactive 5-stage milestone timeline (`Booking Created` → `Assigned` → `In Transit` → `Out for Delivery` → `Delivered`), chronological event log, sender/receiver details, and assigned courier card.

![09. Parcel Tracking Details](./screenshots/09_customer_parcel_tracking_details.png)

### 10. Customer Support & Complaints Desk
Enables customers to raise grievance tickets directly linked to tracking numbers (e.g., delays, damaged packaging) and track administrative determination notes.

![10. Customer Complaints](./screenshots/10_customer_complaints.png)

### 11. Customer Feedback & 5-Star Ratings
Rating and review submission interface for delivered packages to assess postal courier handling and delivery promptness.

![11. Customer Feedback](./screenshots/11_customer_feedback.png)

### 12. Customer In-App Notification Center
Real-time notification feed tracking dispatch assignments, status checkpoints, delivery receipts, and administrative responses.

![12. Customer Notifications](./screenshots/12_customer_notifications.png)

### 13. Customer Account Profile & Security
Profile management for updating residential contact addresses, contact phone numbers, and modifying account credentials.

![13. Customer Profile](./screenshots/13_customer_profile.png)

---

## Phase 3: Postal Courier / Field Operations Lifecycle

### 14. Courier Duty Desk & Operational Dashboard
Field terminal for couriers displaying route assignment volume, active deliveries, doorstep completions, and route failure alerts.

![14. Courier Dashboard](./screenshots/14_employee_dashboard.png)

### 15. Assigned Route Manifest
Filterable manifest strictly isolating dispatches allocated to the active courier, showing delivery addresses, recipient phone numbers, and current status.

![15. Assigned Deliveries](./screenshots/15_employee_assigned_deliveries.png)

### 16. Doorstep Delivery Details & Consignment Notes
Dedicated delivery manifest view with doorstep instructions, sender/receiver details, consignment notes, and quick action buttons.

![16. Delivery Details](./screenshots/16_employee_delivery_details.png)

### 17. Delivery State Machine Status Progression
Strict transition state machine (`ASSIGNED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` or `FAILED`), location logging, and mandatory failure remarks.

![17. Status Update](./screenshots/17_employee_status_update.png)

### 18. Courier Delivery History & Performance Statistics
Archived record of all historical dispatches completed by the courier, along with verified delivery timestamps and overall completion success rate.

![18. Delivery History](./screenshots/18_employee_delivery_history.png)

### 19. Courier Dispatch & Assignment Notifications
Direct operational alerts notifying couriers of newly allocated packages, priority dispatches, and route schedule changes.

![19. Employee Notifications](./screenshots/19_employee_notifications.png)

### 20. Courier Profile & Hub Credentials
Courier operational profile detailing assigned sorting station (`Central Sorting Hub 01`), fleet employee ID, and contact credentials.

![20. Employee Profile](./screenshots/20_employee_profile.png)

---

## Phase 4: Administrator Operations Command & Governance

### 21. Operations Command Center & Executive Dashboard
Executive command center aggregating top-line KPIs (Total Registered Parcels, Pending Dispatch, Doorsteps Delivered, Freight Revenue), weekly volume trends, and status distribution charts.

![21. Admin Command Center](./screenshots/21_admin_command_center.png)

### 22. Global Parcel Management Directory
Centralized repository of all system consignments, providing full search, status filtering, and isolated view of unallocated packages.

![22. Admin Parcel Directory](./screenshots/22_admin_parcel_management.png)

### 23. Courier Delivery Assignment Center
Interactive dispatch terminal allowing administrators to allocate awaiting packages to verified couriers based on depot hub and current route load.

![23. Delivery Assignment Center](./screenshots/23_admin_delivery_assignment.png)

### 24. Real-Time Fleet & Route Monitoring
Live monitoring board providing real-time visibility across all courier routes, sorting depots, and package delivery statuses.

![24. Delivery Fleet Monitoring](./screenshots/24_admin_delivery_monitoring.png)

### 25. Courier Fleet & Roster Management
Postal employee roster managing field couriers, assigned sorting hubs, active package loads, and provisioning of new courier accounts.

![25. Employee Fleet Management](./screenshots/25_admin_employee_fleet_management.png)

### 26. Customer Registry & Account Controls
Registered customer registry displaying booking history, account creation dates, and administrative status controls.

![26. Customer Management](./screenshots/26_admin_customer_management.png)

### 27. Complaint Resolution & Investigation Desk
Customer grievance management terminal for investigating support tickets, updating resolution status, and publishing official administrative findings.

![27. Complaint Resolution Desk](./screenshots/27_admin_complaint_resolution.png)

### 28. Postal Reports & Operations Analytics
Financial and throughput analytics with 6-month volume trajectories, weekly inflow vs. outflow charts, courier route load distribution, and printable executive summaries.

![28. Reports & Analytics](./screenshots/28_admin_reports_analytics.png)

### 29. Administrator Profile & Security Settings
Command-level credential management, headquarters assignment, and session security settings.

![29. Admin Profile](./screenshots/29_admin_profile.png)
