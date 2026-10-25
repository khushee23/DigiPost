# Post Office Automation System — Complete REST API Inventory & Specification

**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** HTTP Bearer Token (`Authorization: Bearer <jwt_token>`) or `jwt` HTTP Cookie  
**Standard Response Envelope:**
```json
{
  "success": true,
  "message": "Optional human-readable description",
  "data": {}
}
```
**Standard Error Envelope:**
```json
{
  "success": false,
  "message": "Specific error description",
  "error": "Optional error details"
}
```

---

## 1. Authentication & Session Endpoints (`/api/auth`)

### 1.1 Register Customer
* **HTTP Method:** `POST`
* **Path:** `/api/auth/register`
* **Purpose:** Public self-service registration for new customers.
* **Authentication:** Public (No token required)
* **Required Role:** None. Role is strictly assigned as `customer` on the server.
* **Request Body:**
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.customer@gmail.com",
  "password": "customer123",
  "phone": "+1 (555) 912-3456",
  "address": "742 Evergreen Terrace, Springfield, IL 62704"
}
```
* **Validation Rules:**
  - `name`: String, non-empty, required
  - `email`: Valid email format, required, case-insensitive unique
  - `password`: String, min 6 characters, required
  - `role`: Ignored from payload; server enforces `customer`
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "0e95f061-97d0-47d8-9e20-60f3eda7f127",
    "name": "Sarah Jenkins",
    "email": "sarah.customer@gmail.com",
    "phone": "+1 (555) 912-3456",
    "address": "742 Evergreen Terrace, Springfield, IL 62704",
    "role": "customer",
    "status": "active"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Missing mandatory fields (`name`, `email`, `password`)
  - `409 Conflict`: An account with this email already exists

---

### 1.2 User Login
* **HTTP Method:** `POST`
* **Path:** `/api/auth/login`
* **Purpose:** Authenticate Customer, Employee, or Administrator.
* **Authentication:** Public
* **Required Role:** Any active registered role
* **Request Body:**
```json
{
  "email": "sarah.customer@gmail.com",
  "password": "customer123"
}
```
* **Validation Rules:**
  - `email`: String, required
  - `password`: String, required
* **Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "0e95f061-97d0-47d8-9e20-60f3eda7f127",
    "name": "Sarah Jenkins",
    "email": "sarah.customer@gmail.com",
    "role": "customer",
    "status": "active"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Email and password are required
  - `401 Unauthorized`: Invalid email or password
  - `403 Forbidden`: Account deactivated by administrator

---

### 1.3 Get Authenticated User Profile
* **HTTP Method:** `GET`
* **Path:** `/api/auth/me` (Alias: `/api/users/me`)
* **Purpose:** Retrieve current session user profile from Bearer token.
* **Authentication:** Protected (Bearer JWT)
* **Required Role:** `customer`, `employee`, `admin`
* **Request Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "0e95f061-97d0-47d8-9e20-60f3eda7f127",
    "name": "Sarah Jenkins",
    "email": "sarah.customer@gmail.com",
    "phone": "+1 (555) 912-3456",
    "address": "742 Evergreen Terrace, Springfield, IL 62704",
    "role": "customer",
    "status": "active"
  }
}
```
* **Error Responses:**
  - `401 Unauthorized`: Missing, expired, or invalid JWT

---

