/**
 * Mock Data Engine with localStorage Persistence
 * Provides an out-of-the-box working data layer for testing, demonstration,
 * and frontend development while the backend team builds the Node.js/Express APIs.
 */

const STORAGE_KEYS = {
  USERS: 'poas_mock_users',
  PARCELS: 'poas_mock_parcels',
  DELIVERIES: 'poas_mock_deliveries',
  COMPLAINTS: 'poas_mock_complaints',
  REVIEWS: 'poas_mock_reviews',
  NOTIFICATIONS: 'poas_mock_notifications',
};

const SEED_USERS = [
  {
    _id: 'usr_admin_1',
    name: 'Victoria Stirling',
    email: 'admin@postoffice.gov',
    phone: '+1 (555) 019-2831',
    role: 'admin',
    station: 'Headquarters - Central Command',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    _id: 'usr_emp_1',
    name: 'John Carrier',
    email: 'employee@postoffice.gov',
    altEmail: 'john.carrier@postoffice.gov',
    phone: '+1 (555) 234-5678',
    role: 'employee',
    station: 'Central Sorting Hub 01',
    status: 'active',
    createdAt: '2026-02-15T09:30:00.000Z',
  },
  {
    _id: 'usr_emp_alias',
    name: 'John Carrier (Field Courier)',
    email: 'john.carrier@postoffice.gov',
    altEmail: 'employee@postoffice.gov',
    phone: '+1 (555) 234-5678',
    role: 'employee',
    station: 'Central Sorting Hub 01',
    status: 'active',
    createdAt: '2026-02-15T09:30:00.000Z',
  },
  {
    _id: 'usr_emp_2',
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@postoffice.gov',
    phone: '+1 (555) 876-5432',
    role: 'employee',
    station: 'West Metro Delivery Hub',
    status: 'active',
    createdAt: '2026-03-01T11:00:00.000Z',
  },
  {
    _id: 'usr_cust_1',
    name: 'Sarah Jenkins',
    email: 'sarah.customer@gmail.com',
    phone: '+1 (555) 912-3456',
    role: 'customer',
    address: '742 Evergreen Terrace, Springfield, IL 62704',
    status: 'active',
    createdAt: '2026-04-05T14:20:00.000Z',
  },
  {
    _id: 'usr_cust_2',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '+1 (555) 432-8765',
    role: 'customer',
    address: '10880 Wilshire Blvd, Los Angeles, CA 90024',
    status: 'active',
    createdAt: '2026-04-12T16:45:00.000Z',
  },
];

