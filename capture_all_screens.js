import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_OUTPUT_DIR = path.resolve('screenshots');
const ARTIFACT_OUTPUT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\09f3a7fc-9776-40d8-9cae-d7255cfb3b81\\screenshots';

for (const dir of [LOCAL_OUTPUT_DIR, ARTIFACT_OUTPUT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const customerUser = {
  _id: 'usr_cust_1',
  id: 'usr_cust_1',
  name: 'Sarah Jenkins',
  email: 'sarah.customer@gmail.com',
  phone: '+1 (555) 912-3456',
  role: 'customer',
  address: '742 Evergreen Terrace, Springfield, IL 62704',
  status: 'active'
};

const employeeUser = {
  _id: 'usr_emp_1',
  id: 'usr_emp_1',
  name: 'John Carrier',
  email: 'employee@postoffice.gov',
  altEmail: 'john.carrier@postoffice.gov',
  phone: '+1 (555) 234-5678',
  role: 'employee',
  station: 'Central Sorting Hub 01',
  status: 'active'
};

const adminUser = {
  _id: 'usr_admin_1',
  id: 'usr_admin_1',
  name: 'Victoria Stirling',
  email: 'admin@postoffice.gov',
  phone: '+1 (555) 019-2831',
  role: 'admin',
  station: 'Headquarters - Central Command',
  status: 'active'
};

async function setSession(page, user) {
  await page.evaluate((u) => {
    if (!u) {
      localStorage.removeItem('poas_auth_user');
      localStorage.removeItem('poas_auth_token');
    } else {
      localStorage.setItem('poas_auth_user', JSON.stringify(u));
      localStorage.setItem('poas_auth_token', `mock_jwt_token_${u._id}_${Date.now()}`);
    }
  }, user);
}

async function captureScreen(page, route, filename, options = {}) {
  const { user = null, preAction = null, waitTime = 1200 } = options;
  console.log(`[Capturing] ${filename} -> route: ${route}`);

  if (user !== undefined) {
    await setSession(page, user);
  }

  await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, waitTime));

  if (preAction) {
    try {
      await preAction(page);
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      console.warn(`preAction error on ${filename}:`, e.message);
    }
  }

  const localFile = path.join(LOCAL_OUTPUT_DIR, filename);
  const artifactFile = path.join(ARTIFACT_OUTPUT_DIR, filename);

  await page.screenshot({ path: localFile, fullPage: false });
  fs.copyFileSync(localFile, artifactFile);
  console.log(`✓ Saved: ${filename}`);
}

async function run() {
  console.log('Launching Chrome for full workflow visual capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 1.5 });

  // Clear any existing session
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await setSession(page, null);

  // ==========================================
  // PHASE 1: PUBLIC PORTAL & AUTHENTICATION
  // ==========================================
  console.log('\n--- PHASE 1: PUBLIC & AUTHENTICATION ---');
  await captureScreen(page, '/', '01_landing_page.png', { user: null });
  await captureScreen(page, '/track', '02_public_tracking.png', {
    user: null,
    preAction: async (p) => {
      const input = await p.$('input');
      if (input) {
        await input.type('PO-84920184');
        const btn = await p.$('button[type="submit"], button.bg-primary-600, form button');
        if (btn) await btn.click();
      }
    }
  });
  await captureScreen(page, '/login', '03_login_page.png', { user: null });
  await captureScreen(page, '/register', '04_register_page.png', { user: null });

  // ==========================================
  // PHASE 2: CUSTOMER CONSIGNMENT & SERVICES
  // ==========================================
  console.log('\n--- PHASE 2: CUSTOMER CONSIGNMENT & SERVICES ---');
  await captureScreen(page, '/customer/dashboard', '05_customer_dashboard.png', { user: customerUser });
  await captureScreen(page, '/customer/book', '06_customer_book_parcel.png', { user: customerUser });
  await captureScreen(page, '/customer/book', '07_customer_book_parcel_calculated.png', {
    user: customerUser,
    preAction: async (p) => {
      // Fill out parcel booking form to show live rate calculation
      const inputs = await p.$$('input');
      if (inputs.length >= 6) {
        // Receiver details
        await inputs[3]?.type('Robert Vance');
        await inputs[4]?.type('+1 (555) 777-8899');
        await inputs[5]?.type('340 Madison Ave, New York, NY 10017');
      }
    }
  });
  await captureScreen(page, '/customer/parcels', '08_customer_my_parcels.png', { user: customerUser });
  await captureScreen(page, '/customer/parcels/PO-84920184', '09_customer_parcel_tracking_details.png', { user: customerUser });
  await captureScreen(page, '/customer/complaints', '10_customer_complaints.png', { user: customerUser });
  await captureScreen(page, '/customer/feedback', '11_customer_feedback.png', { user: customerUser });
  await captureScreen(page, '/customer/notifications', '12_customer_notifications.png', { user: customerUser });
  await captureScreen(page, '/customer/profile', '13_customer_profile.png', { user: customerUser });

  // ==========================================
  // PHASE 3: POSTAL COURIER / FIELD OPERATIONS
  // ==========================================
  console.log('\n--- PHASE 3: POSTAL COURIER & FIELD OPERATIONS ---');
  await captureScreen(page, '/employee/dashboard', '14_employee_dashboard.png', { user: employeeUser });
  await captureScreen(page, '/employee/deliveries', '15_employee_assigned_deliveries.png', { user: employeeUser });
  await captureScreen(page, '/employee/deliveries/del_001', '16_employee_delivery_details.png', { user: employeeUser });
  await captureScreen(page, '/employee/status-update', '17_employee_status_update.png', { user: employeeUser });
  await captureScreen(page, '/employee/history', '18_employee_delivery_history.png', { user: employeeUser });
  await captureScreen(page, '/employee/notifications', '19_employee_notifications.png', { user: employeeUser });
  await captureScreen(page, '/employee/profile', '20_employee_profile.png', { user: employeeUser });

  // ==========================================
  // PHASE 4: ADMINISTRATOR OPERATIONS COMMAND
  // ==========================================
  console.log('\n--- PHASE 4: ADMINISTRATOR OPERATIONS COMMAND ---');
  await captureScreen(page, '/admin/dashboard', '21_admin_command_center.png', { user: adminUser, waitTime: 1800 });
  await captureScreen(page, '/admin/parcels', '22_admin_parcel_management.png', { user: adminUser });
  await captureScreen(page, '/admin/assignment', '23_admin_delivery_assignment.png', { user: adminUser });
  await captureScreen(page, '/admin/deliveries', '24_admin_delivery_monitoring.png', { user: adminUser });
  await captureScreen(page, '/admin/employees', '25_admin_employee_fleet_management.png', { user: adminUser });
  await captureScreen(page, '/admin/customers', '26_admin_customer_management.png', { user: adminUser });
  await captureScreen(page, '/admin/complaints', '27_admin_complaint_resolution.png', { user: adminUser });
  await captureScreen(page, '/admin/reports', '28_admin_reports_analytics.png', { user: adminUser, waitTime: 1800 });
  await captureScreen(page, '/admin/profile', '29_admin_profile.png', { user: adminUser });

  await browser.close();
  console.log('\n🎉 ALL 29 UI WORKFLOW SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Capture pipeline failed:', err);
  process.exit(1);
});