### 1.4 Update User Profile
* **HTTP Method:** `PUT` (or `PATCH`)
* **Path:** `/api/auth/profile` (Alias: `PATCH /api/users/me`)
* **Purpose:** Update profile details (`name`, `phone`, `address`).
* **Authentication:** Protected
* **Request Body:**
```json
{
  "name": "Sarah Jenkins",
  "phone": "+1 (555) 912-0000",
  "address": "Updated Address St, Springfield, IL"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 1.5 Change Password
* **HTTP Method:** `PUT`
* **Path:** `/api/auth/change-password`
* **Purpose:** Securely update user password with current password verification.
* **Authentication:** Protected
* **Request Body:**
```json
{
  "currentPassword": "customer123",
  "newPassword": "newCustomerPassword456"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```
* **Error Responses:**
  - `400 Bad Request`: Incorrect current password or new password too short

---

### 1.6 User Logout
* **HTTP Method:** `POST`
* **Path:** `/api/auth/logout`
* **Purpose:** Clear session cookie.
* **Authentication:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Parcel Endpoints (`/api/parcels`)

### 2.1 Book a Parcel
* **HTTP Method:** `POST`
* **Path:** `/api/parcels`
* **Purpose:** Create a new parcel consignment booking with auto-generated tracking ID.
* **Authentication:** Protected
* **Required Role:** `customer`, `admin`
* **Request Body:**
```json
{
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
    "address": "1725 Slough Ave",
    "city": "Scranton",
    "state": "PA",
    "postalCode": "18503",
    "email": "michael.scott@dunder.com"
  },
  "parcelType": "express",
  "weight": 2.5,
  "description": "Important business documents"
}
```
* **Validation Rules:**
  - `sender.name`, `sender.city`, `sender.state`: Required
  - `receiver.name`, `receiver.city`, `receiver.state`: Required
  - `weight`: Positive number
  - `parcelType`: One of `standard`, `express`, `document`, `fragile`, `heavy`
* **Success Response (201 Created):**
```json
{
  "success": true,
  "trackingId": "PO-84920184",
  "parcel": {
    "_id": "pcl_001",
    "trackingId": "PO-84920184",
    "status": "PENDING",
    "cost": 33.25,
    "bookingDate": "2026-10-18T10:00:00.000Z",
    "expectedDeliveryDate": "2026-10-20T17:00:00.000Z",
    "history": [ ... ]
  }
}
```

---

### 2.2 Customer's Parcel Bookings
* **HTTP Method:** `GET`
* **Path:** `/api/parcels/my-parcels` (Alias: `/api/parcels/my`)
* **Purpose:** Retrieve consignments booked by the authenticated customer.
* **Authentication:** Protected
* **Required Role:** `customer` (or `admin`)
* **Query Parameters:**
  - `status`: Optional filter (`PENDING`, `ASSIGNED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `FAILED`)
  - `search`: Search query matching tracking ID, receiver, or destination
* **Ownership Rule:** If caller is `customer`, results are strictly constrained to `req.user.id`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "parcels": [ ... ],
  "total": 5
}
```

---

### 2.3 Cancel a Parcel Booking
* **HTTP Method:** `PATCH`
* **Path:** `/api/parcels/:id/cancel`
* **Purpose:** Cancel a parcel booking if still in `PENDING` state.
* **Authentication:** Protected
* **Required Role:** `customer` (owner) or `admin`
* **Validation Rules:**
  - Parcel must exist.
  - Parcel `status` must be strictly `PENDING`. If already `ASSIGNED`, `IN_TRANSIT`, etc., returns 400.
  - If caller is `customer`, they must own the parcel.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Parcel booking cancelled successfully",
  "parcel": {
    "_id": "pcl_001",
    "status": "CANCELLED",
    "history": [ ... ]
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Parcel is already in transit or delivered and cannot be cancelled
  - `403 Forbidden`: You are not authorized to cancel this parcel
  - `404 Not Found`: Parcel not found

---

### 2.4 Public Parcel Tracking
* **HTTP Method:** `GET`
* **Path:** `/api/tracking/:trackingId` (Alias: `/api/parcels/track/:trackingId`)
* **Purpose:** Safe public lookup of consignment delivery milestones.
* **Authentication:** Public
* **Privacy Protections:** Strips private sender/recipient street addresses, phone numbers, and emails. Returns origin/destination cities, timestamps, status, and milestone events.
* **Success Response (200 OK):**
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
    "bookingDate": "2026-10-18T09:15:00.000Z",
    "expectedDeliveryDate": "2026-10-20T17:00:00.000Z",
    "deliveredDate": null,
    "history": [
      {
        "status": "PENDING",
        "timestamp": "2026-10-18T09:15:00.000Z",
        "location": "Springfield Origin Facility",
        "note": "Parcel booked online."
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "timestamp": "2026-10-18T14:30:00.000Z",
        "location": "Scranton Delivery Hub",
        "note": "Out with courier for delivery."
      }
    ]
  }
}
```