const SEED_PARCELS = [
  {
    _id: 'pcl_001',
    trackingId: 'PO-84920184',
    customerId: 'usr_cust_1',
    sender: {
      name: 'Sarah Jenkins',
      phone: '+1 (555) 912-3456',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      email: 'sarah.customer@gmail.com',
    },
    receiver: {
      name: 'Michael Scott',
      phone: '+1 (555) 349-2049',
      address: '1725 Slough Avenue, Suite 200',
      city: 'Scranton',
      state: 'PA',
      postalCode: '18503',
      email: 'michael.scott@dunder.com',
    },
    origin: 'Springfield, IL',
    destination: 'Scranton, PA',
    parcelType: 'express',
    weight: 2.5,
    description: 'Confidential business contracts and merchandise sample',
    cost: 32.50,
    status: 'OUT_FOR_DELIVERY',
    assignedTo: {
      _id: 'usr_emp_1',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'john.carrier@postoffice.gov',
    },
    bookingDate: '2026-10-06T09:15:00.000Z',
    expectedDeliveryDate: '2026-10-10T17:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-06T09:15:00.000Z',
        location: 'Springfield Post Office',
        note: 'Parcel booked and manifest accepted into system.',
        updatedBy: 'System',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-07T10:00:00.000Z',
        location: 'Central Sorting Hub 01',
        note: 'Assigned to delivery courier John Carrier.',
        updatedBy: 'Victoria Stirling (Admin)',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-08T14:30:00.000Z',
        location: 'Regional Transit Depot - Mid-East',
        note: 'Processed through transit checkpoint.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-10-10T08:30:00.000Z',
        location: 'Scranton Local Delivery Depot',
        note: 'Loaded into delivery vehicle for final destination.',
        updatedBy: 'John Carrier',
      },
    ],
  },
  {
    _id: 'pcl_002',
    trackingId: 'PO-98231019',
    customerId: 'usr_cust_1',
    sender: {
      name: 'Sarah Jenkins',
      phone: '+1 (555) 912-3456',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      email: 'sarah.customer@gmail.com',
    },
    receiver: {
      name: 'Emma Watson',
      phone: '+1 (555) 678-1234',
      address: '450 Lexington Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10017',
      email: 'emma.watson@gmail.com',
    },
    origin: 'Springfield, IL',
    destination: 'New York, NY',
    parcelType: 'standard',
    weight: 1.2,
    description: 'Gift box and birthday card',
    cost: 16.00,
    status: 'DELIVERED',
    assignedTo: {
      _id: 'usr_emp_1',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'john.carrier@postoffice.gov',
    },
    bookingDate: '2026-10-01T11:00:00.000Z',
    expectedDeliveryDate: '2026-10-05T15:00:00.000Z',
    deliveredDate: '2026-10-05T14:22:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-01T11:00:00.000Z',
        location: 'Springfield Post Office',
        note: 'Parcel booked online.',
        updatedBy: 'Sarah Jenkins',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-02T08:00:00.000Z',
        location: 'Central Sorting Hub 01',
        note: 'Assigned to John Carrier.',
        updatedBy: 'Admin',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-03T12:00:00.000Z',
        location: 'New York Hub Depot',
        note: 'Arrived at sorting facility.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-10-05T09:00:00.000Z',
        location: 'Manhattan Distribution Unit',
        note: 'Courier en route to address.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'DELIVERED',
        timestamp: '2026-10-05T14:22:00.000Z',
        location: '450 Lexington Ave, New York',
        note: 'Package signed and received by Emma Watson.',
        updatedBy: 'John Carrier',
      },
    ],
  },
  {
    _id: 'pcl_003',
    trackingId: 'PO-73829104',
    customerId: 'usr_cust_2',
    sender: {
      name: 'David Chen',
      phone: '+1 (555) 432-8765',
      address: '10880 Wilshire Blvd',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90024',
      email: 'david.chen@gmail.com',
    },
    receiver: {
      name: 'Robert Miller',
      phone: '+1 (555) 998-1122',
      address: '500 Howard Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      email: 'robert.miller@tech.org',
    },
    origin: 'Los Angeles, CA',
    destination: 'San Francisco, CA',
    parcelType: 'fragile',
    weight: 3.8,
    description: 'Precision electronic measuring equipment',
    cost: 48.00,
    status: 'IN_TRANSIT',
    assignedTo: {
      _id: 'usr_emp_2',
      name: 'Maria Gonzalez',
      phone: '+1 (555) 876-5432',
      email: 'maria.gonzalez@postoffice.gov',
    },
    bookingDate: '2026-10-07T14:30:00.000Z',
    expectedDeliveryDate: '2026-10-11T16:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-07T14:30:00.000Z',
        location: 'West LA Station',
        note: 'Parcel accepted with fragile label.',
        updatedBy: 'David Chen',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-08T09:00:00.000Z',
        location: 'West Metro Delivery Hub',
        note: 'Assigned to Maria Gonzalez.',
        updatedBy: 'Admin',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-09T11:00:00.000Z',
        location: 'Bay Area Sorting Facility',
        note: 'In transit via ground express.',
        updatedBy: 'Maria Gonzalez',
      },
    ],
  },
  {
    _id: 'pcl_004',
    trackingId: 'PO-51829372',
    customerId: 'usr_cust_1',
    sender: {
      name: 'Sarah Jenkins',
      phone: '+1 (555) 912-3456',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      email: 'sarah.customer@gmail.com',
    },
    receiver: {
      name: 'Olivia Martinez',
      phone: '+1 (555) 443-1290',
      address: '1200 S Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60605',
      email: 'olivia.m@chicago.edu',
    },
    origin: 'Springfield, IL',
    destination: 'Chicago, IL',
    parcelType: 'document',
    weight: 0.5,
    description: 'Certified academic transcripts',
    cost: 14.50,
    status: 'PENDING',
    assignedTo: null,
    bookingDate: '2026-10-09T16:40:00.000Z',
    expectedDeliveryDate: '2026-10-13T12:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-09T16:40:00.000Z',
        location: 'Springfield Post Office',
        note: 'Online booking created. Awaiting dispatch assignment.',
        updatedBy: 'Sarah Jenkins',
      },
    ],
  },
  {
    _id: 'pcl_005',
    trackingId: 'PO-41029481',
    customerId: 'usr_cust_1',
    sender: {
      name: 'Sarah Jenkins',
      phone: '+1 (555) 912-3456',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      email: 'sarah.customer@gmail.com',
    },
    receiver: {
      name: 'James Wilson',
      phone: '+1 (555) 332-9012',
      address: '88 Market Square, Apt 4B',
      city: 'Peoria',
      state: 'IL',
      postalCode: '61602',
      email: 'jwilson@peoria.net',
    },
    origin: 'Springfield, IL',
    destination: 'Peoria, IL',
    parcelType: 'heavy',
    weight: 14.0,
    description: 'Automotive replacement generator part',
    cost: 78.00,
    status: 'FAILED',
    failureReason: 'Customer premises closed; secure signature could not be obtained after 2 attempts.',
    assignedTo: {
      _id: 'usr_emp_1',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'john.carrier@postoffice.gov',
    },
    bookingDate: '2026-10-04T08:00:00.000Z',
    expectedDeliveryDate: '2026-10-07T17:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-04T08:00:00.000Z',
        location: 'Springfield Hub',
        note: 'Booking registered.',
        updatedBy: 'Sarah Jenkins',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-05T09:00:00.000Z',
        location: 'Central Sorting Hub 01',
        note: 'Assigned to John Carrier.',
        updatedBy: 'Admin',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-06T10:00:00.000Z',
        location: 'Peoria Central Hub',
        note: 'Arrived at delivery hub.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-10-07T08:30:00.000Z',
        location: 'Peoria Local Depot',
        note: 'Out for morning delivery run.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'FAILED',
        timestamp: '2026-10-07T16:45:00.000Z',
        location: '88 Market Square, Peoria',
        note: 'Delivery failed: Recipient unavailable for signature.',
        updatedBy: 'John Carrier',
      },
    ],
  },
];

