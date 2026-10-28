import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase, { isSupabaseEnabled } from '../config/supabase.js';
import { validateDeliveryStatusTransition } from '../utils/deliveryStatus.js';
import { buildAdminAnalytics } from '../utils/adminAnalytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.resolve(process.env.DIGIPOST_DATA_FILE || path.join(DATA_DIR, 'store.json'));

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// Initial Seed Users (includes Supabase IDs and roles)
const SEED_USERS = [
  {
    id: '3d03f579-96e7-4071-8dd7-0f89148dd2db',
    _id: '3d03f579-96e7-4071-8dd7-0f89148dd2db',
    name: 'Shreya Waghmare',
    email: 'admin@postoffice.gov',
    password: '$2b$10$mwvh093k2c1dGXcvCzYSKOr2WunfVPelUcM0JRMX6cPq9So5qaJpS', // DigiPostAdmin@2026 & admin123
    role: 'admin',
    station: 'Headquarters - Central Command',
    status: 'active',
    created_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    _id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    name: 'John Carrier',
    email: 'employee@postoffice.gov',
    password: '$2b$10$fVJLYBiZst4af08lrcC6qOaeupUWP0SzLzvlqYz1zkMhGHRlTcMkq', // DigiPostCourier@2026 & employee123
    phone: '+1 (555) 234-5678',
    role: 'employee',
    station: 'Central Sorting Hub 01',
    status: 'active',
    created_at: '2026-02-15T09:30:00.000Z',
  },
  {
    id: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    _id: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    name: 'Sarah Jenkins',
    email: 'sarah.customer@gmail.com',
    password: '$2b$10$omZjbbaKHUi55nMi3rcusuA.Glpvq9gToSuQ.C5AF2ClDz2DVGWzG', // customer123
    phone: '+1 (555) 912-3456',
    role: 'customer',
    address: '742 Evergreen Terrace, Springfield, IL 62704',
    status: 'active',
    created_at: '2026-04-05T14:20:00.000Z',
  },
  {
    id: 'usr_cust_2',
    _id: 'usr_cust_2',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    password: '$2b$10$omZjbbaKHUi55nMi3rcusuA.Glpvq9gToSuQ.C5AF2ClDz2DVGWzG', // customer123
    phone: '+1 (555) 432-8765',
    role: 'customer',
    address: '10880 Wilshire Blvd, Los Angeles, CA 90024',
    status: 'active',
    created_at: '2026-04-12T16:45:00.000Z',
  },
  {
    id: 'usr_emp_2',
    _id: 'usr_emp_2',
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@postoffice.gov',
    password: '$2b$10$fVJLYBiZst4af08lrcC6qOaeupUWP0SzLzvlqYz1zkMhGHRlTcMkq', // DigiPostCourier@2026
    phone: '+1 (555) 876-5432',
    role: 'employee',
    station: 'West Metro Delivery Hub',
    status: 'active',
    created_at: '2026-03-01T11:00:00.000Z',
  },
];

