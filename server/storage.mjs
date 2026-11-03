import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DATA_DIR = isServerless ? path.join(os.tmpdir(), '.recon_data') : path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let memStore = null;

const DEFAULT_STORE = {
  settings: {
    adsEnabled: false,
    adsensePublisherId: process.env.ADSENSE_PUBLISHER_ID || '',
    adsenseSlotId: process.env.ADSENSE_SLOT_ID || '',
    pricing: {
      detailedReport: 49,
      advancedAnalysis: 99,
      customReportMin: 1999,
    },
    whatsappNumber: process.env.WHATSAPP_NUMBER || '+91 8169832448',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@reconciliation-automation.com',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  },
  affiliates: [
    {
      id: 'aff-zoho-books',
      name: 'Zoho Books GST Accounting',
      category: 'Accounting & ERP',
      description: 'End-to-end cloud accounting with automated GST reconciliation, multi-entity support, and automated bank feeds.',
      cta: 'Explore Zoho Books',
      url: 'https://www.zoho.com/books/',
      badge: 'Popular for GST',
      icon: '📊',
      active: true,
      order: 1,
    },
    {
      id: 'aff-cleartax',
      name: 'ClearTax GST & ITC Matcher',
      category: 'Tax & Compliance',
      description: 'AI-assisted GSTR-2B vs Books reconciliation with automated ITC mismatch detection and vendor communication.',
      cta: 'Try ClearTax',
      url: 'https://cleartax.in/s/gst-software',
      badge: 'ITC Automation',
      icon: '🛡️',
      active: true,
      order: 2,
    },
    {
      id: 'aff-tally-cloud',
      name: 'TallyPrime on Cloud',
      category: 'Accounting & ERP',
      description: 'Access your Tally data from anywhere with enterprise cloud hosting, automated daily backups, and bank-grade security.',
      cta: 'View Cloud Hosting',
      url: 'https://tallysolutions.com/',
      badge: 'Enterprise',
      icon: '☁️',
      active: true,
      order: 3,
    },
    {
      id: 'aff-excel-power',
      name: 'Microsoft 365 Copilot for Excel',
      category: 'Spreadsheet Automation',
      description: 'Supercharge your finance spreadsheets with formula generation, automated variance analysis, and Copilot AI assistance.',
      cta: 'Learn More',
      url: 'https://www.microsoft.com/microsoft-365/excel',
      badge: 'Productivity',
      icon: '📈',
      active: true,
      order: 4,
    },
    {
      id: 'aff-tradein-crm',
      name: 'ReconPro Trade-in CRM',
      category: 'Trade-in Software',
      description: 'Purpose-built trade-in management and buyback tracking platform for electronics and smartphone retail chains.',
      cta: 'Request Demo',
      url: 'https://example.com/reconpro',
      badge: 'Retail Tech',
      icon: '📱',
      active: true,
      order: 5,
    },
  ],
  sponsors: [
    {
      id: 'sp-finops-core',
      name: 'Apex Finance Automation',
      tagline: 'Custom ERP Reconciliation Pipelines for Enterprise Retail',
      description: 'Automate high-volume invoice matching, Servify ledger synchronization, and SAP/Oracle integrations without engineering overhead.',
      logoUrl: '',
      targetUrl: 'https://example.com/apex-finance',
      badgeText: 'Featured Partner',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true,
      placement: 'secondary',
    },
  ],
  transactions: [],
  customRequests: [],
  leads: [],
};

// Netlify Blobs detection
let blobStore = null;
async function getBlobStore() {
  if (blobStore) return blobStore;
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
    try {
      const { getStore } = await import('@netlify/blobs');
      blobStore = getStore('reconciliation-monetization');
      return blobStore;
    } catch {
      // Blobs unavailable in local environment
    }
  }
  return null;
}

// Local file storage helper with in-memory fallback
function loadLocalStore() {
  if (memStore) return memStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      memStore = JSON.parse(JSON.stringify(DEFAULT_STORE));
      return memStore;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    memStore = {
      ...DEFAULT_STORE,
      ...parsed,
      settings: { ...DEFAULT_STORE.settings, ...(parsed.settings || {}) },
    };
    return memStore;
  } catch (err) {
    console.warn('Local store read warning, using in-memory default store:', err.message);
    memStore = memStore || JSON.parse(JSON.stringify(DEFAULT_STORE));
    return memStore;
  }
}

function saveLocalStore(data) {
  memStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Local store write warning, retained in memory:', err.message);
  }
}

// Core unified read
export async function getStoreData() {
  const blobs = await getBlobStore();
  if (blobs) {
    try {
      const val = await blobs.get('main_store', { type: 'json' });
      if (val) {
        return {
          ...DEFAULT_STORE,
          ...val,
          settings: { ...DEFAULT_STORE.settings, ...(val.settings || {}) },
        };
      }
      // Initialize blob store with default store
      await blobs.setJSON('main_store', DEFAULT_STORE);
      return JSON.parse(JSON.stringify(DEFAULT_STORE));
    } catch (err) {
      console.warn('Failed reading from Netlify Blobs, falling back to local file:', err);
    }
  }
  return loadLocalStore();
}

// Core unified write
export async function saveStoreData(data) {
  const blobs = await getBlobStore();
  if (blobs) {
    try {
      await blobs.setJSON('main_store', data);
      return;
    } catch (err) {
      console.warn('Failed writing to Netlify Blobs, falling back to local file:', err);
    }
  }
  saveLocalStore(data);
}

// --- High level getters & setters ---