const SEED_DELIVERIES = [
  {
    _id: 'del_001',
    deliveryId: 'DEL-91024',
    parcelId: 'pcl_001',
    assignedEmployeeId: 'usr_emp_1',
    status: 'OUT_FOR_DELIVERY',
    assignedDate: '2026-10-07T10:00:00.000Z',
    scheduledDate: '2026-10-10T17:00:00.000Z',
    notes: 'Priority express dispatch. Customer requested morning arrival if possible.',
  },
  {
    _id: 'del_002',
    deliveryId: 'DEL-91018',
    parcelId: 'pcl_002',
    assignedEmployeeId: 'usr_emp_1',
    status: 'DELIVERED',
    assignedDate: '2026-10-02T08:00:00.000Z',
    scheduledDate: '2026-10-05T15:00:00.000Z',
    completionDate: '2026-10-05T14:22:00.000Z',
    notes: 'Standard delivery completed without exception.',
  },
  {
    _id: 'del_003',
    deliveryId: 'DEL-91033',
    parcelId: 'pcl_003',
    assignedEmployeeId: 'usr_emp_2',
    status: 'IN_TRANSIT',
    assignedDate: '2026-10-08T09:00:00.000Z',
    scheduledDate: '2026-10-11T16:00:00.000Z',
    notes: 'Handle with care - fragile optical sensors.',
  },
  {
    _id: 'del_004',
    deliveryId: 'DEL-91009',
    parcelId: 'pcl_005',
    assignedEmployeeId: 'usr_emp_1',
    status: 'FAILED',
    assignedDate: '2026-10-05T09:00:00.000Z',
    scheduledDate: '2026-10-07T17:00:00.000Z',
    completionDate: '2026-10-07T16:45:00.000Z',
    failureReason: 'Customer premises closed; secure signature could not be obtained after 2 attempts.',
    notes: 'Card left at door instructing depot pickup.',
  },
];

const SEED_COMPLAINTS = [
  {
    _id: 'cmp_001',
    complaintId: 'CMP-8391',
    customerId: 'usr_cust_1',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.customer@gmail.com',
    trackingId: 'PO-41029481',
    category: 'delayed_delivery',
    subject: 'Failed delivery notification without door slip',
    description: 'My package PO-41029481 was marked failed but I was waiting at home all afternoon. Please provide clarity on next delivery attempt.',
    status: 'IN_PROGRESS',
    resolutionNotes: 'Customer support reached out to local depot supervisor. Re-attempt scheduled for Monday 9:00 AM.',
    resolvedAt: null,
    resolvedBy: null,
    createdAt: '2026-10-08T10:15:00.000Z',
  },
  {
    _id: 'cmp_002',
    complaintId: 'CMP-7210',
    customerId: 'usr_cust_2',
    customerName: 'David Chen',
    customerEmail: 'david.chen@gmail.com',
    trackingId: null,
    category: 'billing',
    subject: 'Discrepancy in online dimension surcharge',
    description: 'Overcharged $12 on package booking due to weight measurement rounding. Would like credit adjustment.',
    status: 'RESOLVED',
    resolutionNotes: 'Audit confirmed scale variance. $12.00 refund credited back to customer account.',
    resolvedAt: '2026-10-04T15:30:00.000Z',
    resolvedBy: { _id: 'usr_admin_1', name: 'Victoria Stirling' },
    createdAt: '2026-10-03T11:20:00.000Z',
  },
];

