# Monetization, Payments & Google AdSense Setup Guide

A complete, practical operational guide for **Trade-in Reconciliation Automation**: how you get paid, how money reaches your bank account, and how advertisements appear on your live website.

**Live Application**: [https://reconciliation-automation.netlify.app/](https://reconciliation-automation.netlify.app/)  
**Admin Portal**: [https://reconciliation-automation.netlify.app/admin.html](https://reconciliation-automation.netlify.app/admin.html) *(Default password: `admin123`)*

---

## 📑 Table of Contents
1. [Overview of Revenue Streams](#1-overview-of-revenue-streams)
2. [How You Get Paid for Pay-Per-Use Reports (Razorpay)](#2-how-you-get-paid-for-pay-per-use-reports-razorpay)
3. [How You Get Paid for Custom Templates & Consulting](#3-how-you-get-paid-for-custom-templates--consulting)
4. [How You Earn Affiliate Commissions](#4-how-you-earn-affiliate-commissions)
5. [How Google AdSense Works & Displays Ads](#5-how-google-adsense-works--displays-ads)
6. [Managing Everything via the Admin Portal](#6-managing-everything-via-the-admin-portal)
7. [Checklist for Going Live with Payments & Ads](#7-checklist-for-going-live-with-payments--ads)

---

## 1. Overview of Revenue Streams

Your website now includes multiple independent monetization channels that can run simultaneously:

```
                                  [Website Visitor / User]
                                              │
         ┌───────────────────┬────────────────┴──────────────────┬───────────────────┐
         ▼                   ▼                                   ▼                   ▼
  [Pay-Per-Use]      [Custom Templates]                 [Business Leads]     [Google AdSense]
  Detailed (₹49)     From ₹1,999                        Consulting / PIP     Banner & Footer Ads
  Advanced (₹99)     (ERP specific)                     (Automation)         (Impression & Clicks)
         │                   │                                   │                   │
  [Razorpay Gateway]  [Admin Lead Review]                 [WhatsApp / Phone]  [Google AdSense Engine]
         │                   │                                   │                   │
         └───────────────────┴────────────────┬──────────────────┴───────────────────┘
                                              ▼
                                   [YOUR BANK ACCOUNT]
```

---

## 2. How You Get Paid for Pay-Per-Use Reports (Razorpay)

### How It Works for the Customer
1. The user uploads their Excel files (Trade in Register, Servify Statement, Invoice Report).
2. The browser completes the free reconciliation.
3. Alongside the standard free Excel download, the user sees a **"⭐ Premium Reports"** button.
4. When clicked, they can choose:
   - **Executive Financial Summary**: ₹49
   - **Advanced Mismatch & Root Cause Analysis**: ₹99
5. A secure Razorpay checkout modal opens supporting:
   - **UPI**: Google Pay, PhonePe, Paytm, BHIM, QR code scan
   - **Cards**: Debit & Credit cards (Visa, Mastercard, RuPay)
   - **Net Banking**: All major Indian banks

### How the Money Reaches Your Bank Account
- **Razorpay** acts as your payment collector.
- When a customer pays ₹49 or ₹99, the funds are deposited into your Razorpay merchant balance.
- Razorpay executes **automatic daily settlements** (T+1 or T+2 working days) directly into your linked bank account via NEFT/IMPS.

### Setup Instructions (One-Time)
1. **Create an Account**: Visit [razorpay.com](https://razorpay.com) and sign up with your business or personal details.
2. **Complete KYC**: Upload your PAN, Aadhaar/ID, and add your **Bank Account Number + IFSC Code**.
3. **Generate API Keys**:
   - Go to **Razorpay Dashboard > Account & Settings > API Keys**.
   - Click **Generate Key**. You will receive:
     - `Key ID` (starts with `rzp_live_...` or `rzp_test_...`)
     - `Key Secret` (a private string)
4. **Connect Keys to Your Site**:
   - **Option A (Via Admin Portal)**: Go to [admin.html](https://reconciliation-automation.netlify.app/admin.html), click **Settings**, paste your `Key ID`, and click **Save Settings**.
   - **Option B (Via Netlify Environment Variables)**:
     - Open [app.netlify.com](https://app.netlify.com) > Select your site.
     - Go to **Site Configuration > Environment Variables**.
     - Add `RAZORPAY_KEY_ID` = your Key ID.
     - Add `RAZORPAY_KEY_SECRET` = your Key Secret.
5. **Testing Mode**:
   - While keys are empty or set to test placeholders, the website operates in a **built-in sandbox simulator mode**, allowing you to test the full unlock and report download flow without spending real money.

---

## 3. How You Get Paid for Custom Templates & Consulting

### A. Customized ERP Templates (Starting from ₹1,999)
- Companies often need customized columns for SAP, Oracle NetSuite, Tally, or Zoho.
- The user fills out the form in the **"Need a Customized Reconciliation Format?"** section (Company name, Email, Phone, ERP, requirements).
- On submission, an instant ticket reference is generated (e.g. `REQ-MW0IC-ABC`).
- **Where you see this**:
  - Open the **Admin Portal (`/admin.html`) > Custom Requests** tab.
  - You will see the company name, contact person, email, phone number, and their exact requirements.
- **Collecting Payment**:
  - Reach out to them via email or phone.
  - Send them a Razorpay Payment Link, UPI request, or invoice for ₹1,999+ once agreed on specifications.

### B. Enterprise Automation Consulting
- Organizations processing 1,000 to 50,000+ monthly records can request enterprise reconciliation consulting.
- The form captures name, company, email, phone, volume, and callback preference.
- Users can also click **"💬 Chat on WhatsApp"**, which opens a prefilled message directly to your phone: **`+91 8169832448`**.
- **Where you see this**:
  - Inside the **Admin Portal (`/admin.html`) > Consulting Leads** tab.

---

## 4. How You Earn Affiliate Commissions

### How It Works
- Your website features a curated section: **Recommended Finance & Automation Tools** (Zoho Books, ClearTax, TallyPrime, Microsoft Copilot, ReconPro CRM).
- These tools have partner and affiliate programs.
- When an accountant or business owner visits your website, clicks on a tool, and purchases a subscription, the company attributes the referral to you.

### How to Collect Commissions
1. Sign up for partner programs:
   - [Zoho Partner Program](https://www.zoho.com/partners/)
   - [ClearTax Partner Network](https://cleartax.in/)
   - Microsoft / Cloud hosting affiliate networks
2. Once approved, copy your personal tracking links.
3. Open your **Admin Portal (`/admin.html`) > Affiliate Tools** tab.
4. Click **Edit** next to any tool and replace the default URL with your unique affiliate tracking link.
5. Each partner program pays commissions directly to your bank account monthly (usually 10%–20% of sales).

---

## 5. How Google AdSense Works & Displays Ads

### How Ads Appear
- Google AdSense automatically connects advertisers with your site.
- Advertisements are placed in **non-intrusive locations only**:
  - `#ad-footer-slot`: Positioned cleanly above the website footer.
  - Secondary recommendation slots.
- **Strict Privacy & UX Guarantee**: Advertisements **never** appear inside the Excel upload dropzones, calculation progress bars, results tables, or export areas.

### How to Turn On Google AdSense
1. **Sign Up**:
   - Go to [adsense.google.com](https://adsense.google.com) and sign in.
   - Click **Sites > Add site** and enter:
     ```
     https://reconciliation-automation.netlify.app/
     ```
2. **Retrieve Your Publisher ID**:
   - Google gives you an identifier formatted like:
     ```
     ca-pub-1234567890123456
     ```
3. **Activate in Your Admin Dashboard**:
   - Navigate to [https://reconciliation-automation.netlify.app/admin.html](https://reconciliation-automation.netlify.app/admin.html).
   - Click the **Google AdSense** tab.
   - Check the box: **"Enable Google AdSense Advertisements"**.
   - Paste your `ca-pub-XXXXXXXXXXXXXXXX` Publisher ID.
   - Click **Save AdSense Settings**.
4. **Google Approval Process**:
   - Google crawls your site (typically within 24 to 48 hours) to verify the site is live and complies with policy.
   - As soon as Google approves it, live ads immediately start serving.
   - If disabled in the admin dashboard, the ad containers cleanly disappear with zero layout shift.

### How Google Pays You
- Inside your Google AdSense account, navigate to **Payments > Payment info**.
- Add your Indian bank account details (Bank Name, Account Number, IFSC code, and PAN).
- Google calculates your earnings from ad impressions and clicks.
- Google issues payments automatically on the **21st of every month** via wire transfer / direct bank deposit once your balance reaches the minimum threshold ($100 / approx ₹1,000).

---

## 6. Managing Everything via the Admin Portal

Your site has a dedicated, password-protected administrative interface:
**URL**: [https://reconciliation-automation.netlify.app/admin.html](https://reconciliation-automation.netlify.app/admin.html)  
**Default Password**: `admin123` *(changeable via `ADMIN_PASSWORD` in Netlify)*

| Tab in Admin Portal | What You Can Do |
| :--- | :--- |
| **📊 Overview & Analytics** | View total revenue earned in ₹, count of ₹49 vs ₹99 unlocks, pending custom requests, and new consulting leads. |
| **📢 Google AdSense** | Toggle ads ON/OFF, update your Publisher ID and responsive ad slot ID with one click. |
| **💳 Reports & Pricing** | Change prices for reports (e.g. adjust ₹49 or ₹99), and view the real-time transaction ledger with payment IDs and order receipts. |
| **🔗 Affiliate Tools** | Add new software recommendations, edit affiliate links, change badges, or hide tools. |
| **⭐ Sponsored Partners** | Add sponsored banner cards, company logos, destination links, and schedule campaign start/end dates. |
| **📑 Custom Requests** | Review submitted company template requests, requirements, and update status (`New` &rarr; `In Progress` &rarr; `Completed`). |
| **👥 Consulting Leads** | Review incoming enterprise inquiries, callback requests, and track lead conversion status. |
| **⚙️ Settings** | Update your direct WhatsApp number (`+91 8169832448`), support email, and Razorpay Key ID. |

---

## 7. Checklist for Going Live with Payments & Ads

- [x] **Website Live on Netlify**: [https://reconciliation-automation.netlify.app/](https://reconciliation-automation.netlify.app/)
- [x] **WhatsApp Connected**: Direct link to **`+91 8169832448`** working in header/footer and consulting card.
- [x] **Custom Template Price**: Configured as **`Starting from ₹1,999`**.
- [ ] **Step 1: Sign up on Razorpay**: Complete KYC and paste your live `Key ID` & `Key Secret` into Netlify Environment Variables.
- [ ] **Step 2: Sign up on Google AdSense**: Submit `https://reconciliation-automation.netlify.app/` and paste your Publisher ID in the Admin Portal.
- [ ] **Step 3: Update Admin Password**: Set `ADMIN_PASSWORD` in Netlify environment variables so only you can access `/admin.html`.

