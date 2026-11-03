# Trade-in Reconciliation Automation

A high-performance, browser-based financial reconciliation tool designed to automate trade-in registers against Servify customer statements and invoice reports.

Runs 100% locally in the browser with **ExcelJS** — no financial data is ever sent to an external server. Core reconciliation and standard Excel export remain completely free.

Live Site: [https://reconciliation-automation.netlify.app/](https://reconciliation-automation.netlify.app/)

---

## 🚀 Core Features (100% Free)

- **Privacy-First (Zero Server Uploads)**: All Excel parsing, lookups, GST calculations, and export workbook generation run entirely in the browser.
- **Automated Matching Rules**:
  - `Matched with Books and GL`
  - `IMEI money deducted but not billed`
  - `AR of device not booked`
  - `Service not applicable`
  - `AR of Service Fee not booked`
  - `Amount difference - review`
  - `Not Eligible for Invoicing`
- **Configurable Reconciliation Parameters**:
  - GST percentage (default: `18%`)
  - GST inclusivity toggle
  - Tolerance threshold (₹)
- **Interactive Analytics Dashboard**:
  - Real-time KPIs (Total Records, Deducted, Booked, Unbooked, Invoiced amounts)
  - Searchable and sortable records and exception tables
  - Validation checks suite
- **Automated Excel Export**:
  - Generates comprehensive output workbooks (`Trade_in_Reconciliation_Output.xlsx`) with cached formula results for Excel recalculation.
  - Automated vs Manual comparison sheet generation.

---

## 💎 Monetization & Value-Added Modules

Six modular, non-intrusive monetization features are integrated. If any or all monetization features are disabled or offline, the core reconciliation tool continues to function with zero disruption.

### 1. Google AdSense Integration
- Responsive, non-intrusive advertisement slots positioned strictly in the footer and secondary recommendation sections.
- **Zero workflow interference**: Ads are never placed in the reconciliation workspace, upload drop zones, results tables, or export areas.
- Admin-controlled enable/disable toggle and configurable publisher ID (`ADSENSE_PUBLISHER_ID`).
- Automatically hides containers when disabled with zero layout shift.

### 2. Pay-Per-Use Premium Reports
- Core reconciliation and default Excel export remain completely free.
- Optional one-time unlock for enriched executive and compliance reports:
  - **Executive Financial Summary (₹49)**: Key financial totals, GL match rate, prioritized discrepancy checklist (High/Medium/Low), and audit-ready formatting.
  - **Advanced Mismatch & Root Cause Analysis (₹99)**: Adds Root Cause Categorization (timing vs tax vs unmapped lines), GST Input Tax Credit (ITC) eligibility audit, and Partner Net Settlement matrix with Servify.
- **Razorpay Integration**: One-time checkout via Razorpay with server-side HMAC-SHA256 signature verification. No subscriptions required. Razorpay secret keys are never exposed in frontend code.
- Client-side report generation ensures zero financial data is sent to the server.

### 3. Affiliate Marketing Integration
- Dedicated **Recommended Tools & Software** section for finance and retail operations teams:
  - Cloud accounting & ERP software (e.g. Zoho Books, TallyPrime)
  - Tax compliance and ITC matching tools (e.g. ClearTax)
  - Advanced spreadsheet productivity (e.g. Microsoft 365 Copilot)
  - Device trade-in and retail CRM tools
- Transparent FTC/statutory affiliate disclosure.
- Safe link handling (`rel="noopener noreferrer sponsored"`).
- Located outside the reconciliation workspace.

### 4. Sponsored Placements
- Dedicated **Sponsored Partner** banner cards with clear promotion labels.
- Managed by administrators: easily add, edit, schedule campaign dates, or toggle sponsors active/inactive.
- Safe link handling (`rel="sponsored noopener noreferrer"`).

### 5. Customized Reports and ERP Templates
- Dedicated request section for organizations requiring company-specific templates:
  - Tailored column mappings (SAP S/4HANA, Tally, Oracle, Zoho)
  - Custom mismatch classification rules and multi-store registers
  - Specialized variance dashboards
- Form capture with instant reference ticket ID (e.g. `REQ-XXXX`).
- Transparent pricing indicator (Starting from ₹1,999 depending on complexity).

### 6. Business Consulting & Lead Generation
- Professional consulting services section for enterprise finance automation:
  - Automated 3-way reconciliation pipelines
  - Dispute and recovery claim management with Servify
  - Enterprise ERP connectors
- Comprehensive inquiry form with business size and service interest selection.
- **Callback request option** and communication consent checkbox.
- **Direct WhatsApp contact button** with prefilled message.

---

## 🔐 Protected Admin Dashboard (`/admin.html`)

Access at `http://localhost:3000/admin.html` or `/admin.html` on your deployed site.

### Features
- **Overview & Monetization Analytics**: Total revenue in ₹, paid unlocks, report breakdown, pending requests, and new leads.
- **Google AdSense Settings**: Toggle ads on/off, set publisher ID and slot ID.
- **Pricing & Transactions**: Configure report prices (₹49, ₹99, etc.) and view all verified transactions with payment IDs and order receipts.
- **Affiliate Tool Manager**: Add, edit, activate/hide, and delete affiliate recommendations.
- **Sponsored Placements Manager**: Add, edit, activate/deactivate sponsors and manage campaign start/end dates.
- **Custom Report Requests**: Review requests, client contact details, and update status (New, In Progress, Completed, Closed).
- **Consulting Leads**: Manage inbound business leads and update pipeline status.
- **General Settings**: Update WhatsApp contact number, support email, and Razorpay Key ID.

### Security
- Admin authentication via secure session token (HMAC-SHA256).
- Server-side route protection: All `/api/admin/*` endpoints strictly require valid bearer token authorization.
- Secret keys (`ADMIN_PASSWORD`, `RAZORPAY_KEY_SECRET`) remain protected on the server.

---

## 📁 Required Source Sheets for Reconciliation

Upload an Excel workbook (`.xlsx`) containing:
1. **Trade in Register**
2. **Servify Customer Statement** (or *Servify Customer Ledger*)
3. **Invoice No Report**
4. *(Optional)* **Manual Output** for automated vs manual discrepancy analysis.

---

## 🛠️ Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Local Development Server
```bash
npm start
```
- Main Application: `http://localhost:3000/`
- Admin Dashboard: `http://localhost:3000/admin.html` (Default password: `admin123`)
- API Endpoint: `http://localhost:3000/api/config`

### 4. Run Automated Test Suite
```bash
npm test
```
Validates all 16 API endpoints, payment signature verification, store adapters, admin authentication, and core reconciliation backward compatibility.

---

## 🌐 Netlify Deployment

The project is configured for deployment on **Netlify** with Netlify Functions and Netlify Blobs.

### Step 1: Deploy to Netlify
Connect your repository in the Netlify Dashboard or use the Netlify CLI:
```bash
netlify deploy --prod
```

### Step 2: Configure Environment Variables in Netlify
Go to **Site Settings > Environment Variables** in your Netlify dashboard and set:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | Admin portal password | `YourSecurePassword2026` |
| `ADMIN_JWT_SECRET` | Secret key for signing admin session tokens | `random_long_secret_string` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (public) | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (private) | `your_secret_key` |
| `ADSENSE_PUBLISHER_ID` | Google AdSense Publisher ID (optional) | `ca-pub-XXXXXXXXXXXXXXXX` |
| `ADSENSE_SLOT_ID` | Google AdSense Slot ID (optional) | `1234567890` |
| `WHATSAPP_NUMBER` | Contact phone number for WhatsApp | `+91 8169832448` |
| `SUPPORT_EMAIL` | Support contact email | `support@yourdomain.com` |

### Step 3: Architecture & Fallbacks
- Serverless API handler: `netlify/functions/api.mjs` handles `/api/*` requests.
- Storage: Uses `@netlify/blobs` automatically on Netlify, falling back to local file storage (`.data/store.json`) in local development.
- Zero-downtime fallback: If backend APIs are unreachable or offline, the main reconciliation tool continues working with zero errors.