const SEED_REVIEWS = [
  {
    _id: 'rev_001',
    trackingId: 'PO-98231019',
    customerId: 'usr_cust_1',
    customerName: 'Sarah Jenkins',
    rating: 5,
    feedback: 'Arrived right on time and packaging was in pristine condition. Excellent service by John!',
    createdAt: '2026-10-05T18:00:00.000Z',
  },
];

const SEED_NOTIFICATIONS = [
  {
    _id: 'notif_001',
    userId: 'usr_cust_1',
    title: 'Parcel Out for Delivery',
    message: 'Your parcel PO-84920184 is out for delivery with courier John Carrier.',
    type: 'parcel',
    link: '/customer/parcels/PO-84920184',
    isRead: false,
    createdAt: '2026-10-10T08:30:00.000Z',
  },
  {
    _id: 'notif_002',
    userId: 'usr_cust_1',
    title: 'Delivery Confirmation',
    message: 'Parcel PO-98231019 was successfully delivered to New York, NY.',
    type: 'parcel',
    link: '/customer/parcels/PO-98231019',
    isRead: true,
    createdAt: '2026-10-05T14:25:00.000Z',
  },
  {
    _id: 'notif_003',
    userId: 'usr_emp_1',
    title: 'New Delivery Assigned',
    message: 'Dispatch PO-84920184 has been assigned to your route for today.',
    type: 'delivery',
    link: '/employee/deliveries/del_001',
    isRead: false,
    createdAt: '2026-10-07T10:05:00.000Z',
  },
  {
    _id: 'notif_004',
    userId: 'usr_admin_1',
    title: 'New Complaint Submitted',
    message: 'Customer Sarah Jenkins logged a delivery complaint (CMP-8391).',
    type: 'complaint',
    link: '/admin/complaints',
    isRead: false,
    createdAt: '2026-10-08T10:16:00.000Z',
  },
];

// Demo accounts that must always exist and be usable in mock mode
const DEMO_USER_IDS = ['usr_admin_1', 'usr_emp_1', 'usr_emp_alias', 'usr_cust_1'];

// Repair persisted users: re-add missing demo accounts, make sure demo accounts
// are active and have the expected email/role (stale localStorage from older
// builds or a deactivated demo account would otherwise block login).
const healUsers = (users) => {
  let changed = false;
  const healed = users.map((u) => ({ ...u }));

  SEED_USERS.filter((seed) => DEMO_USER_IDS.includes(seed._id)).forEach((seed) => {
    const idx = healed.findIndex((u) => u._id === seed._id);
    if (idx === -1) {
      healed.push({ ...seed });
      changed = true;
      return;
    }
    const cur = healed[idx];
    if (
      cur.status !== 'active' ||
      cur.role !== seed.role ||
      (cur.email || '').toLowerCase() !== seed.email.toLowerCase()
    ) {
      healed[idx] = { ...cur, status: 'active', role: seed.role, email: seed.email, altEmail: seed.altEmail };
      changed = true;
    }
  });

  return { healed, changed };
};

// Helper to initialize storage if missing or outdated
const initStorage = (key, defaultData) => {
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    const parsed = JSON.parse(existing);
    if (key === STORAGE_KEYS.USERS) {
      if (!Array.isArray(parsed)) throw new Error('Invalid users data');
      const { healed, changed } = healUsers(parsed);
      if (changed) localStorage.setItem(key, JSON.stringify(healed));
      return healed;
    }
    return parsed;
  } catch {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
};

export const getMockData = () => {
  return {
    users: initStorage(STORAGE_KEYS.USERS, SEED_USERS),
    parcels: initStorage(STORAGE_KEYS.PARCELS, SEED_PARCELS),
    deliveries: initStorage(STORAGE_KEYS.DELIVERIES, SEED_DELIVERIES),
    complaints: initStorage(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS),
    reviews: initStorage(STORAGE_KEYS.REVIEWS, SEED_REVIEWS),
    notifications: initStorage(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
  };
};

export const saveMockCollection = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export { STORAGE_KEYS };