---

### 2.5 Parcel Details by ID
* **HTTP Method:** `GET`
* **Path:** `/api/parcels/:id`
* **Purpose:** Full detail view for customer owner, assigned employee, or admin.
* **Authentication:** Protected
* **Success Response (200 OK):**
```json
{
  "success": true,
  "parcel": { ... }
}
```

---

### 2.6 All Parcels Directory (Admin)
* **HTTP Method:** `GET`
* **Path:** `/api/parcels`
* **Purpose:** Global searchable consignment directory for administrators.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Query Parameters:** `status`, `unassignedOnly=true`, `search`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "parcels": [ ... ],
  "total": 45
}
```

---

### 2.7 Assign Parcel to Employee (Admin)
* **HTTP Method:** `POST`
* **Path:** `/api/parcels/:parcelId/assign`
* **Purpose:** Allocate unassigned package to active courier.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Request Body:**
```json
{
  "employeeId": "d8b05dfc-94ee-4d7f-a082-4a1371d1c9b2"
}
```
* **Validation Rules:**
  - `employeeId` must belong to an active user with role `employee`.
  - Parcel transitions to `ASSIGNED`.
  - Delivery dispatch record created.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Parcel assigned successfully",
  "parcel": { ... }
}
```

---

## 3. Delivery Operations Endpoints (`/api/deliveries`)

### 3.1 Employee Assigned Deliveries
* **HTTP Method:** `GET`
* **Path:** `/api/deliveries/my-deliveries` (Alias: `/api/deliveries/my`)
* **Purpose:** Courier manifest of assigned packages.
* **Authentication:** Protected
* **Required Role:** `employee`, `admin`
* **Ownership Rule:** Couriers can only retrieve dispatches allocated to their ID.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "deliveries": [
    {
      "_id": "del_101",
      "deliveryId": "DEL-48291",
      "parcelId": "pcl_001",
      "assignedEmployeeId": "d8b05dfc-94ee-4d7f-a082-4a1371d1c9b2",
      "status": "ASSIGNED",
      "parcel": { ... }
    }
  ],
  "total": 1
}
```

---

### 3.2 Deliveries Scheduled for Today
* **HTTP Method:** `GET`
* **Path:** `/api/deliveries/today`
* **Purpose:** Quick access queue of today's delivery assignments.
* **Authentication:** Protected
* **Required Role:** `employee`, `admin`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "deliveries": [ ... ],
  "total": 3
}
```

---

### 3.3 Update Delivery Status (Courier Workflow)
* **HTTP Method:** `PATCH`
* **Path:** `/api/deliveries/:id/status`
* **Purpose:** Update status through strict legal state machine transitions.
* **Authentication:** Protected
* **Required Role:** Assigned `employee` or `admin`
* **Request Body:**
```json
{
  "status": "DELIVERED",
  "location": "Front Porch, 1725 Slough Ave",
  "note": "Signed by recipient Michael Scott",
  "failureReason": null
}
```
* **State Machine Rules:**
  - `ASSIGNED` -> `IN_TRANSIT` | `FAILED`
  - `IN_TRANSIT` -> `OUT_FOR_DELIVERY` | `FAILED`
  - `OUT_FOR_DELIVERY` -> `DELIVERED` | `FAILED`
  - `DELIVERED`: Terminal state, cannot transition further.
  - If `status === 'FAILED'`, `failureReason` is strictly mandatory.
  - Couriers cannot update deliveries assigned to another employee.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Delivery status updated to DELIVERED successfully",
  "delivery": { ... }
}
```

---

### 3.4 Reassign Delivery (Admin)
* **HTTP Method:** `PATCH`
* **Path:** `/api/deliveries/:id/reassign`
* **Purpose:** Reassign an active or failed delivery to an alternate active courier.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Request Body:**
```json
{
  "employeeId": "d8b05dfc-94ee-4d7f-a082-4a1371d1c9b2"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Delivery reassigned successfully",
  "delivery": { ... }
}
```

---

### 3.5 Global Delivery Monitoring (Admin)
* **HTTP Method:** `GET`
* **Path:** `/api/deliveries`
* **Purpose:** Overview of all delivery records across all employees.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Query Parameters:** `status`, `search`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "deliveries": [ ... ],
  "total": 12
}
```