// Initial Seed Parcels
const SEED_PARCELS = [
  {
    id: 'pcl_001',
    _id: 'pcl_001',
    trackingId: 'PO-84920184',
    tracking_id: 'PO-84920184',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    senderId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
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
    description: 'Confidential client quarterly contracts',
    cost: 33.25,
    status: 'OUT_FOR_DELIVERY',
    assignedTo: {
      _id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'employee@postoffice.gov',
      station: 'Central Sorting Hub 01',
    },
    bookingDate: '2026-10-06T09:15:00.000Z',
    booking_date: '2026-10-06T09:15:00.000Z',
    expectedDeliveryDate: '2026-10-10T17:00:00.000Z',
    expected_delivery_date: '2026-10-10T17:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-06T09:15:00.000Z',
        location: 'Springfield Post Office',
        note: 'Parcel booked online and manifest verified.',
        updatedBy: 'Sarah Jenkins',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-07T10:00:00.000Z',
        location: 'Central Sorting Hub 01',
        note: 'Assigned to delivery courier John Carrier.',
        updatedBy: 'Shreya Waghmare (Admin)',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-08T14:30:00.000Z',
        location: 'Regional Transit Depot - Mid-East',
        note: 'Processed through transit sorting checkpoint.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-10-10T08:30:00.000Z',
        location: 'Scranton Local Delivery Hub',
        note: 'Loaded into delivery vehicle for final doorstep handoff.',
        updatedBy: 'John Carrier',
      },
    ],
  },
  {
    id: 'pcl_002',
    _id: 'pcl_002',
    trackingId: 'PO-98231019',
    tracking_id: 'PO-98231019',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    senderId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
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
      _id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'employee@postoffice.gov',
    },
    bookingDate: '2026-10-01T11:00:00.000Z',
    booking_date: '2026-10-01T11:00:00.000Z',
    expectedDeliveryDate: '2026-10-05T15:00:00.000Z',
    expected_delivery_date: '2026-10-05T15:00:00.000Z',
    deliveredDate: '2026-10-05T14:22:00.000Z',
    delivered_date: '2026-10-05T14:22:00.000Z',
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
        note: 'Signed by recipient Emma Watson.',
        updatedBy: 'John Carrier',
      },
    ],
  },
  {
    id: 'pcl_003',
    _id: 'pcl_003',
    trackingId: 'PO-73819204',
    tracking_id: 'PO-73819204',
    customerId: 'usr_cust_2',
    senderId: 'usr_cust_2',
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
      name: 'Alex Rivera',
      phone: '+1 (555) 887-2341',
      address: '500 Howard St, Floor 4',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      email: 'alex.rivera@techcorp.io',
    },
    origin: 'Los Angeles, CA',
    destination: 'San Francisco, CA',
    parcelType: 'fragile',
    weight: 3.8,
    description: 'Specialty glass laboratory optics',
    cost: 42.10,
    status: 'IN_TRANSIT',
    assignedTo: {
      _id: 'usr_emp_2',
      id: 'usr_emp_2',
      name: 'Maria Gonzalez',
      phone: '+1 (555) 876-5432',
      email: 'maria.gonzalez@postoffice.gov',
    },
    bookingDate: '2026-10-08T13:20:00.000Z',
    booking_date: '2026-10-08T13:20:00.000Z',
    expectedDeliveryDate: '2026-10-11T16:00:00.000Z',
    expected_delivery_date: '2026-10-11T16:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-08T13:20:00.000Z',
        location: 'Los Angeles Branch Office',
        note: 'Consignment booked with fragile handling endorsement.',
        updatedBy: 'David Chen',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-08T15:00:00.000Z',
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
    id: 'pcl_004',
    _id: 'pcl_004',
    trackingId: 'PO-51829372',
    tracking_id: 'PO-51829372',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    senderId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
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
    booking_date: '2026-10-09T16:40:00.000Z',
    expectedDeliveryDate: '2026-10-13T12:00:00.000Z',
    expected_delivery_date: '2026-10-13T12:00:00.000Z',
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
    id: 'pcl_005',
    _id: 'pcl_005',
    trackingId: 'PO-41029481',
    tracking_id: 'PO-41029481',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    senderId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
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
    failure_reason: 'Customer premises closed; secure signature could not be obtained after 2 attempts.',
    assignedTo: {
      _id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      id: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
      name: 'John Carrier',
      phone: '+1 (555) 234-5678',
      email: 'employee@postoffice.gov',
    },
    bookingDate: '2026-10-04T10:00:00.000Z',
    booking_date: '2026-10-04T10:00:00.000Z',
    expectedDeliveryDate: '2026-10-07T17:00:00.000Z',
    expected_delivery_date: '2026-10-07T17:00:00.000Z',
    history: [
      {
        status: 'PENDING',
        timestamp: '2026-10-04T10:00:00.000Z',
        location: 'Springfield Post Office',
        note: 'Parcel accepted into network.',
        updatedBy: 'Sarah Jenkins',
      },
      {
        status: 'ASSIGNED',
        timestamp: '2026-10-05T09:00:00.000Z',
        location: 'Central Sorting Hub 01',
        note: 'Assigned to courier John Carrier.',
        updatedBy: 'Admin',
      },
      {
        status: 'IN_TRANSIT',
        timestamp: '2026-10-06T11:00:00.000Z',
        location: 'Peoria Regional Depot',
        note: 'Arrival scan recorded at destination facility.',
        updatedBy: 'John Carrier',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-10-07T08:00:00.000Z',
        location: 'Peoria Local Depot',
        note: 'Dispatched with carrier on route.',
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

// Initial Seed Deliveries
const SEED_DELIVERIES = [
  {
    id: 'del_001',
    _id: 'del_001',
    deliveryId: 'DEL-91024',
    delivery_id: 'DEL-91024',
    parcelId: 'pcl_001',
    parcel_id: 'pcl_001',
    assignedEmployeeId: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    employee: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    status: 'OUT_FOR_DELIVERY',
    assignedDate: '2026-10-07T10:00:00.000Z',
    scheduledDate: '2026-10-10T17:00:00.000Z',
    notes: 'Priority express dispatch. Customer requested morning arrival if possible.',
  },
  {
    id: 'del_002',
    _id: 'del_002',
    deliveryId: 'DEL-91018',
    delivery_id: 'DEL-91018',
    parcelId: 'pcl_002',
    parcel_id: 'pcl_002',
    assignedEmployeeId: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    employee: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    status: 'DELIVERED',
    assignedDate: '2026-10-02T08:00:00.000Z',
    scheduledDate: '2026-10-05T15:00:00.000Z',
    completionDate: '2026-10-05T14:22:00.000Z',
    notes: 'Standard delivery completed without exception.',
  },
  {
    id: 'del_003',
    _id: 'del_003',
    deliveryId: 'DEL-91033',
    delivery_id: 'DEL-91033',
    parcelId: 'pcl_003',
    parcel_id: 'pcl_003',
    assignedEmployeeId: 'usr_emp_2',
    employee: 'usr_emp_2',
    status: 'IN_TRANSIT',
    assignedDate: '2026-10-08T09:00:00.000Z',
    scheduledDate: '2026-10-11T16:00:00.000Z',
    notes: 'Handle with care - fragile optical sensors.',
  },
  {
    id: 'del_004',
    _id: 'del_004',
    deliveryId: 'DEL-91009',
    delivery_id: 'DEL-91009',
    parcelId: 'pcl_005',
    parcel_id: 'pcl_005',
    assignedEmployeeId: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    employee: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    status: 'FAILED',
    assignedDate: '2026-10-05T09:00:00.000Z',
    scheduledDate: '2026-10-07T17:00:00.000Z',
    completionDate: '2026-10-07T16:45:00.000Z',
    failureReason: 'Customer premises closed; secure signature could not be obtained after 2 attempts.',
    notes: 'Card left at door instructing depot pickup.',
  },
];

// Initial Seed Complaints
const SEED_COMPLAINTS = [
  {
    id: 'cmp_001',
    _id: 'cmp_001',
    complaintId: 'CMP-8391',
    complaint_id: 'CMP-8391',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customer: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customerName: 'Sarah Jenkins',
    customer_name: 'Sarah Jenkins',
    customerEmail: 'sarah.customer@gmail.com',
    customer_email: 'sarah.customer@gmail.com',
    trackingId: 'PO-41029481',
    tracking_id: 'PO-41029481',
    category: 'delayed_delivery',
    subject: 'Failed delivery notification without door slip',
    description: 'My package PO-41029481 was marked failed but I was waiting at home all afternoon. Please provide clarity on next delivery attempt.',
    status: 'IN_PROGRESS',
    resolutionNotes: 'Customer support reached out to local depot supervisor. Re-attempt scheduled for Monday 9:00 AM.',
    resolution_notes: 'Customer support reached out to local depot supervisor. Re-attempt scheduled for Monday 9:00 AM.',
    createdAt: '2026-10-08T10:15:00.000Z',
    created_at: '2026-10-08T10:15:00.000Z',
  },
  {
    id: 'cmp_002',
    _id: 'cmp_002',
    complaintId: 'CMP-7210',
    complaint_id: 'CMP-7210',
    customerId: 'usr_cust_2',
    customer: 'usr_cust_2',
    customerName: 'David Chen',
    customer_name: 'David Chen',
    customerEmail: 'david.chen@gmail.com',
    customer_email: 'david.chen@gmail.com',
    trackingId: null,
    tracking_id: null,
    category: 'billing',
    subject: 'Discrepancy in online dimension surcharge',
    description: 'Overcharged $12 on package booking due to weight measurement rounding. Would like credit adjustment.',
    status: 'RESOLVED',
    resolutionNotes: 'Audit confirmed scale variance. $12.00 refund credited back to customer account.',
    resolution_notes: 'Audit confirmed scale variance. $12.00 refund credited back to customer account.',
    resolvedAt: '2026-10-04T15:30:00.000Z',
    resolved_at: '2026-10-04T15:30:00.000Z',
    createdAt: '2026-10-03T11:20:00.000Z',
    created_at: '2026-10-03T11:20:00.000Z',
  },
];

// Initial Seed Reviews
const SEED_REVIEWS = [
  {
    id: 'rev_001',
    _id: 'rev_001',
    trackingId: 'PO-98231019',
    tracking_id: 'PO-98231019',
    customerId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customer_id: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customerName: 'Sarah Jenkins',
    rating: 5,
    feedback: 'Arrived right on time and packaging was in pristine condition. Excellent service by John!',
    createdAt: '2026-10-05T18:00:00.000Z',
    created_at: '2026-10-05T18:00:00.000Z',
  },
];

// Initial Seed Notifications
const SEED_NOTIFICATIONS = [
  {
    id: 'ntf_001',
    _id: 'ntf_001',
    userId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customer: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    title: 'Package Out For Delivery',
    message: 'Consignment PO-84920184 has been dispatched with courier John Carrier.',
    type: 'dispatch',
    isRead: false,
    is_read: false,
    createdAt: '2026-10-10T08:35:00.000Z',
  },
  {
    id: 'ntf_002',
    _id: 'ntf_002',
    userId: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    customer: '0e95f061-97d0-47d8-9e20-60f3eda7f127',
    title: 'Successful Delivery Verified',
    message: 'Package PO-98231019 was delivered and signed for by Emma Watson.',
    type: 'success',
    isRead: true,
    is_read: true,
    createdAt: '2026-10-05T14:25:00.000Z',
  },
  {
    id: 'ntf_003',
    _id: 'ntf_003',
    userId: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    customer: 'd8b05dfc-94ee-4d7f-a082-4a1371d1c9b2',
    title: 'Route Assignment Update',
    message: 'Priority Express package PO-84920184 allocated to your active delivery manifest.',
    type: 'info',
    isRead: false,
    is_read: false,
    createdAt: '2026-10-07T10:05:00.000Z',
  },
];

class StoreService {
  constructor() {
    this.state = this.loadState();
    this.ready = this.syncFromSupabase();
  }

  loadState() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || SEED_USERS,
          parcels: parsed.parcels || SEED_PARCELS,
          deliveries: parsed.deliveries || SEED_DELIVERIES,
          complaints: parsed.complaints || SEED_COMPLAINTS,
          reviews: parsed.reviews || SEED_REVIEWS,
          notifications: parsed.notifications || SEED_NOTIFICATIONS,
        };
      }
    } catch (e) {
      console.warn('Notice loading store.json, using defaults:', e.message);
    }

    const initial = {
      users: SEED_USERS,
      parcels: SEED_PARCELS,
      deliveries: SEED_DELIVERIES,
      complaints: SEED_COMPLAINTS,
      reviews: SEED_REVIEWS,
      notifications: SEED_NOTIFICATIONS,
    };
    this.saveState(initial);
    return initial;
  }

  saveState(state = this.state) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  }

  async syncFromSupabase() {
    if (!isSupabaseEnabled) return;

    try {
      const tables = ['users', 'parcels', 'deliveries', 'complaints', 'feedback', 'notifications'];
      const results = await Promise.all(tables.map((table) => supabase.from(table).select('*')));
      const failed = results.find((result) => result.error);
      if (failed) throw failed.error;

      const [users, parcels, deliveries, complaints, reviews, notifications] = results.map(
        (result) => result.data || []
      );

      this.state.users = users.map((user) => ({
        ...user,
        _id: user.id,
        email: user.email?.trim().toLowerCase(),
      }));
      this.state.parcels = parcels.map((parcel) => {
        const sender = this.state.users.find(
          (user) => user.id === parcel.customer_id ||
            user.email?.toLowerCase() === String(parcel.sender || '').toLowerCase()
        );
        const employee = this.state.users.find((user) => user.id === parcel.assigned_to);
        return {
          ...parcel,
          _id: parcel.id,
          trackingId: parcel.tracking_id,
          customerId: parcel.customer_id || sender?.id,
          senderId: parcel.customer_id || sender?.id,
          sender: parcel.sender_details || (sender ? {
            name: sender.name,
            email: sender.email,
            phone: sender.phone,
            address: sender.address,
          } : {}),
          receiver: parcel.receiver || {},
          parcelType: parcel.parcel_type,
          bookingDate: parcel.booking_date,
          expectedDeliveryDate: parcel.expected_delivery_date,
          deliveredDate: parcel.delivered_date,
          failureReason: parcel.failure_reason,
          assignedTo: employee ? {
            _id: employee.id,
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            station: employee.station,
          } : null,
          history: Array.isArray(parcel.history) ? parcel.history : [],
        };
      });
      this.state.deliveries = deliveries.map((delivery) => ({
        ...delivery,
        _id: delivery.id,
        deliveryId: delivery.delivery_id,
        parcelId: delivery.parcel_id,
        assignedEmployeeId: delivery.employee,
        assignedDate: delivery.assigned_date,
        scheduledDate: delivery.scheduled_date,
        completionDate: delivery.completion_date,
        failureReason: delivery.failure_reason,
      }));
      this.state.complaints = complaints.map((complaint) => ({
        ...complaint,
        _id: complaint.id,
        complaintId: complaint.complaint_id,
        customerId: complaint.customer,
        customerName: complaint.customer_name,
        customerEmail: complaint.customer_email,
        trackingId: complaint.tracking_id,
        resolutionNotes: complaint.resolution_notes,
        resolvedAt: complaint.resolved_at,
      }));
      this.state.reviews = reviews.map((review) => ({
        ...review,
        _id: review.id,
        trackingId: review.tracking_id,
        customerId: review.customer_id,
        createdAt: review.created_at,
      }));
      this.state.notifications = notifications.map((notification) => ({
        ...notification,
        _id: notification.id,
        userId: notification.customer,
        isRead: notification.is_read,
        createdAt: notification.created_at,
      }));
      this.saveState();
    } catch (error) {
      console.warn('Could not sync live data from Supabase, using local data store:', error.message);
    }
  }

  // ==========================================
  // USERS
  // ==========================================
  getUsers(filters = {}) {
    let result = [...this.state.users];
    if (filters.role) {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.station?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getUserById(id) {
    if (!id) return null;
    const target = id.toString().trim().toLowerCase();
    return this.state.users.find(
      (u) =>
        (u.id && u.id === id) ||
        (u._id && u._id === id) ||
        (u.email && (u.email || '').trim().toLowerCase() === target)
    );
  }

  addUser(userData) {
    const id = userData.id || userData._id || `usr_${Date.now()}`;
    const userEmail = (userData.email || '').trim().toLowerCase();

    // Check if user already exists by ID or email to prevent duplicate accumulation
    const existingIdx = this.state.users.findIndex(
      (u) =>
        (u.id && u.id === id) ||
        (u._id && u._id === id) ||
        (userEmail && (u.email || '').trim().toLowerCase() === userEmail)
    );

    const user = {
      ...userData,
      id,
      _id: id,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.state.users[existingIdx] = {
        ...this.state.users[existingIdx],
        ...user,
      };
      this.saveState();
      return this.state.users[existingIdx];
    }

    this.state.users.push(user);
    this.saveState();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.state.users.findIndex((u) => u.id === id || u._id === id);
    if (idx >= 0) {
      this.state.users[idx] = {
        ...this.state.users[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.saveState();
      return this.state.users[idx];
    }
    return null;
  }

  // ==========================================
  // PARCELS
  // ==========================================
  getParcels(filters = {}) {
    let result = [...this.state.parcels];

    if (filters.customerId) {
      const cid = filters.customerId;
      const targetUser = this.getUserById(cid);
      const userEmail = targetUser?.email?.toLowerCase();

      result = result.filter(
        (p) =>
          p.customerId === cid ||
          p.senderId === cid ||
          p.sender === cid ||
          (userEmail && p.sender?.email?.toLowerCase() === userEmail)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.unassignedOnly) {
      result = result.filter((p) => !p.assignedTo || p.status === 'PENDING');
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.trackingId?.toLowerCase().includes(q) ||
          p.sender?.name?.toLowerCase().includes(q) ||
          p.receiver?.name?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.destination?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getParcelById(idOrTracking) {
    const q = (idOrTracking || '').trim().toLowerCase();
    return this.state.parcels.find(
      (p) =>
        p.id?.toLowerCase() === q ||
        p._id?.toLowerCase() === q ||
        p.trackingId?.toLowerCase() === q ||
        p.tracking_id?.toLowerCase() === q
    );
  }

  async bookParcel(parcelData, user) {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const trackingId = `PO-${randomDigits}`;

    const baseRates = { standard: 10, express: 22, document: 12, fragile: 25, heavy: 35 };
    const rate = baseRates[parcelData.parcelType] || 15;
    const weightNum = Math.max(0.5, Number(parcelData.weight) || 1);
    const calculatedCost = Number((rate + weightNum * 4.5).toFixed(2));

    const expectedDays = parcelData.parcelType === 'express' ? 2 : 4;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + expectedDays);

    const senderObj = typeof parcelData.sender === 'object' && parcelData.sender !== null
      ? parcelData.sender
      : {
          name: user?.name || 'Customer Sender',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || 'Origin Address',
          city: 'Origin City',
          state: 'Origin State',
        };

    const receiverObj = typeof parcelData.receiver === 'object' && parcelData.receiver !== null
      ? parcelData.receiver
      : {
          name: 'Recipient',
          address: 'Destination Address',
          city: 'Destination City',
          state: 'Destination State',
        };

    const origin = parcelData.origin || `${senderObj.city || 'Origin'}, ${senderObj.state || ''}`.replace(/,\s*$/, '');
    const destination = parcelData.destination || `${receiverObj.city || 'Destination'}, ${receiverObj.state || ''}`.replace(/,\s*$/, '');

    const id = `pcl_${Date.now()}`;
    const newParcel = {
      id,
      _id: id,
      trackingId,
      tracking_id: trackingId,
      customerId: user?._id || user?.id || parcelData.customerId,
      senderId: user?._id || user?.id || parcelData.customerId,
      sender: senderObj,
      receiver: receiverObj,
      origin,
      destination,
      parcelType: parcelData.parcelType || 'standard',
      weight: weightNum,
      description: parcelData.description || '',
      cost: calculatedCost,
      status: 'PENDING',
      assignedTo: null,
      bookingDate: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      expectedDeliveryDate: expectedDate.toISOString(),
      expected_delivery_date: expectedDate.toISOString(),
      history: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          location: `${senderObj.city || 'Origin'} Post Office`,
          note: 'Consignment booked online and registered into postal manifest.',
          updatedBy: senderObj.name || user?.name || 'Customer',
        },
      ],
    };

    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('parcels')
        .insert({
          tracking_id: trackingId,
          sender: newParcel.customerId,
          customer_id: newParcel.customerId,
          sender_details: senderObj,
          receiver: receiverObj,
          origin,
          destination,
          parcel_type: newParcel.parcelType,
          weight: weightNum,
          description: newParcel.description,
          cost: calculatedCost,
          status: 'PENDING',
          booking_date: newParcel.bookingDate,
          expected_delivery_date: expectedDate.toISOString(),
          history: newParcel.history,
        })
        .select('id')
        .single();
      if (error) throw error;
      newParcel.id = data.id;
      newParcel._id = data.id;
    }

    this.state.parcels.unshift(newParcel);

    // Create notification for customer
    if (newParcel.customerId) {
      await this.addNotification({
        userId: newParcel.customerId,
        title: 'New Parcel Registered',
        message: `Your package ${trackingId} has been successfully scheduled for collection.`,
        type: 'info',
      });
    }

    this.saveState();

    return newParcel;
  }

  async cancelParcel(parcelId, user) {
    const parcelIndex = this.state.parcels.findIndex(
      (p) => p._id === parcelId || p.id === parcelId || p.trackingId === parcelId
    );
    if (parcelIndex === -1) {
      throw new Error('Consignment parcel not found.');
    }

    const parcel = this.state.parcels[parcelIndex];
    if (parcel.status !== 'PENDING') {
      throw new Error(`Cannot cancel parcel: current status is ${parcel.status}. Only PENDING parcels can be cancelled.`);
    }

    const now = new Date().toISOString();
    const cancellationEvent = {
      status: 'CANCELLED',
      timestamp: now,
      location: parcel.origin || 'Origin Facility',
      note: 'Parcel booking cancelled by customer.',
      updatedBy: user?.name || 'Customer',
    };
    const nextHistory = [
      ...(Array.isArray(parcel.history) ? parcel.history : []),
      cancellationEvent,
    ];
    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('parcels')
        .update({ status: 'CANCELLED', history: nextHistory, updated_at: now })
        .eq('tracking_id', parcel.trackingId)
        .eq('status', 'PENDING')
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Parcel was not found in the database; cancellation was not saved.');
      const delivery = this.state.deliveries.find(
        (record) => record.parcelId === parcel.id || record.parcelId === data.id
      );
      if (delivery) {
        const { error: deliveryError } = await supabase
          .from('deliveries')
          .update({ status: 'CANCELLED', updated_at: now })
          .eq('id', delivery.id);
        if (deliveryError) throw deliveryError;
      }
    }

    parcel.status = 'CANCELLED';
    parcel.history = nextHistory;

    this.state.parcels[parcelIndex] = parcel;

    const delIndex = this.state.deliveries.findIndex((d) => d.parcelId === parcel._id || d.parcelId === parcel.id);
    if (delIndex >= 0) {
      this.state.deliveries[delIndex].status = 'CANCELLED';
    }

    if (parcel.customerId) {
      await this.addNotification({
        userId: parcel.customerId,
        title: 'Parcel Booking Cancelled',
        message: `Your booking for consignment ${parcel.trackingId} was successfully cancelled.`,
        type: 'warning',
      });
    }

    this.saveState();

    return parcel;
  }

  async assignParcel(parcelId, employeeId) {
    const parcelIndex = this.state.parcels.findIndex(
      (p) => p._id === parcelId || p.id === parcelId || p.trackingId === parcelId
    );
    if (parcelIndex === -1) {
      throw new Error('Consignment parcel not found.');
    }

    const employee = this.getUserById(employeeId);
    if (!employee) {
      throw new Error('Assigned postal employee not found.');
    }
    if (employee.status === 'inactive') {
      throw new Error('Cannot assign parcel to a deactivated employee.');
    }

    const parcel = this.state.parcels[parcelIndex];
    if (parcel.status !== 'PENDING') {
      throw new Error(`Cannot assign parcel: current status is ${parcel.status}. Only PENDING parcels can be assigned.`);
    }
    const now = new Date().toISOString();
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    const deliveryCode = `DEL-${Math.floor(10000 + Math.random() * 90000)}`;
    const assignmentEvent = {
      status: 'ASSIGNED',
      timestamp: now,
      location: employee.station || 'Regional Sorting Hub',
      note: `Consignment assigned to courier ${employee.name}.`,
      updatedBy: 'Postal Operations Command',
    };
    const assignmentHistory = [
      ...(Array.isArray(parcel.history) ? parcel.history : []),
      assignmentEvent,
    ];
    let remoteDelivery = null;

    if (isSupabaseEnabled) {
      const { data: updatedParcel, error: parcelError } = await supabase
        .from('parcels')
        .update({
          status: 'ASSIGNED',
          assigned_to: employee.id || employee._id,
          history: assignmentHistory,
          updated_at: now,
        })
        .eq('tracking_id', parcel.trackingId)
        .eq('status', 'PENDING')
        .select('id')
        .single();
      if (parcelError) throw parcelError;

      const existingDelivery = this.state.deliveries.find(
        (delivery) => delivery.parcelId === parcel.id || delivery.parcelId === updatedParcel.id
      );
      if (existingDelivery) {
        const { data, error } = await supabase
          .from('deliveries')
          .update({
            employee: employee.id || employee._id,
            status: 'ASSIGNED',
            scheduled_date: scheduledDate.toISOString(),
            updated_at: now,
          })
          .eq('id', existingDelivery.id)
          .select('*')
          .single();
        if (error) throw error;
        remoteDelivery = data;
      } else {
        const { data, error } = await supabase
          .from('deliveries')
          .insert({
            delivery_id: deliveryCode,
            parcel_id: updatedParcel.id,
            employee: employee.id || employee._id,
            status: 'ASSIGNED',
            assigned_date: now,
            scheduled_date: scheduledDate.toISOString(),
            notes: `Assigned to delivery route with ${employee.name}.`,
          })
          .select('*')
          .single();
        if (error) throw error;
        remoteDelivery = data;
      }
      parcel.id = updatedParcel.id;
      parcel._id = updatedParcel.id;
    }

    parcel.status = 'ASSIGNED';
    parcel.assignedTo = {
      _id: employee._id || employee.id,
      id: employee._id || employee.id,
      name: employee.name,
      phone: employee.phone,
      email: employee.email,
      station: employee.station || 'Regional Transit Depot',
    };

    parcel.history = assignmentHistory;

    this.state.parcels[parcelIndex] = parcel;

    // Synchronize or create delivery record!
    const delIndex = this.state.deliveries.findIndex(
      (d) => d.parcelId === parcel._id || d.parcelId === parcel.id
    );

    if (delIndex >= 0) {
      this.state.deliveries[delIndex].assignedEmployeeId = employee._id || employee.id;
      this.state.deliveries[delIndex].employee = employee._id || employee.id;
      this.state.deliveries[delIndex].status = 'ASSIGNED';
      this.state.deliveries[delIndex].scheduledDate = scheduledDate.toISOString();
    } else {
      const delId = remoteDelivery?.id || `del_${Date.now()}`;
      this.state.deliveries.unshift({
        id: delId,
        _id: delId,
        deliveryId: remoteDelivery?.delivery_id || deliveryCode,
        parcelId: parcel._id || parcel.id,
        assignedEmployeeId: employee._id || employee.id,
        employee: employee._id || employee.id,
        status: 'ASSIGNED',
        assignedDate: now,
        scheduledDate: scheduledDate.toISOString(),
        notes: `Assigned to delivery route with ${employee.name}.`,
      });
    }

    // Create notifications for courier and customer
    await this.addNotification({
      userId: employee._id || employee.id,
      title: 'New Route Assignment',
      message: `Consignment ${parcel.trackingId} added to your active delivery queue.`,
      type: 'dispatch',
    });

    if (parcel.customerId) {
      await this.addNotification({
        userId: parcel.customerId,
        title: 'Courier Assigned',
        message: `Courier ${employee.name} assigned to your consignment ${parcel.trackingId}.`,
        type: 'info',
      });
    }

    this.saveState();

    return parcel;
  }

  // ==========================================
  // DELIVERIES
  // ==========================================
  getDeliveries(filters = {}) {
    let result = this.state.deliveries.map((d) => {
      const parcel = this.getParcelById(d.parcelId) || null;
      const employee = this.getUserById(d.assignedEmployeeId || d.employee) || null;
      return {
        ...d,
        parcel,
        assignedEmployee: employee,
      };
    });

    if (filters.employeeId) {
      const emp = this.getUserById(filters.employeeId);
      const empEmail = emp?.email?.toLowerCase();
      result = result.filter(
        (d) =>
          d.assignedEmployeeId === filters.employeeId ||
          d.employee === filters.employeeId ||
          (empEmail && d.assignedEmployee?.email?.toLowerCase() === empEmail)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((d) => d.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.deliveryId?.toLowerCase().includes(q) ||
          d.parcel?.trackingId?.toLowerCase().includes(q) ||
          d.assignedEmployee?.name?.toLowerCase().includes(q) ||
          d.parcel?.destination?.toLowerCase().includes(q) ||
          d.parcel?.receiver?.name?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getDeliveryById(deliveryId) {
    const d = this.state.deliveries.find(
      (del) => del._id === deliveryId || del.id === deliveryId || del.deliveryId === deliveryId
    );
    if (!d) return null;

    const parcel = this.getParcelById(d.parcelId) || null;
    const employee = this.getUserById(d.assignedEmployeeId || d.employee) || null;
    return {
      ...d,
      parcel,
      assignedEmployee: employee,
    };
  }

  async updateDeliveryStatus(deliveryId, { status, note, location, failureReason, employeeName }) {
    const delIndex = this.state.deliveries.findIndex(
      (d) => d._id === deliveryId || d.id === deliveryId || d.deliveryId === deliveryId
    );
    if (delIndex === -1) {
      throw new Error('Delivery manifest record not found.');
    }

    const delivery = this.state.deliveries[delIndex];
    const currentStatus = (delivery.status || 'ASSIGNED').toUpperCase();

    if (currentStatus === 'DELIVERED') {
      throw new Error('Delivery manifest is already completed as DELIVERED and cannot be modified.');
    }

    const nextStatus = validateDeliveryStatusTransition(currentStatus, status, failureReason);

    const now = new Date().toISOString();
    const parcel = this.getParcelById(delivery.parcelId);
    if (isSupabaseEnabled) {
      const { data: updatedDelivery, error: deliveryError } = await supabase
        .from('deliveries')
        .update({
          status: nextStatus,
          failure_reason: failureReason || null,
          notes: note || delivery.notes,
          location: location || delivery.location,
          completion_date: ['DELIVERED', 'FAILED'].includes(nextStatus) ? now : null,
          updated_at: now,
        })
        .eq('id', delivery.id)
        .eq('status', currentStatus)
        .select('id')
        .maybeSingle();
      if (deliveryError) throw deliveryError;
      if (!updatedDelivery) throw new Error('Delivery was not found in the database; status was not saved.');

      if (parcel) {
        const nextHistory = [
          ...(Array.isArray(parcel.history) ? parcel.history : []),
          {
            status: nextStatus,
            timestamp: now,
            location: location || 'Postal Transit Checkpoint',
            note: note || (nextStatus === 'FAILED' ? `Delivery attempt failed: ${failureReason}` : `Status updated to ${nextStatus}.`),
            updatedBy: employeeName || 'Courier',
          },
        ];
        const { data: updatedParcel, error: parcelError } = await supabase
          .from('parcels')
          .update({
            status: nextStatus,
            failure_reason: failureReason || null,
            delivered_date: nextStatus === 'DELIVERED' ? now : null,
            history: nextHistory,
            updated_at: now,
          })
          .eq('tracking_id', parcel.trackingId)
          .select('id')
          .maybeSingle();
        if (parcelError) throw parcelError;
        if (!updatedParcel) throw new Error('Parcel was not found in the database; status was not saved.');
      }
    }

    delivery.status = nextStatus;
    delivery.notes = note || delivery.notes;
    delivery.location = location || delivery.location;

    if (nextStatus === 'DELIVERED') {
      delivery.completionDate = now;
      delivery.completion_date = now;
    } else if (nextStatus === 'FAILED') {
      delivery.failureReason = failureReason;
      delivery.failure_reason = failureReason;
      delivery.completionDate = now;
      delivery.completion_date = now;
    }

    this.state.deliveries[delIndex] = delivery;

    // CRITICAL: Synchronize matching parcel and add to its history tracking!
    if (parcel) {
      const pIdx = this.state.parcels.findIndex((p) => p._id === parcel._id || p.id === parcel.id);
      if (pIdx >= 0) {
        parcel.status = nextStatus;
        if (nextStatus === 'DELIVERED') {
          parcel.deliveredDate = now;
          parcel.delivered_date = now;
        } else if (nextStatus === 'FAILED') {
          parcel.failureReason = failureReason;
          parcel.failure_reason = failureReason;
        }

        if (!Array.isArray(parcel.history)) {
          parcel.history = [];
        }

        parcel.history.push({
          status: nextStatus,
          timestamp: now,
          location: location || 'Postal Transit Checkpoint',
          note: note || (nextStatus === 'FAILED' ? `Delivery attempt failed: ${failureReason}` : `Status updated to ${nextStatus}.`),
          updatedBy: employeeName || 'Courier',
        });

        this.state.parcels[pIdx] = parcel;

        // Customer notification
        if (parcel.customerId) {
          await this.addNotification({
            userId: parcel.customerId,
            title: nextStatus === 'DELIVERED' ? 'Parcel Delivered Successfully' : `Parcel Status: ${nextStatus}`,
            message: nextStatus === 'DELIVERED'
              ? `Your consignment ${parcel.trackingId} was successfully delivered.`
              : `Consignment ${parcel.trackingId} status updated to ${nextStatus}: ${note || failureReason || ''}`,
            type: nextStatus === 'DELIVERED' ? 'success' : nextStatus === 'FAILED' ? 'warning' : 'info',
          });
        }
      }
    }

    this.saveState();

    return this.getDeliveryById(delivery._id || delivery.id);
  }

  getDeliveriesToday(employeeId = null) {
    const todayPrefix = new Date().toISOString().split('T')[0];
    let deliveries = this.getDeliveries(employeeId ? { employeeId } : {});
    return deliveries.filter((d) => {
      const dateStr = d.scheduledDate || d.assignedDate || d.created_at || d.bookingDate;
      return dateStr && dateStr.startsWith(todayPrefix);
    });
  }

  async reassignDelivery(deliveryId, employeeId, adminUser) {
    const delIndex = this.state.deliveries.findIndex(
      (d) => d._id === deliveryId || d.id === deliveryId || d.deliveryId === deliveryId
    );
    if (delIndex === -1) {
      throw new Error('Delivery manifest record not found.');
    }
    const employee = this.getUserById(employeeId);
    if (!employee) {
      throw new Error('Assigned postal employee not found.');
    }
    if (employee.status === 'inactive') {
      throw new Error('Cannot assign delivery to a deactivated employee.');
    }

    const delivery = this.state.deliveries[delIndex];
    const now = new Date().toISOString();
    const parcel = this.getParcelById(delivery.parcelId);
    const assignmentNote = `Reassigned to courier ${employee.name} by ${adminUser?.name || 'Admin'}.`;
    if (isSupabaseEnabled) {
      const { data: updatedDelivery, error: deliveryError } = await supabase
        .from('deliveries')
        .update({
          employee: employee.id || employee._id,
          status: 'ASSIGNED',
          notes: assignmentNote,
          updated_at: now,
        })
        .eq('id', delivery.id)
        .select('id')
        .maybeSingle();
      if (deliveryError) throw deliveryError;
      if (!updatedDelivery) throw new Error('Delivery was not found in the database; reassignment was not saved.');

      if (parcel) {
        const nextHistory = [
          ...(Array.isArray(parcel.history) ? parcel.history : []),
          {
            status: 'ASSIGNED',
            timestamp: now,
            location: employee.station || 'Regional Dispatch Hub',
            note: `Reassigned to courier ${employee.name}.`,
            updatedBy: adminUser?.name || 'Postal Administrator',
          },
        ];
        const { data: updatedParcel, error: parcelError } = await supabase
          .from('parcels')
          .update({
            status: 'ASSIGNED',
            assigned_to: employee.id || employee._id,
            history: nextHistory,
            updated_at: now,
          })
          .eq('tracking_id', parcel.trackingId)
          .select('id')
          .maybeSingle();
        if (parcelError) throw parcelError;
        if (!updatedParcel) throw new Error('Parcel was not found in the database; reassignment was not saved.');
      }
    }

    delivery.assignedEmployeeId = employee._id || employee.id;
    delivery.employee = employee._id || employee.id;
    delivery.status = 'ASSIGNED';
    delivery.notes = assignmentNote;

    if (parcel) {
      const pIdx = this.state.parcels.findIndex((p) => p._id === parcel._id || p.id === parcel.id);
      if (pIdx >= 0) {
        this.state.parcels[pIdx].status = 'ASSIGNED';
        this.state.parcels[pIdx].assignedTo = {
          _id: employee._id || employee.id,
          id: employee._id || employee.id,
          name: employee.name,
          phone: employee.phone,
          email: employee.email,
          station: employee.station || 'Regional Transit Depot',
        };
        if (!Array.isArray(this.state.parcels[pIdx].history)) {
          this.state.parcels[pIdx].history = [];
        }
        this.state.parcels[pIdx].history.push({
          status: 'ASSIGNED',
          timestamp: now,
          location: employee.station || 'Regional Dispatch Hub',
          note: `Reassigned to courier ${employee.name}.`,
          updatedBy: adminUser?.name || 'Postal Administrator',
        });
      }
    }

    await this.addNotification({
      userId: employee._id || employee.id,
      title: 'Delivery Route Reassignment',
      message: `Delivery ${delivery.deliveryId} (${parcel?.trackingId || ''}) was assigned to your route.`,
      type: 'dispatch',
    });

    this.saveState();

    return this.getDeliveryById(delivery._id || delivery.id);
  }

  // ==========================================
  // COMPLAINTS
  // ==========================================
  getComplaints(filters = {}) {
    let result = [...this.state.complaints];

    if (filters.customerId) {
      const cid = filters.customerId;
      const user = this.getUserById(cid);
      const email = user?.email?.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerId === cid ||
          c.customer === cid ||
          (email && c.customerEmail?.toLowerCase() === email)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaintId?.toLowerCase().includes(q) ||
          c.subject?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.trackingId?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getComplaintById(id) {
    return this.state.complaints.find((c) => c.id === id || c._id === id || c.complaintId === id);
  }

  async addComplaint(data, user) {
    const id = `cmp_${Date.now()}`;
    const newComplaint = {
      id,
      _id: id,
      complaintId: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user?._id || user?.id || data.customerId,
      customer: user?._id || user?.id || data.customerId,
      customerName: user?.name || data.customerName || 'Customer',
      customerEmail: user?.email || data.customerEmail || '',
      trackingId: data.trackingId || null,
      tracking_id: data.trackingId || null,
      category: data.category || 'general',
      subject: data.subject?.trim() || 'Customer Support Request',
      description: data.description?.trim() || '',
      status: 'OPEN',
      resolutionNotes: null,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          complaint_id: newComplaint.complaintId,
          customer: newComplaint.customerId,
          customer_name: newComplaint.customerName,
          customer_email: newComplaint.customerEmail,
          tracking_id: newComplaint.trackingId,
          category: newComplaint.category,
          subject: newComplaint.subject,
          description: newComplaint.description,
          status: newComplaint.status,
        })
        .select('id')
        .single();
      if (error) throw error;
      newComplaint.id = data.id;
      newComplaint._id = data.id;
    }

    this.state.complaints.unshift(newComplaint);

    await this.addNotification({
      userId: newComplaint.customerId,
      title: 'Support Ticket Registered',
      message: `Your inquiry ${newComplaint.complaintId} has been logged for supervisor review.`,
      type: 'info',
    });

    this.saveState();
    return newComplaint;
  }

  async updateComplaintStatus(complaintId, { status, resolutionNotes, adminUser }) {
    const idx = this.state.complaints.findIndex(
      (c) => c._id === complaintId || c.id === complaintId || c.complaintId === complaintId
    );
    if (idx === -1) {
      throw new Error('Complaint ticket not found.');
    }

    const complaint = this.state.complaints[idx];
    const now = new Date().toISOString();
    if (isSupabaseEnabled) {
      const updates = {
        status,
        resolution_notes: resolutionNotes || complaint.resolutionNotes || null,
        updated_at: now,
      };
      if (status === 'RESOLVED') {
        updates.resolved_at = now;
        updates.resolved_by = adminUser?.id || adminUser?._id || null;
      }
      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', complaint.id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Complaint was not found in the database; update was not saved.');
    }
    complaint.status = status;
    complaint.resolutionNotes = resolutionNotes || complaint.resolutionNotes;
    complaint.resolution_notes = resolutionNotes || complaint.resolution_notes;

    if (status === 'RESOLVED') {
      complaint.resolvedAt = now;
      complaint.resolved_at = now;
      complaint.resolvedBy = adminUser ? { _id: adminUser._id, name: adminUser.name } : 'Administrator';
    }

    this.state.complaints[idx] = complaint;

    if (complaint.customerId) {
      await this.addNotification({
        userId: complaint.customerId,
        title: `Ticket ${complaint.complaintId} ${status}`,
        message: `Your ticket has been updated: ${resolutionNotes || status}`,
        type: status === 'RESOLVED' ? 'success' : 'info',
      });
    }

    this.saveState();
    return complaint;
  }

  // ==========================================
  // REVIEWS / FEEDBACK
  // ==========================================
  getReviews() {
    return [...this.state.reviews];
  }

  getReviewByTrackingId(trackingId) {
    const q = (trackingId || '').trim().toLowerCase();
    return this.state.reviews.find((r) => r.trackingId?.toLowerCase() === q);
  }

  async addReview(data, user) {
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }

    const parcel = this.getParcelById(data.trackingId);
    if (!parcel) {
      throw new Error('Parcel not found.');
    }
    if (parcel.customerId !== (user?._id || user?.id)) {
      throw new Error('You can only review your own parcel.');
    }
    if (parcel.status !== 'DELIVERED') {
      throw new Error(`Reviews can only be submitted for completed deliveries. Current consignment status is ${parcel.status}.`);
    }

    const existing = this.getReviewByTrackingId(data.trackingId);
    if (existing) {
      throw new Error(`A review has already been submitted for consignment ${data.trackingId}.`);
    }

    const id = `rev_${Date.now()}`;
    const newReview = {
      id,
      _id: id,
      trackingId: data.trackingId,
      tracking_id: data.trackingId,
      customerId: user?._id || user?.id || data.customerId,
      customer_id: user?._id || user?.id || data.customerId,
      customerName: user?.name || data.customerName || 'Customer',
      rating,
      feedback: data.feedback || '',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseEnabled) {
      const { data: insertedReview, error } = await supabase.from('feedback').insert({
        tracking_id: data.trackingId,
        customer_id: user?._id || user?.id || null,
        rating,
        feedback: data.feedback || '',
      }).select('id').single();
      if (error) throw error;
      newReview.id = insertedReview.id;
      newReview._id = insertedReview.id;
    }

    this.state.reviews.unshift(newReview);
    this.saveState();

    return newReview;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications(userId) {
    const user = this.getUserById(userId);
    const userEmail = user?.email?.toLowerCase();

    return this.state.notifications.filter(
      (n) => n.userId === userId || n.customer === userId || (userEmail && n.userEmail === userEmail)
    );
  }

  async addNotification(notif) {
    const id = `ntf_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNotif = {
      id,
      _id: id,
      userId: notif.userId,
      customer: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      isRead: false,
      is_read: false,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          customer: notif.userId,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          is_read: false,
        })
        .select('id, created_at')
        .single();
      if (error) throw error;
      newNotif.id = data.id;
      newNotif._id = data.id;
      newNotif.createdAt = data.created_at;
    }

    this.state.notifications.unshift(newNotif);
    this.saveState();
    return newNotif;
  }

  async markNotificationRead(notificationId, userId) {
    const idx = this.state.notifications.findIndex((n) => n._id === notificationId || n.id === notificationId);
    if (idx < 0 || this.state.notifications[idx].userId !== userId) {
      throw new Error('Notification not found.');
    }
    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('customer', userId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Notification was not found in the database.');
    }
    this.state.notifications[idx].isRead = true;
    this.state.notifications[idx].is_read = true;
    this.saveState();
  }

  async markAllNotificationsRead(userId) {
    if (isSupabaseEnabled) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('customer', userId);
      if (error) throw error;
    }
    this.state.notifications = this.state.notifications.map((n) => {
      if (n.userId === userId || n.customer === userId) {
        return { ...n, isRead: true, is_read: true };
      }
      return n;
    });
    this.saveState();
  }

  // ==========================================
  // ANALYTICS & DASHBOARD METRICS
  // ==========================================
  getAdminStats() {
    return buildAdminAnalytics(this.state);
  }

  getCustomerStats(customerId) {
    const user = this.getUserById(customerId);
    const userEmail = user?.email?.toLowerCase();

    const customerParcels = this.state.parcels.filter(
      (p) =>
        p.customerId === customerId ||
        p.senderId === customerId ||
        p.sender === customerId ||
        (userEmail && p.sender?.email?.toLowerCase() === userEmail)
    );

    const customerComplaints = this.state.complaints.filter(
      (c) =>
        c.customerId === customerId ||
        c.customer === customerId ||
        (userEmail && c.customerEmail?.toLowerCase() === userEmail)
    );

    const totalParcels = customerParcels.length;
    const pendingDeliveries = customerParcels.filter((p) => p.status === 'PENDING' || p.status === 'ASSIGNED').length;
    const inTransitDeliveries = customerParcels.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY').length;
    const completedDeliveries = customerParcels.filter((p) => p.status === 'DELIVERED').length;
    const failedDeliveries = customerParcels.filter((p) => p.status === 'FAILED').length;
    const activeComplaints = customerComplaints.filter((c) => c.status !== 'RESOLVED').length;

    const statusDistribution = [
      { name: 'Delivered', value: completedDeliveries, color: '#16803C' },
      { name: 'In Transit', value: inTransitDeliveries, color: '#6366F1' },
      { name: 'Pending', value: pendingDeliveries, color: '#D97706' },
      { name: 'Failed', value: failedDeliveries, color: '#DC2626' },
    ];

    return {
      totalParcels,
      pendingDeliveries,
      inTransitDeliveries,
      completedDeliveries,
      failedDeliveries,
      activeComplaints,
      statusDistribution,
    };
  }

  getEmployeeStats(employeeId) {
    const user = this.getUserById(employeeId);
    const empEmail = user?.email?.toLowerCase();

    const empDeliveries = this.state.deliveries.filter((d) => {
      if (d.assignedEmployeeId === employeeId || d.employee === employeeId) return true;
      if (empEmail) {
        const assignedUser = this.getUserById(d.assignedEmployeeId || d.employee);
        if (assignedUser?.email?.toLowerCase() === empEmail) return true;
      }
      return false;
    });

    const assignedDeliveries = empDeliveries.length;
    const activeDeliveries = empDeliveries.filter((d) =>
      ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)
    ).length;
    const completedDeliveries = empDeliveries.filter((d) => d.status === 'DELIVERED').length;
    const failedDeliveries = empDeliveries.filter((d) => d.status === 'FAILED').length;

    return {
      assignedDeliveries,
      activeDeliveries,
      completedDeliveries,
      failedDeliveries,
    };
  }
}

const store = new StoreService();
export default store;
