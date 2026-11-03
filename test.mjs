import assert from 'node:assert';
import fs from 'node:fs';
import { handleApiRequest } from './server/api-router.mjs';

console.log('🧪 Starting Trade-in Reconciliation Automation Tests...\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

async function request(path, opts = {}) {
  const url = `http://localhost${path}`;
  const req = new Request(url, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const res = await handleApiRequest(req);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

(async () => {
  // --- Test 1: Public Config ---
  await runTest('1. GET /api/config returns valid monetization configuration', async () => {
    const res = await request('/api/config');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.pricing, 'pricing missing');
    assert.strictEqual(res.data.pricing.detailedReport, 49);
    assert.strictEqual(res.data.pricing.advancedAnalysis, 99);
    assert.ok(Array.isArray(res.data.affiliates), 'affiliates missing');
    assert.ok(res.data.affiliates.length > 0, 'no affiliates');
    assert.ok(res.data.ads, 'ads config missing');
    assert.ok(res.data.whatsappNumber, 'whatsappNumber missing');
  });

  // --- Test 2: Razorpay Order Creation ---
  let detailedOrder;
  await runTest('2. POST /api/create-order generates order for detailed report (₹49)', async () => {
    const res = await request('/api/create-order', {
      method: 'POST',
      body: { reportType: 'detailed', customerEmail: 'test@finance.com' },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.orderId);
    assert.strictEqual(res.data.amount, 4900); // 49 INR in paise
    assert.strictEqual(res.data.currency, 'INR');
    detailedOrder = res.data;
  });

  await runTest('3. POST /api/create-order generates order for advanced report (₹99)', async () => {
    const res = await request('/api/create-order', {
      method: 'POST',
      body: { reportType: 'advanced' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.amount, 9900); // 99 INR in paise
  });

  await runTest('4. POST /api/create-order rejects invalid report type', async () => {
    const res = await request('/api/create-order', {
      method: 'POST',
      body: { reportType: 'unauthorized_type' },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error);
  });

  // --- Test 3: Razorpay Payment Verification ---
  await runTest('5. POST /api/verify-payment validates valid test payment & records transaction', async () => {
    const res = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        orderId: detailedOrder.orderId,
        paymentId: 'pay_test_' + Date.now(),
        signature: 'sig_dev_valid',
        reportType: 'detailed',
        customerEmail: 'test@finance.com',
      },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.verified);
    assert.ok(res.data.token, 'Verification token missing');
  });

  await runTest('6. POST /api/verify-payment rejects invalid signature', async () => {
    const res = await request('/api/verify-payment', {
      method: 'POST',
      body: {
        orderId: 'order_live_123',
        paymentId: 'pay_live_456',
        signature: 'invalid_bad_sig',
        reportType: 'detailed',
      },
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // --- Test 4: Custom Report Requests ---
  let customTicketId;
  await runTest('7. POST /api/custom-request captures custom template enquiry', async () => {
    const res = await request('/api/custom-request', {
      method: 'POST',
      body: {
        companyName: 'Acme Retailers Pvt Ltd',
        contactName: 'Finance Manager',
        email: 'accounts@acme.in',
        phone: '+91 98765 00000',
        erpSystem: 'SAP S/4HANA',
        requirements: 'Need custom 5-way matching for multi-store trade-in registers and debit note generation.',
      },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.ticketId.startsWith('REQ-'));
    customTicketId = res.data.ticketId;
  });

  await runTest('8. POST /api/custom-request validates mandatory fields', async () => {
    const res = await request('/api/custom-request', {
      method: 'POST',
      body: { companyName: '' },
    });
    assert.strictEqual(res.status, 400);
  });

  // --- Test 5: Business Consulting Leads ---
  let leadId;
  await runTest('9. POST /api/leads captures enterprise automation lead with consent', async () => {
    const res = await request('/api/leads', {
      method: 'POST',
      body: {
        fullName: 'Rajesh Sharma',
        company: 'Mega Devices India Ltd',
        email: 'rajesh@megadevices.com',
        phone: '+91 99999 88888',
        businessSize: '10,000 - 50,000 records',
        serviceType: 'Full Automation Pipeline',
        message: 'Looking for automated daily Servify ledger synchronization and dispute tracking.',
        callbackRequested: true,
        consent: true,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.leadId.startsWith('LEAD-'));
    leadId = res.data.leadId;
  });

  await runTest('10. POST /api/leads rejects lead submission without communication consent', async () => {
    const res = await request('/api/leads', {
      method: 'POST',
      body: {
        fullName: 'Test User',
        company: 'Test Corp',
        email: 'test@test.com',
        consent: false,
      },
    });
    assert.strictEqual(res.status, 400);
  });

  // --- Test 6: Admin Authentication & Security ---
  let adminToken;
  await runTest('11. POST /api/admin/login rejects incorrect password', async () => {
    const res = await request('/api/admin/login', {
      method: 'POST',
      body: { password: 'wrong_password_xyz' },
    });
    assert.strictEqual(res.status, 401);
  });

  await runTest('12. POST /api/admin/login authenticates with valid admin password', async () => {
    const res = await request('/api/admin/login', {
      method: 'POST',
      body: { password: 'admin123' },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, 'Token missing');
    adminToken = res.data.token;
  });

  await runTest('13. Protected admin routes block unauthorized access', async () => {
    const res = await request('/api/admin/data');
    assert.strictEqual(res.status, 401);
  });

  await runTest('14. GET /api/admin/data returns all store records with valid bearer token', async () => {
    const res = await request('/api/admin/data', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.analytics, 'analytics missing');
    assert.ok(Array.isArray(res.data.transactions), 'transactions missing');
    assert.ok(Array.isArray(res.data.customRequests), 'customRequests missing');
    assert.ok(Array.isArray(res.data.leads), 'leads missing');
    assert.ok(res.data.analytics.totalTransactions >= 1, 'transaction was not counted');
  });

  await runTest('15. POST /api/admin/settings updates AdSense & pricing', async () => {
    const res = await request('/api/admin/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        adsEnabled: true,
        adsensePublisherId: 'ca-pub-1234567890123456',
        pricing: { detailedReport: 59, advancedAnalysis: 119 },
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.settings.adsEnabled, true);
    assert.strictEqual(res.data.settings.pricing.detailedReport, 59);

    // Revert for clean state
    await request('/api/admin/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        adsEnabled: false,
        adsensePublisherId: '',
        pricing: { detailedReport: 49, advancedAnalysis: 99 },
      },
    });
  });

  // --- Test 7: Backward Compatibility of Core Application ---
  await runTest('16. Core index.html preserves original reconciliation functions and IDs', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    const requiredIds = ['d1', 'd2', 'f1', 'f2', 'gst', 'incl', 'tol', 'run', 'st', 'pg', 'out', 'tabs', 'view'];
    for (const id of requiredIds) {
      assert.ok(html.includes(`id="${id}"`), `Missing required element ID: ${id}`);
    }

    const requiredFunctions = ['function run()', 'function render()', 'function buildOut(', 'function compare()', 'function save('];
    for (const fn of requiredFunctions) {
      assert.ok(html.includes(fn), `Missing core function: ${fn}`);
    }

    const requiredSheets = ['Trade in Register', 'Servify Customer Statement', 'Invoice No Report'];
    for (const sheet of requiredSheets) {
      assert.ok(html.includes(sheet), `Missing core sheet reference: ${sheet}`);
    }
  });

  console.log(`\n🎉 Test Results: ${passedTests}/${totalTests} tests passed.\n`);
})();

