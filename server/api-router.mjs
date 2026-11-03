import crypto from 'node:crypto';
import {
  getPublicConfig,
  getAdminAllData,
  updateSettings,
  saveAffiliate,
  deleteAffiliate,
  saveSponsor,
  deleteSponsor,
  recordTransaction,
  recordCustomRequest,
  updateCustomRequestStatus,
  recordLead,
  updateLeadStatus,
  getStoreData,
} from './storage.mjs';
import { createOrder, verifyPaymentSignature } from './razorpay.mjs';
import { loginAdmin, verifyAdminToken, getBearerToken } from './admin-auth.mjs';

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...extraHeaders,
    },
  });
}

function parseUrl(urlStr) {
  try {
    return new URL(urlStr, 'http://localhost');
  } catch {
    return { pathname: urlStr, searchParams: new URLSearchParams() };
  }
}

export async function handleApiRequest(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = parseUrl(req.url);
  const pathname = url.pathname;
  const headers = Object.fromEntries(req.headers.entries());

  try {
    // 1. Public Configuration
    if (pathname === '/api/config' && req.method === 'GET') {
      const config = await getPublicConfig();
      return jsonResponse(config);
    }

    // 2. Razorpay Order Creation
    if (pathname === '/api/create-order' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { reportType, customerEmail, customerPhone } = body;

      if (!reportType || !['detailed', 'advanced'].includes(reportType)) {
        return jsonResponse({ error: 'Invalid report type requested. Must be "detailed" or "advanced".' }, 400);
      }

      const store = await getStoreData();
      const pricing = store.settings.pricing || { detailedReport: 49, advancedAnalysis: 99 };
      const amount = reportType === 'detailed' ? pricing.detailedReport : pricing.advancedAnalysis;

      const order = await createOrder({
        amountInINR: amount,
        reportType,
        customerEmail,
        customerPhone,
      });

      return jsonResponse({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isDemo: order.isDemo,
        keyId: store.settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '',
        receipt: order.receipt,
      });
    }

    // 3. Payment Verification
    if (pathname === '/api/verify-payment' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { orderId, paymentId, signature, reportType, customerEmail, customerPhone } = body;

      const verification = verifyPaymentSignature({ orderId, paymentId, signature });
      if (!verification.valid) {
        return jsonResponse({ success: false, error: verification.error || 'Payment verification failed.' }, 400);
      }

      const store = await getStoreData();
      const pricing = store.settings.pricing || { detailedReport: 49, advancedAnalysis: 99 };
      const amount = reportType === 'detailed' ? pricing.detailedReport : pricing.advancedAnalysis;

      const verificationToken = crypto.randomUUID();
      const transaction = {
        id: 'tx_' + Date.now(),
        orderId,
        paymentId,
        signature,
        reportType,
        amount,
        currency: 'INR',
        status: 'verified',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        isDemo: Boolean(verification.isDemo),
        timestamp: new Date().toISOString(),
        verificationToken,
      };

      await recordTransaction(transaction);

      return jsonResponse({
        success: true,
        verified: true,
        transactionId: paymentId,
        orderId,
        token: verificationToken,
        reportType,
        timestamp: transaction.timestamp,
        isDemo: verification.isDemo,
      });
    }

    // 4. Custom Report Request
    if (pathname === '/api/custom-request' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { companyName, contactName, email, phone, reportType, erpSystem, requirements } = body;

      if (!companyName || !email || !requirements) {
        return jsonResponse({ error: 'Company name, email, and requirements are required.' }, 400);
      }

      const ticketId = 'REQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
      const newRequest = {
        id: ticketId,
        companyName: String(companyName).trim(),
        contactName: String(contactName || '').trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone || '').trim(),
        reportType: String(reportType || 'Custom Template').trim(),
        erpSystem: String(erpSystem || '').trim(),
        requirements: String(requirements).trim(),
        status: 'new',
        submittedAt: new Date().toISOString(),
        notes: '',
      };

      await recordCustomRequest(newRequest);

      return jsonResponse({
        success: true,
        ticketId,
        message: 'Custom report request submitted successfully. Our engineering team will review and contact you within 24 hours.',
      });
    }

    // 5. Business Consulting Lead
    if (pathname === '/api/leads' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { fullName, company, email, phone, businessSize, serviceType, message, callbackRequested, callbackTime, consent } = body;

      if (!fullName || !email || !company) {
        return jsonResponse({ error: 'Full name, company, and email are required.' }, 400);
      }
      if (!consent) {
        return jsonResponse({ error: 'Consent to contact is required.' }, 400);
      }

      const leadId = 'LEAD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
      const newLead = {
        id: leadId,
        fullName: String(fullName).trim(),
        company: String(company).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone || '').trim(),
        businessSize: String(businessSize || 'Small/Medium').trim(),
        serviceType: String(serviceType || 'Reconciliation Automation').trim(),
        message: String(message || '').trim(),
        callbackRequested: Boolean(callbackRequested),
        callbackTime: String(callbackTime || '').trim(),
        consent: true,
        status: 'new',
        submittedAt: new Date().toISOString(),
        notes: '',
      };

      await recordLead(newLead);

      return jsonResponse({
        success: true,
        leadId,
        message: 'Thank you for reaching out! A finance automation consultant will contact you shortly.',
      });
    }

    // 6. Admin Login
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { password } = body;
      const result = loginAdmin(password);
      if (!result.success) {
        return jsonResponse({ success: false, error: result.error }, 401);
      }
      return jsonResponse(result);
    }

    // --- PROTECTED ADMIN ROUTES ---
    if (pathname.startsWith('/api/admin/')) {
      const token = getBearerToken(headers);
      const auth = verifyAdminToken(token);
      if (!auth.valid) {
        return jsonResponse({ error: auth.error || 'Unauthorized' }, 401);
      }

      // GET /api/admin/data
      if (pathname === '/api/admin/data' && req.method === 'GET') {
        const data = await getAdminAllData();
        return jsonResponse(data);
      }

      // POST /api/admin/settings
      if (pathname === '/api/admin/settings' && req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        const updated = await updateSettings(body);
        return jsonResponse({ success: true, settings: updated });
      }

      // POST /api/admin/affiliates
      if (pathname === '/api/admin/affiliates' && req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        const saved = await saveAffiliate(body);
        return jsonResponse({ success: true, affiliate: saved });
      }

      // DELETE /api/admin/affiliates/:id
      if (pathname.startsWith('/api/admin/affiliates/') && req.method === 'DELETE') {
        const id = pathname.replace('/api/admin/affiliates/', '');
        await deleteAffiliate(id);
        return jsonResponse({ success: true });
      }

      // POST /api/admin/sponsors
      if (pathname === '/api/admin/sponsors' && req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        const saved = await saveSponsor(body);
        return jsonResponse({ success: true, sponsor: saved });
      }

      // DELETE /api/admin/sponsors/:id
      if (pathname.startsWith('/api/admin/sponsors/') && req.method === 'DELETE') {
        const id = pathname.replace('/api/admin/sponsors/', '');
        await deleteSponsor(id);
        return jsonResponse({ success: true });
      }

      // POST /api/admin/custom-requests/:id/status
      if (pathname.includes('/api/admin/custom-requests/') && pathname.endsWith('/status') && req.method === 'POST') {
        const id = pathname.split('/')[4];
        const body = await req.json().catch(() => ({}));
        const updated = await updateCustomRequestStatus(id, body.status, body.notes);
        if (!updated) return jsonResponse({ error: 'Request not found' }, 404);
        return jsonResponse({ success: true, request: updated });
      }

      // POST /api/admin/leads/:id/status
      if (pathname.includes('/api/admin/leads/') && pathname.endsWith('/status') && req.method === 'POST') {
        const id = pathname.split('/')[4];
        const body = await req.json().catch(() => ({}));
        const updated = await updateLeadStatus(id, body.status, body.notes);
        if (!updated) return jsonResponse({ error: 'Lead not found' }, 404);
        return jsonResponse({ success: true, lead: updated });
      }
    }

    return jsonResponse({ error: 'Endpoint not found: ' + pathname }, 404);
  } catch (err) {
    console.error('API Error:', err);
    return jsonResponse({ error: 'Internal Server Error: ' + err.message }, 500);
  }
}

