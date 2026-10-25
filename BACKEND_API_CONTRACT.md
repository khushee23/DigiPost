# Post Office Automation System — Backend API Specification & Contract

This document describes the API contract between the React frontend and the Node.js / Express backend. Supabase PostgreSQL is the configured database; the backend may use its local JSON store only when Supabase credentials are absent.

---

## 1. Authentication & User Endpoints (`/api/auth`)

### `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.customer@gmail.com",
  "phone": "+1 (555) 912-3456",
  "address": "742 Evergreen Terrace, Springfield, IL 62704",
  "password": "customerPassword123"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "_id": "65f012...",
    "name": "Sarah Jenkins",
    "email": "sarah.customer@gmail.com",
    "phone": "+1 (555) 912-3456",
    "address": "742 Evergreen Terrace, Springfield, IL 62704",
    "role": "customer",
    "status": "active",
    "createdAt": "2026-10-10T08:00:00.000Z"
  }
}
```

### `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "admin@postoffice.gov",
  "password": "adminPassword123"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "_id": "65f001...",
    "name": "Victoria Stirling",
    "email": "admin@postoffice.gov",
    "role": "admin",
    "station": "Headquarters - Central Command",
    "status": "active"
  }
}
```

### `GET /api/auth/me`
* **Access**: Protected (Bearer Token)
* **Response (200 OK)**:
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "role": "..." }
}
```

### `PUT /api/auth/profile`
* **Access**: Protected
* **Request Body**: `{ "name": "...", "phone": "...", "address": "..." }`

### `PUT /api/auth/change-password`
* **Access**: Protected
* **Request Body**: `{ "currentPassword": "...", "newPassword": "..." }`

---

## 2. Parcel Endpoints (`/api/parcels`)

### `POST /api/parcels`
* **Access**: Customer / Admin
* **Request Body**:
```json
{
  "customerId": "usr_cust_1",
  "sender": {
    "name": "Sarah Jenkins",
    "phone": "+1 (555) 912-3456",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62704",
    "email": "sarah.customer@gmail.com"
  },
  "receiver": {
    "name": "Michael Scott",
    "phone": "+1 (555) 349-2049",
    "address": "1725 Slough Ave, Suite 200",
    "city": "Scranton",
    "state": "PA",
    "postalCode": "18503",
    "email": "michael.scott@dunder.com"
  },
  "parcelType": "express",
  "weight": 2.5,
  "description": "Confidential contracts"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "trackingId": "PO-84920184",
  "parcel": {
    "_id": "65f201...",
    "trackingId": "PO-84920184",
    "status": "PENDING",
    "cost": 33.25,
    "bookingDate": "2026-10-10T10:00:00.000Z",
    "expectedDeliveryDate": "2026-10-12T17:00:00.000Z"
  }
}
```

### `GET /api/parcels/my-parcels?customerId=...&status=...&search=...`
* **Access**: Customer
* **Response**: `{ "success": true, "parcels": [...], "total": 12 }`

### `GET /api/parcels?status=...&unassignedOnly=true&search=...`
* **Access**: Admin
* **Response**: `{ "success": true, "parcels": [...], "total": 45 }`

### `GET /api/parcels/:identifier` (by ID or trackingId)
* **Access**: Authenticated

### `POST /api/parcels/:parcelId/assign`
* **Access**: Admin
* **Request Body**: `{ "employeeId": "usr_emp_1" }`
* **Response**: Transitions parcel status to `ASSIGNED` and creates/links delivery record.

---

## 3. Public Tracking (`/api/tracking/:trackingId`)