---

## 4. Complaint Management Endpoints (`/api/complaints`)

### 4.1 Submit Complaint
* **HTTP Method:** `POST`
* **Path:** `/api/complaints`
* **Purpose:** Customer submits support ticket linked to parcel consignment.
* **Authentication:** Protected
* **Required Role:** `customer`
* **Request Body:**
```json
{
  "trackingId": "PO-84920184",
  "category": "delayed_delivery",
  "subject": "Delayed parcel delivery notice",
  "description": "Parcel was scheduled yesterday but has not arrived."
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "_id": "cmp_001",
    "complaintId": "CMP-8219",
    "status": "OPEN",
    "createdAt": "2026-10-18T12:00:00.000Z"
  }
}
```

---

### 4.2 Customer's Complaints
* **HTTP Method:** `GET`
* **Path:** `/api/complaints/my-complaints` (Alias: `/api/complaints/my`)
* **Purpose:** View ticket history for the authenticated customer.
* **Authentication:** Protected
* **Ownership Rule:** Constrained strictly to `req.user.id`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "complaints": [ ... ],
  "total": 2
}
```

---

### 4.3 All Complaints Directory (Admin)
* **HTTP Method:** `GET`
* **Path:** `/api/complaints`
* **Purpose:** List all customer support tickets.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Query Parameters:** `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`), `search`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "complaints": [ ... ],
  "total": 8
}
```

---

### 4.4 Resolve / Update Complaint Status (Admin)
* **HTTP Method:** `PATCH`
* **Path:** `/api/complaints/:id/status` (Alias: `/api/complaints/:id`)
* **Purpose:** Update investigation status and post resolution determinations.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Supervisor investigated. Courier made delivery this morning."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "complaint": { ... }
}
```

---

## 5. In-App Notifications (`/api/notifications`)

### 5.1 Get User Notifications
* **HTTP Method:** `GET`
* **Path:** `/api/notifications`
* **Purpose:** List notifications for current authenticated user with unread count.
* **Authentication:** Protected
* **Ownership Rule:** Constrained strictly to `req.user.id`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notif_001",
      "title": "Parcel Booked Successfully",
      "message": "Your parcel PO-84920184 has been accepted into the postal network.",
      "isRead": false,
      "createdAt": "2026-10-18T10:00:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

---

### 5.2 Mark Single Notification Read
* **HTTP Method:** `PATCH`
* **Path:** `/api/notifications/:id/read`
* **Purpose:** Mark specific notification as read.
* **Authentication:** Protected
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 5.3 Mark All Notifications Read
* **HTTP Method:** `PATCH` (and `POST /api/notifications/mark-all-read`)
* **Path:** `/api/notifications/read-all`
* **Purpose:** Bulk mark all user notifications as read.
* **Authentication:** Protected
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 6. Feedback & Reviews (`/api/feedback` / `/api/reviews`)

### 6.1 Submit Delivery Review
* **HTTP Method:** `POST`
* **Path:** `/api/feedback` (Alias: `/api/reviews`)
* **Purpose:** Customer submits rating and review for delivered parcel.
* **Authentication:** Protected
* **Required Role:** `customer`
* **Request Body:**
```json
{
  "trackingId": "PO-84920184",
  "rating": 5,
  "feedback": "Prompt and careful doorstep delivery!"
}
```
* **Validation Rules:**
  - `rating`: Integer between 1 and 5
  - Consignment must be `DELIVERED`
  - Cannot submit duplicate review for the same tracking ID
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": { ... }
}
```

---

