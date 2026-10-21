# Trade-in Reconciliation Automation

A high-performance, browser-based financial reconciliation tool designed to automate trade-in registers against Servify customer statements and invoice reports.

Runs 100% locally in the browser with **ExcelJS** — no financial data is ever sent to an external server.

---

## 🚀 Features

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
  - Generates comprehensive output workbooks with cached formula results for Excel recalculation.
  - Automated vs Manual comparison sheet generation.

---

## 📁 Required Source Sheets

To run a reconciliation, upload a workbook containing:
1. **Trade in Register**
2. **Servify Customer Statement** (or *Servify Customer Ledger*)
3. **Invoice No Report**
4. *(Optional)* **Manual Output** for automated vs manual discrepancy analysis.

---

## 🛠️ Local Development

Simply open `index.html` in any modern web browser or serve it with Python:

```bash
# Python
python -m http.server 3000

# Node.js
npx serve
```

---

## 🌐 Deployment

Deployed on **Vercel** as a static web application.