### `GET /api/tracking/:trackingId`
* **Access**: Public
* **Privacy Safe Response**:
```json
{
  "success": true,
  "tracking": {
    "trackingId": "PO-84920184",
    "originCity": "Springfield, IL",
    "destinationCity": "Scranton, PA",
    "parcelType": "express",
    "weight": 2.5,
    "status": "OUT_FOR_DELIVERY",
    "bookingDate": "2026-10-06T09:15:00.000Z",
    "expectedDeliveryDate": "2026-10-10T17:00:00.000Z",
    "history": [
      {
        "status": "PENDING",
        "timestamp": "2026-10-06T09:15:00.000Z",
        "location": "Springfield Origin Branch",
        "note": "Manifest accepted into postal network."
      },
      {
        "status": "IN_TRANSIT",
        "timestamp": "2026-10-08T14:30:00.000Z",
        "location": "Regional Mid-East Transit Depot",
        "note": "Processed through sorting checkpoint."
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "timestamp": "2026-10-10T08:30:00.000Z",
        "location": "Scranton Local Delivery Hub",
        "note": "En route with courier."
      }
    ]
  }
}
```

---

## 4. Delivery Endpoints (`/api/deliveries`)

### `GET /api/deliveries/my-deliveries?employeeId=...&status=...`
* **Access**: Employee

### `GET /api/deliveries/:deliveryId`
* **Access**: Employee / Admin

### `PATCH /api/deliveries/:deliveryId/status`
* **Access**: Employee
* **Request Body**:
```json
{
  "status": "DELIVERED",
  "location": "Doorstep delivery, Scranton, PA",
  "note": "Signed by recipient Michael Scott",
  "failureReason": null
}
```
* **Allowed status transitions**:
  * `PENDING` → `ASSIGNED`
  * `ASSIGNED` → `IN_TRANSIT` or `FAILED`
  * `IN_TRANSIT` → `OUT_FOR_DELIVERY` or `FAILED`
  * `OUT_FOR_DELIVERY` → `DELIVERED` or `FAILED`

### `GET /api/deliveries?status=...&search=...`
* **Access**: Admin (Delivery Monitoring)

---

## 5. Complaints Endpoints (`/api/complaints`)

### `POST /api/complaints`
* **Access**: Customer
* **Request Body**:
```json
{
  "customerId": "usr_cust_1",
  "customerName": "Sarah Jenkins",
  "customerEmail": "sarah.customer@gmail.com",
  "trackingId": "PO-41029481",
  "category": "delayed_delivery",
  "subject": "Doorstep attempt failed notice",
  "description": "Was waiting at home all afternoon..."
}
```

### `GET /api/complaints/my-complaints?customerId=...`
* **Access**: Customer

### `GET /api/complaints?status=...&search=...`
* **Access**: Admin

### `PATCH /api/complaints/:complaintId/status`
* **Access**: Admin
* **Request Body**:
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Supervisor contacted courier. Re-attempt scheduled for Monday."
}
```

---

## 6. Feedback & Reviews (`/api/feedback`)

### `GET /api/feedback/:trackingId`
### `POST /api/feedback`
* **Request Body**:
```json
{
  "trackingId": "PO-98231019",
  "customerId": "usr_cust_1",
  "rating": 5,
  "feedback": "Arrived right on time and in great condition!"
}
```

---

## 7. Administrative Fleet Management (`/api/admin`)

* `GET /api/admin/customers`
* `PATCH /api/admin/customers/:id/status`
* `GET /api/admin/employees`
* `POST /api/admin/employees` (Provision new courier)
* `PATCH /api/admin/employees/:id/status`

---

## 8. Dashboard Analytics (`/api/analytics`)

* `GET /api/analytics/admin-summary`
* `GET /api/analytics/customer-summary?customerId=...`
* `GET /api/analytics/employee-summary?employeeId=...`

The admin summary derives its totals from stored users, parcels, and complaints. Its `weeklyVolume` covers the current Monday-to-Sunday week and counts deliveries on their recorded completion dates; `monthlyVolume` covers the current month and five preceding months, grouping parcel counts and estimated charges by booking date. Calendar-day grouping uses India Standard Time. `deliverySuccessRate` is delivered parcels divided by delivered plus failed parcels; it is not an on-time delivery measure.
