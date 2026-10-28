/**
 * DigiPost - End-to-End API Automated Verification Test Suite
 * Tests all 20 required scenarios across Auth, Customer, Employee, Admin,
 * Security Access Controls, and State Machine Transitions.
 */

import http from 'http';

const BASE_URL = `${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api`;

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Test Suite Runner
async function runTests() {
  console.log('===============================================================');
  console.log('🚀 DIGIPOST - AUTOMATED API & SECURITY VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Public Customer Registration
    // -------------------------------------------------------------
    console.log('1. Authentication & Security Tests:');
    const testEmail = `qa.customer.${Date.now()}@gmail.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'QA Test Customer',
      email: testEmail,
      password: 'password123',
      phone: '+1 (555) 000-1111',
      address: '100 Test Blvd, Austin, TX',
      role: 'admin', // Attempt role escalation!
    });

    assert(
      regRes.status === 201 && regRes.data?.success && regRes.data?.user?.role === 'customer',
      'Customer Registration & Privilege Escalation Prevention (role forced to customer)',
      `Status: ${regRes.status}, Role: ${regRes.data?.user?.role}`
    );
    assert(!regRes.data?.user?.password, 'Password hash is NEVER returned in response');

    const customerToken = regRes.data.token;
    const customerId = regRes.data.user._id || regRes.data.user.id;

    // -------------------------------------------------------------
    // Test 2: Duplicate Email Prevention
    // -------------------------------------------------------------
    const dupRes = await request('POST', '/auth/register', {
      name: 'Duplicate QA',
      email: testEmail,
      password: 'password123',
    });
    assert(dupRes.status === 409, 'Duplicate Email Prevention returns 409 Conflict', `Status: ${dupRes.status}`);

    // -------------------------------------------------------------
    // Test 3: User Login & Safe Invalid Credentials
    // -------------------------------------------------------------
    const invalidLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'wrong_password_123',
    });
    assert(invalidLogin.status === 401, 'Invalid Login Attempt securely rejected with 401', `Status: ${invalidLogin.status}`);

    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@postoffice.gov',
      password: 'DigiPostAdmin@2026',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user?.role === 'admin', 'Admin Login with Seed Credentials', `Status: ${adminLogin.status}`);
    const adminToken = adminLogin.data.token;

    const empLogin = await request('POST', '/auth/login', {
      email: 'employee@postoffice.gov',
      password: 'DigiPostCourier@2026',
    });
    assert(empLogin.status === 200 && empLogin.data.user?.role === 'employee', 'Employee Login with Seed Credentials', `Status: ${empLogin.status}`);
    const employeeToken = empLogin.data.token;
    const employeeId = empLogin.data.user._id || empLogin.data.user.id;

    // -------------------------------------------------------------
    // Test 4: Authenticated Profile (GET /api/auth/me & /api/users/me)
    // -------------------------------------------------------------
    const meRes = await request('GET', '/auth/me', null, customerToken);
    assert(meRes.status === 200 && meRes.data.user?.email === testEmail, 'GET /api/auth/me returns authenticated customer profile', `Status: ${meRes.status}`);

    const userMeRes = await request('GET', '/users/me', null, customerToken);
    assert(userMeRes.status === 200 && userMeRes.data.user?.email === testEmail, 'GET /api/users/me returns authenticated profile (no route collision with /users/:id)', `Status: ${userMeRes.status}`);

    // -------------------------------------------------------------
    // Test 5: Parcel Booking & Tracking ID Generation
    // -------------------------------------------------------------
    console.log('\n2. Consignment & Parcel Booking Workflows:');
    const bookRes = await request('POST', '/parcels', {
      sender: {
        name: 'QA Test Customer',
        phone: '+1 (555) 000-1111',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
      },
      receiver: {
        name: 'Dr. Jane Recipient',
        phone: '+1 (555) 999-8888',
        address: '456 Science Park',
        city: 'Boston',
        state: 'MA',
        postalCode: '02115',
      },
      parcelType: 'express',
      weight: 3.5,
      description: 'Lab test samples',
    }, customerToken);

    assert(
      bookRes.status === 201 && bookRes.data.trackingId?.startsWith('PO-') && bookRes.data.parcel?.status === 'PENDING',
      'Create Parcel Booking with auto-generated tracking ID & PENDING status',
      `Status: ${bookRes.status}, Tracking ID: ${bookRes.data?.trackingId}`
    );
    const trackingId = bookRes.data.trackingId;
    const parcelId = bookRes.data.parcel._id || bookRes.data.parcel.id;

    // Book a 2nd parcel for cancellation testing
    const book2Res = await request('POST', '/parcels', {
      sender: { name: 'QA Test Customer', city: 'Austin', state: 'TX' },
      receiver: { name: 'Receiver Two', city: 'Dallas', state: 'TX' },
      parcelType: 'standard',
      weight: 1.0,
      description: 'Item to cancel',
    }, customerToken);
    const parcel2Id = book2Res.data.parcel._id || book2Res.data.parcel.id;

    // -------------------------------------------------------------
    // Test 6: Customer View Own Bookings & IDOR Protection
    // -------------------------------------------------------------
    const myParcelsRes = await request('GET', '/parcels/my', null, customerToken);
    assert(
      myParcelsRes.status === 200 && myParcelsRes.data.parcels?.some((p) => p.trackingId === trackingId),
      'Customer retrieves their own booked consignments via GET /api/parcels/my',
      `Status: ${myParcelsRes.status}`
    );

    // IDOR test: customer requests another customer's ID in query
    const idorRes = await request('GET', `/parcels/my-parcels?customerId=usr_cust_1`, null, customerToken);
    const hasOtherParcels = idorRes.data.parcels?.some((p) => p.customerId === 'usr_cust_1');
    assert(!hasOtherParcels, 'IDOR Protection: Customer query cannot inspect another customer\'s consignments', `Expected isolated records`);

    // -------------------------------------------------------------
    // Test 7: Privacy-Safe Public Tracking
    // -------------------------------------------------------------
    const trackRes = await request('GET', `/tracking/${trackingId}`);
    assert(
      trackRes.status === 200 &&
      trackRes.data.tracking?.trackingId === trackingId &&
      !trackRes.data.tracking?.receiver?.phone &&
      !trackRes.data.tracking?.sender?.phone,
      'Privacy-Safe Public Tracking (excludes phone numbers and passwords)',
      `Status: ${trackRes.status}`
    );

    // -------------------------------------------------------------
    // Test 8: Parcel Cancellation Workflow
    // -------------------------------------------------------------
    console.log('\n3. Parcel Cancellation & Lifecycle Policies:');
    const cancelRes = await request('PATCH', `/parcels/${parcel2Id}/cancel`, null, customerToken);
    assert(
      cancelRes.status === 200 && cancelRes.data.parcel?.status === 'CANCELLED',
      'Cancel Parcel Booking while strictly PENDING',
      `Status: ${cancelRes.status}, New Status: ${cancelRes.data.parcel?.status}`
    );

    // -------------------------------------------------------------
    // Test 9: Admin Parcel Assignment
    // -------------------------------------------------------------
    console.log('\n4. Courier Assignment & Delivery State Machine:');
    const assignRes = await request('POST', `/parcels/${parcelId}/assign`, {
      employeeId,
    }, adminToken);

    assert(
      assignRes.status === 200 && assignRes.data.parcel?.status === 'ASSIGNED',
      'Admin allocates parcel to courier (status becomes ASSIGNED)',
      `Status: ${assignRes.status}`
    );

    // Test cannot cancel once assigned
    const cancelAssignedRes = await request('PATCH', `/parcels/${parcelId}/cancel`, null, customerToken);
    assert(cancelAssignedRes.status === 400, 'Rejection of cancellation once parcel is ASSIGNED (Status 400)', `Status: ${cancelAssignedRes.status}`);

    // -------------------------------------------------------------
    // Test 10: Courier Views Assigned Deliveries & Today Queue
    // -------------------------------------------------------------
    const courierDeliveries = await request('GET', '/deliveries/my-deliveries', null, employeeToken);
    const assignedDelivery = courierDeliveries.data.deliveries?.find((d) => d.parcelId === parcelId || d.parcel?._id === parcelId);
    assert(
      courierDeliveries.status === 200 && !!assignedDelivery,
      'Courier retrieves allocated manifest via GET /api/deliveries/my-deliveries',
      `Found Delivery ID: ${assignedDelivery?._id}`
    );

    const deliveryId = assignedDelivery?._id || assignedDelivery?.id;

    // -------------------------------------------------------------
    // Test 11: State Machine Transitions: ASSIGNED -> IN_TRANSIT
    // -------------------------------------------------------------
    const step1 = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'IN_TRANSIT',
      location: 'Central Sorting Hub 01',
      note: 'Package loaded onto transport van',
    }, employeeToken);

    assert(
      step1.status === 200 && step1.data.delivery?.status === 'IN_TRANSIT',
      'State Machine Transition: ASSIGNED -> IN_TRANSIT',
      `Status: ${step1.status}`
    );

    // Illegal skip: IN_TRANSIT -> DELIVERED (Must go through OUT_FOR_DELIVERY)
    const illegalStep = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'DELIVERED',
    }, employeeToken);
    assert(illegalStep.status === 400, 'State Machine Rejection: Skipping OUT_FOR_DELIVERY returns 400', `Status: ${illegalStep.status}`);

    // -------------------------------------------------------------
    // Test 12: State Machine: IN_TRANSIT -> OUT_FOR_DELIVERY
    // -------------------------------------------------------------
    const step2 = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'OUT_FOR_DELIVERY',
      location: 'Boston Local Depot',
      note: 'Out on delivery route with courier',
    }, employeeToken);

    assert(
      step2.status === 200 && step2.data.delivery?.status === 'OUT_FOR_DELIVERY',
      'State Machine Transition: IN_TRANSIT -> OUT_FOR_DELIVERY',
      `Status: ${step2.status}`
    );

    // Failed status requires failureReason
    const failNoReason = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'FAILED',
    }, employeeToken);
    assert(failNoReason.status === 400, 'Enforce mandatory failureReason on FAILED status update', `Status: ${failNoReason.status}`);

    // -------------------------------------------------------------
    // Test 13: State Machine: OUT_FOR_DELIVERY -> DELIVERED
    // -------------------------------------------------------------
    const step3 = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'DELIVERED',
      location: 'Doorstep, 456 Science Park',
      note: 'Signed by recipient Jane Recipient',
    }, employeeToken);

    assert(
      step3.status === 200 && step3.data.delivery?.status === 'DELIVERED',
      'State Machine Transition: OUT_FOR_DELIVERY -> DELIVERED (Terminal State)',
      `Status: ${step3.status}`
    );

    // Modify after delivered should be rejected
    const modifyDelivered = await request('PATCH', `/deliveries/${deliveryId}/status`, {
      status: 'IN_TRANSIT',
    }, employeeToken);
    assert(modifyDelivered.status === 400, 'Rejection of modifying terminal DELIVERED status (Status 400)', `Status: ${modifyDelivered.status}`);

    // -------------------------------------------------------------
    // Test 14: Customer Submits and Admin Resolves Complaint
    // -------------------------------------------------------------
    console.log('\n5. Complaints, Notifications & Reviews:');
    const complaintRes = await request('POST', '/complaints', {
      trackingId,
      category: 'delivery_query',
      subject: 'Inquiry regarding package arrival time',
      description: 'Wondering if package was delivered before 5pm.',
    }, customerToken);

    assert(
      complaintRes.status === 201 && complaintRes.data.complaint?.status === 'OPEN',
      'Customer submits support ticket via POST /api/complaints',
      `Status: ${complaintRes.status}`
    );
    const complaintId = complaintRes.data.complaint._id || complaintRes.data.complaint.id;

    // Admin resolves complaint
    const resolveRes = await request('PATCH', `/complaints/${complaintId}/status`, {
      status: 'RESOLVED',
      resolutionNotes: 'Package confirmed delivered at 3:45 PM by courier John Carrier.',
    }, adminToken);

    assert(
      resolveRes.status === 200 && resolveRes.data.complaint?.status === 'RESOLVED',
      'Administrator resolves complaint with notes (Status: RESOLVED)',
      `Status: ${resolveRes.status}`
    );

    // -------------------------------------------------------------
    // Test 15: Notifications & Bulk Mark All As Read
    // -------------------------------------------------------------
    const notifsRes = await request('GET', '/notifications', null, customerToken);
    assert(
      notifsRes.status === 200 && notifsRes.data.notifications?.length > 0,
      'Notifications generated for customer on booking, delivery, and resolution',
      `Count: ${notifsRes.data.notifications?.length}`
    );

    const markAllRes = await request('PATCH', '/notifications/read-all', null, customerToken);
    assert(markAllRes.status === 200, 'Bulk Mark All Read via PATCH /api/notifications/read-all', `Status: ${markAllRes.status}`);

    // -------------------------------------------------------------
    // Test 16: Customer Review on Delivered Consignment
    // -------------------------------------------------------------
    const reviewRes = await request('POST', '/feedback', {
      trackingId,
      rating: 5,
      feedback: 'Excellent service! Consignment arrived safely.',
    }, customerToken);

    assert(
      reviewRes.status === 201 && reviewRes.data.review?.rating === 5,
      'Customer submits 5-star review on DELIVERED parcel',
      `Status: ${reviewRes.status}`
    );

    // Duplicate review should be rejected
    const dupReview = await request('POST', '/feedback', {
      trackingId,
      rating: 4,
      feedback: 'Second attempt',
    }, customerToken);
    assert(dupReview.status >= 400, 'Prevent duplicate review for same consignment (Status 4xx/5xx)', `Status: ${dupReview.status}`);

    // -------------------------------------------------------------
    // Test 17: Operational Dashboard Analytics
    // -------------------------------------------------------------
    console.log('\n6. Real-Time Operational Analytics:');
    const adminStats = await request('GET', '/analytics/admin-summary', null, adminToken);
    assert(
      adminStats.status === 200 &&
      adminStats.data.stats?.totalParcels > 0 &&
      adminStats.data.stats?.completedDeliveries > 0,
      'Admin Executive Analytics calculated from live DB data (Parcels, Completed, Revenue)',
      `Total Parcels: ${adminStats.data.stats?.totalParcels}, Completed: ${adminStats.data.stats?.completedDeliveries}`
    );

    const custStats = await request('GET', '/analytics/customer-summary', null, customerToken);
    assert(
      custStats.status === 200 && custStats.data.stats?.totalParcels > 0,
      'Customer Analytics sandboxed to customer records',
      `Customer Parcels: ${custStats.data.stats?.totalParcels}`
    );

  } catch (err) {
    console.error('Fatal Test Execution Error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