### 6.2 Get Review by Tracking ID
* **HTTP Method:** `GET`
* **Path:** `/api/feedback/:trackingId` (Alias: `/api/reviews/:trackingId`)
* **Purpose:** Retrieve existing review for a consignment.
* **Authentication:** Public / Authenticated
* **Success Response (200 OK):**
```json
{
  "success": true,
  "review": { ... }
}
```

---

### 6.3 Get All Reviews
* **HTTP Method:** `GET`
* **Path:** `/api/feedback` (Alias: `/api/reviews`)
* **Purpose:** List customer ratings and feedback.
* **Authentication:** Public / Authenticated
* **Success Response (200 OK):**
```json
{
  "success": true,
  "reviews": [ ... ]
}
```

---

## 7. Analytics & Reports (`/api/analytics`)

### 7.1 Executive Admin Dashboard Stats
* **HTTP Method:** `GET`
* **Path:** `/api/analytics/admin-summary` (Alias: `/api/analytics/dashboard`)
* **Purpose:** Key operational KPI metrics, charts, volume trends, and status distributions.
* **Authentication:** Protected
* **Required Role:** `admin`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalCustomers": 2,
    "totalEmployees": 2,
    "totalParcels": 5,
    "pendingDeliveries": 1,
    "inTransitDeliveries": 2,
    "completedDeliveries": 2,
    "failedDeliveries": 0,
    "totalRevenue": 142.50,
    "openComplaints": 1,
    "statusDistribution": [
      { "name": "Delivered", "value": 2, "color": "#16803C" },
      { "name": "In Transit", "value": 2, "color": "#6366F1" },
      { "name": "Pending", "value": 1, "color": "#D97706" },
      { "name": "Failed", "value": 0, "color": "#DC2626" }
    ],
    "weeklyVolume": [ ... ],
    "monthlyVolume": [ ... ]
  }
}
```

---

### 7.2 Customer Dashboard Stats
* **HTTP Method:** `GET`
* **Path:** `/api/analytics/customer-summary`
* **Purpose:** Metrics for authenticated customer's consignments and tickets.
* **Authentication:** Protected
* **Required Role:** `customer`, `admin`
* **Ownership Rule:** Constrained to `req.user.id`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalParcels": 3,
    "pendingDeliveries": 1,
    "inTransitDeliveries": 1,
    "completedDeliveries": 1,
    "failedDeliveries": 0,
    "activeComplaints": 0,
    "statusDistribution": [ ... ]
  }
}
```

---

### 7.3 Employee Dashboard Stats
* **HTTP Method:** `GET`
* **Path:** `/api/analytics/employee-summary`
* **Purpose:** Route metrics for assigned courier.
* **Authentication:** Protected
* **Required Role:** `employee`, `admin`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "assignedDeliveries": 4,
    "activeDeliveries": 2,
    "completedDeliveries": 2,
    "failedDeliveries": 0
  }
}
```

---

## 8. Fleet & User Management (`/api/admin` & `/api/users`)

### 8.1 List Registered Customers
* **HTTP Method:** `GET`
* **Path:** `/api/admin/customers`
* **Authentication:** Protected
* **Required Role:** `admin`

### 8.2 Toggle Customer Account Status
* **HTTP Method:** `PATCH`
* **Path:** `/api/admin/customers/:id/status` (Alias: `PATCH /api/users/:id/status`)
* **Authentication:** Protected
* **Required Role:** `admin`

### 8.3 List Employees / Couriers
* **HTTP Method:** `GET`
* **Path:** `/api/admin/employees`
* **Authentication:** Protected
* **Required Role:** `admin`

### 8.4 Provision New Courier
* **HTTP Method:** `POST`
* **Path:** `/api/admin/employees`
* **Authentication:** Protected
* **Required Role:** `admin`
* **Request Body:**
```json
{
  "name": "Alex Carter",
  "email": "alex.carter@postoffice.gov",
  "phone": "+1 (555) 789-0123",
  "station": "North Metro Sorting Station",
  "password": "courierPassword123"
}
```

### 8.5 Toggle Employee Status
* **HTTP Method:** `PATCH`
* **Path:** `/api/admin/employees/:id/status`
* **Authentication:** Protected
* **Required Role:** `admin`