export async function getPublicConfig() {
  const data = await getStoreData();
  const now = new Date().toISOString().slice(0, 10);

  // Filter active sponsors valid for today
  const activeSponsors = (data.sponsors || []).filter(
    (s) => s.active && (!s.startDate || s.startDate <= now) && (!s.endDate || s.endDate >= now)
  );

  // Filter active affiliates
  const activeAffiliates = (data.affiliates || [])
    .filter((a) => a.active)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return {
    ads: {
      enabled: Boolean(data.settings.adsEnabled),
      publisherId: data.settings.adsensePublisherId || process.env.ADSENSE_PUBLISHER_ID || '',
      slotId: data.settings.adsenseSlotId || process.env.ADSENSE_SLOT_ID || '',
    },
    pricing: data.settings.pricing || DEFAULT_STORE.settings.pricing,
    razorpayKeyId: data.settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '',
    whatsappNumber: data.settings.whatsappNumber || DEFAULT_STORE.settings.whatsappNumber,
    supportEmail: data.settings.supportEmail || DEFAULT_STORE.settings.supportEmail,
    sponsors: activeSponsors,
    affiliates: activeAffiliates,
  };
}

export async function getAdminAllData() {
  const data = await getStoreData();
  return {
    settings: data.settings,
    affiliates: data.affiliates || [],
    sponsors: data.sponsors || [],
    transactions: data.transactions || [],
    customRequests: data.customRequests || [],
    leads: data.leads || [],
    analytics: calculateAnalytics(data),
  };
}

function calculateAnalytics(data) {
  const txs = data.transactions || [];
  const paidTxs = txs.filter((t) => t.status === 'paid' || t.status === 'verified');
  const totalRevenue = paidTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return {
    totalRevenueInINR: totalRevenue,
    totalTransactions: paidTxs.length,
    detailedReportsSold: paidTxs.filter((t) => t.reportType === 'detailed').length,
    advancedReportsSold: paidTxs.filter((t) => t.reportType === 'advanced').length,
    totalCustomRequests: (data.customRequests || []).length,
    pendingCustomRequests: (data.customRequests || []).filter((r) => r.status === 'new' || r.status === 'pending').length,
    totalLeads: (data.leads || []).length,
    newLeads: (data.leads || []).filter((l) => l.status === 'new').length,
    activeAffiliatesCount: (data.affiliates || []).filter((a) => a.active).length,
    activeSponsorsCount: (data.sponsors || []).filter((s) => s.active).length,
  };
}

export async function updateSettings(newSettings) {
  const data = await getStoreData();
  data.settings = {
    ...data.settings,
    ...newSettings,
    pricing: {
      ...data.settings.pricing,
      ...(newSettings.pricing || {}),
    },
  };
  await saveStoreData(data);
  return data.settings;
}

// Affiliates CRUD
export async function saveAffiliate(item) {
  const data = await getStoreData();
  data.affiliates = data.affiliates || [];
  if (!item.id) {
    item.id = 'aff-' + Date.now();
  }
  const idx = data.affiliates.findIndex((a) => a.id === item.id);
  if (idx >= 0) {
    data.affiliates[idx] = { ...data.affiliates[idx], ...item };
  } else {
    data.affiliates.push(item);
  }
  await saveStoreData(data);
  return item;
}

export async function deleteAffiliate(id) {
  const data = await getStoreData();
  data.affiliates = (data.affiliates || []).filter((a) => a.id !== id);
  await saveStoreData(data);
  return { success: true };
}

// Sponsors CRUD
export async function saveSponsor(item) {
  const data = await getStoreData();
  data.sponsors = data.sponsors || [];
  if (!item.id) {
    item.id = 'sp-' + Date.now();
  }
  const idx = data.sponsors.findIndex((s) => s.id === item.id);
  if (idx >= 0) {
    data.sponsors[idx] = { ...data.sponsors[idx], ...item };
  } else {
    data.sponsors.push(item);
  }
  await saveStoreData(data);
  return item;
}

export async function deleteSponsor(id) {
  const data = await getStoreData();
  data.sponsors = (data.sponsors || []).filter((s) => s.id !== id);
  await saveStoreData(data);
  return { success: true };
}

// Transactions
export async function recordTransaction(tx) {
  const data = await getStoreData();
  data.transactions = data.transactions || [];
  data.transactions.unshift(tx);
  await saveStoreData(data);
  return tx;
}

export async function getTransaction(id) {
  const data = await getStoreData();
  return (data.transactions || []).find((t) => t.id === id || t.paymentId === id || t.orderId === id);
}

// Custom Requests
export async function recordCustomRequest(req) {
  const data = await getStoreData();
  data.customRequests = data.customRequests || [];
  data.customRequests.unshift(req);
  await saveStoreData(data);
  return req;
}

export async function updateCustomRequestStatus(id, status, notes) {
  const data = await getStoreData();
  data.customRequests = data.customRequests || [];
  const req = data.customRequests.find((r) => r.id === id);
  if (req) {
    req.status = status;
    if (notes !== undefined) req.notes = notes;
    req.updatedAt = new Date().toISOString();
    await saveStoreData(data);
    return req;
  }
  return null;
}

// Leads
export async function recordLead(lead) {
  const data = await getStoreData();
  data.leads = data.leads || [];
  data.leads.unshift(lead);
  await saveStoreData(data);
  return lead;
}

export async function updateLeadStatus(id, status, notes) {
  const data = await getStoreData();
  data.leads = data.leads || [];
  const lead = data.leads.find((l) => l.id === id);
  if (lead) {
    lead.status = status;
    if (notes !== undefined) lead.notes = notes;
    lead.updatedAt = new Date().toISOString();
    await saveStoreData(data);
    return lead;
  }
  return null;
}

