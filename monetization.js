/**
 * Trade-in Reconciliation - Monetization & Value-Added Modules
 * Integrates:
 * 1. Google AdSense (responsive, non-intrusive)
 * 2. Pay-Per-Use Premium Reports (Razorpay one-time payment)
 * 3. Affiliate Marketing Integration (with disclosure)
 * 4. Sponsored Placements
 * 5. Customized Reports and Templates Service
 * 6. Business Consulting & Lead Generation
 */

(function () {
  'use strict';

  let config = {
    ads: { enabled: false, publisherId: '', slotId: '' },
    pricing: { detailedReport: 49, advancedAnalysis: 99, customReportMin: 1999 },
    razorpayKeyId: '',
    whatsappNumber: '+91 8169832448',
    supportEmail: 'support@reconciliation-automation.com',
    sponsors: [],
    affiliates: [],
  };

  const PURCHASES_KEY = 'recon_premium_purchases_v1';

  function getStoredPurchases() {
    try {
      return JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function savePurchase(purchase) {
    try {
      const current = getStoredPurchases();
      current.unshift(purchase);
      localStorage.setItem(PURCHASES_KEY, JSON.stringify(current));
    } catch (err) {
      console.warn('Could not save purchase locally:', err);
    }
  }

  // Escape HTML helper
  function esc(s) {
    return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function inr(n) {
    if (n === '' || n == null) return '';
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  // Initialize and fetch configuration
  async function init() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        config = await res.json();
      }
    } catch (err) {
      console.warn('Could not load server config, using defaults:', err);
    }

    renderSponsoredSection();
    renderAffiliatesSection();
    renderCustomTemplatesSection();
    renderConsultingSection();
    renderFooterAndAds();
    setupResultsHook();
  }

  // --- 1. Google AdSense Integration ---
  function renderFooterAndAds() {
    const footerContainer = document.getElementById('monetization-footer');
    if (!footerContainer) return;

    const adsEnabled = config.ads && config.ads.enabled && config.ads.publisherId;
    const pubId = config.ads ? config.ads.publisherId : '';
    const slotId = config.ads ? config.ads.slotId : '';

    let adsHtml = '';
    if (adsEnabled) {
      adsHtml = `
        <div id="ad-footer-slot" style="margin: 20px 0; text-align: center; overflow: hidden; min-height: 90px; background: rgba(0,0,0,0.02); border-radius: 8px; padding: 8px;">
          <div style="font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Advertisement</div>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="${esc(pubId)}"
               data-ad-slot="${esc(slotId)}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      `;

      // Load Google AdSense script if not already present
      if (!document.getElementById('adsense-script')) {
        const s = document.createElement('script');
        s.id = 'adsense-script';
        s.async = true;
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
        s.onload = () => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch {}
        };
      }
    }

    let cleanWaNumber = (config.whatsappNumber || '').replace(/[^0-9]/g, '');
    if (cleanWaNumber.length === 10) cleanWaNumber = '91' + cleanWaNumber;

    footerContainer.innerHTML = `
      ${adsHtml}
      <footer style="margin-top: 36px; padding: 24px 0 16px; border-top: 1px solid var(--bd); font-size: 13px; color: var(--mu);">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: center;">
          <div>
            <b>Trade-in Reconciliation Automation</b> &middot; Secure, browser-based financial reconciliation.
            <div style="font-size: 12px; margin-top: 4px;">Zero financial data leaves your browser. All calculations run strictly client-side.</div>
          </div>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="https://wa.me/${cleanWaNumber}?text=Hi,%20I%20have%20a%20question%20about%20Trade-in%20Reconciliation" target="_blank" rel="noopener noreferrer" style="color: var(--ac); text-decoration: none;">💬 WhatsApp Support</a>
            <a href="#custom-templates" style="color: var(--tx); text-decoration: none;">Custom Templates</a>
            <a href="#consulting" style="color: var(--tx); text-decoration: none;">Enterprise Consulting</a>
            <a href="/monetization-guide.html" target="_blank" style="color: var(--tx); text-decoration: none;">📖 Payouts &amp; Ads Guide</a>
            <a href="/admin.html" style="color: var(--mu); text-decoration: none; font-size: 12px;">Admin Portal</a>
          </div>
        </div>
      </footer>
    `;
  }

  // --- 4. Sponsored Placements ---
  function renderSponsoredSection() {
    const el = document.getElementById('monetization-sponsored');
    if (!el) return;

    const sponsors = (config.sponsors || []).filter((s) => s.active);
    if (!sponsors.length) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = sponsors
      .map(
        (s) => `
        <div class="card" style="border-left: 4px solid var(--ac); background: var(--card); padding: 14px 18px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div style="flex: 1 1 300px;">
              <div style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; background: rgba(31, 95, 191, 0.1); color: var(--ac); padding: 2px 7px; border-radius: 4px; margin-bottom: 6px;">
                ${esc(s.badgeText || 'Sponsored Partner')}
              </div>
              <h3 style="margin: 0 0 4px; font-size: 16px; color: var(--tx);">${esc(s.name)}</h3>
              <div style="font-weight: 600; font-size: 13px; color: var(--ac); margin-bottom: 4px;">${esc(s.tagline || '')}</div>
              <div class="mu" style="font-size: 13px; line-height: 1.4;">${esc(s.description)}</div>
            </div>
            <div style="display: flex; align-items: center; margin-top: 6px;">
              <a href="${esc(s.targetUrl)}" target="_blank" rel="sponsored noopener noreferrer" style="display: inline-block; background: var(--ac); color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;">
                Learn More &rarr;
              </a>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  // --- 3. Affiliate Marketing Integration ---
  function renderAffiliatesSection() {
    const el = document.getElementById('monetization-affiliates');
    if (!el) return;

    const affiliates = (config.affiliates || []).filter((a) => a.active);
    if (!affiliates.length) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = `
      <div class="card" id="recommended-tools" style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 16px;">Recommended Finance & Automation Tools</h2>
          <span style="font-size: 11px; background: rgba(0,0,0,0.05); padding: 3px 8px; border-radius: 12px; color: var(--mu);">Curated for Finance Teams</span>
        </div>
        <p class="mu" style="font-size: 13px; margin: 0 0 14px;">
          Software and productivity tools tested to accelerate accounting, tax filing, and retail trade-in reconciliation.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px;">
          ${affiliates
            .map(
              (a) => `
            <div style="border: 1px solid var(--bd); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; background: var(--card);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 22px;">${esc(a.icon || '🛠️')}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: rgba(31,95,191,0.08); color: var(--ac);">${esc(a.badge || a.category)}</span>
                </div>
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: var(--tx);">${esc(a.name)}</div>
                <div class="mu" style="font-size: 12px; line-height: 1.4; margin-bottom: 10px;">${esc(a.description)}</div>
              </div>
              <a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer sponsored" style="display: block; text-align: center; border: 1px solid var(--ac); color: var(--ac); text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 500;">
                ${esc(a.cta || 'Visit Tool')} &rarr;
              </a>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="border-top: 1px solid var(--bd); padding-top: 8px; font-size: 11px; color: var(--mu); line-height: 1.4;">
          <strong>Affiliate Disclosure:</strong> Some of the links above are affiliate links. If you make a purchase through these links, we may receive a commission at no additional cost to you. We only recommend tools that provide genuine value to finance and operations teams.
        </div>
      </div>
    `;
  }

  // --- 5. Customized Reports and Templates ---
  function renderCustomTemplatesSection() {
    const el = document.getElementById('monetization-custom-templates');
    if (!el) return;

    const minPrice = config.pricing.customReportMin || 1999;

    el.innerHTML = `
      <div class="card" id="custom-templates" style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="margin: 0 0 4px; font-size: 16px;">Need a Customized Reconciliation Format or ERP Template?</h2>
            <div class="mu" style="font-size: 13px;">
              Get tailored reconciliation templates built for your specific ERP (SAP, Tally, Zoho, Oracle, Dynamics) or internal accounting workflow.
            </div>
          </div>
          <div style="text-align: right; background: rgba(31,95,191,0.06); padding: 6px 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--mu);">One-time service fee</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--ac);">Starting from ₹${inr(minPrice)}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 14px 0;">
          <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--bd); padding: 10px; border-radius: 6px; font-size: 12.5px;">
            <strong>📁 Custom Column Mappings</strong><br>
            <span class="mu">Match your exact ledger fields, internal cost centers, and customized IMEI identifiers.</span>
          </div>
          <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--bd); padding: 10px; border-radius: 6px; font-size: 12.5px;">
            <strong>⚙️ Special Mismatch Rules</strong><br>
            <span class="mu">Configurable threshold rules, dispute codes, and multi-vendor Servify reconciliation.</span>
          </div>
          <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--bd); padding: 10px; border-radius: 6px; font-size: 12.5px;">
            <strong>📑 Executive Audit Sheets</strong><br>
            <span class="mu">Automated variance dashboards and audit-ready summary sheets ready for your CFO or statutory auditors.</span>
          </div>
        </div>

        <form id="custom-template-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 600;">Company Name *</label>
            <input type="text" id="ct-company" required placeholder="e.g. Retail Corp Ltd" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Contact Person</label>
            <input type="text" id="ct-name" placeholder="Your Name" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Work Email *</label>
            <input type="email" id="ct-email" required placeholder="finance@company.com" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Phone / WhatsApp</label>
            <input type="text" id="ct-phone" placeholder="+91 98765 43210" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Report Type / ERP</label>
            <input type="text" id="ct-erp" placeholder="e.g. SAP / Tally / Custom Excel" style="width: 100%; box-sizing: border-box;">
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="font-size: 12px; font-weight: 600;">Requirements & Details *</label>
            <textarea id="ct-reqs" rows="2" required placeholder="Describe your current process, custom columns, or specific mismatch rules needed..." style="width: 100%; box-sizing: border-box; background: var(--card); color: var(--tx); border: 1px solid var(--bd); border-radius: 6px; padding: 6px 8px; font: inherit;"></textarea>
          </div>
          <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div id="ct-status" style="font-size: 13px;"></div>
            <button type="submit" id="ct-submit" style="background: var(--ac); color: #fff; padding: 9px 20px;">Submit Request &rarr;</button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById('custom-template-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('ct-submit');
        const statusEl = document.getElementById('ct-status');
        btn.disabled = true;
        statusEl.innerHTML = '<span class="mu">Submitting your request...</span>';

        try {
          const payload = {
            companyName: document.getElementById('ct-company').value,
            contactName: document.getElementById('ct-name').value,
            email: document.getElementById('ct-email').value,
            phone: document.getElementById('ct-phone').value,
            erpSystem: document.getElementById('ct-erp').value,
            requirements: document.getElementById('ct-reqs').value,
          };

          const res = await fetch('/api/custom-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            statusEl.innerHTML = `<span class="ok">✓ Request received (Ref: <b>${esc(data.ticketId)}</b>). Our engineering team will contact you within 24 hours.</span>`;
            form.reset();
          } else {
            statusEl.innerHTML = `<span class="er">✗ ${esc(data.error || 'Failed to submit request')}</span>`;
          }
        } catch (err) {
          statusEl.innerHTML = `<span class="er">✗ Network error: ${esc(err.message)}</span>`;
        } finally {
          btn.disabled = false;
        }
      };
    }
  }

  // --- 6. Business Lead Generation and Consulting ---
  function renderConsultingSection() {
    const el = document.getElementById('monetization-consulting');
    if (!el) return;

    let cleanWaNumber = (config.whatsappNumber || '').replace(/[^0-9]/g, '');
    if (cleanWaNumber.length === 10) cleanWaNumber = '91' + cleanWaNumber;

    el.innerHTML = `
      <div class="card" id="consulting" style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="margin: 0 0 4px; font-size: 16px;">Enterprise Financial Reconciliation & Automation Consulting</h2>
            <div class="mu" style="font-size: 13px;">
              Struggling with multi-lakh trade-in discrepancies, Servify settlements, or manual spreadsheets? Let our finance automation specialists build an automated end-to-end reconciliation pipeline for your organization.
            </div>
          </div>
          <div>
            <a href="https://wa.me/${cleanWaNumber}?text=Hi,%20I%20would%20like%20to%20inquire%20about%20Reconciliation%20Automation%20Consulting%20services" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background: #25d366; color: #fff; text-decoration: none; padding: 8px 14px; border-radius: 7px; font-size: 13px; font-weight: 600;">
              <span>💬 Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin: 16px 0;">
          <div style="border-left: 3px solid var(--ok); padding-left: 10px;">
            <div style="font-weight: 600; font-size: 13px;">Automated 3-Way Reconciliation</div>
            <div class="mu" style="font-size: 12px;">Seamless matching between Retail POS, Servify statements, and Bank/GL entries.</div>
          </div>
          <div style="border-left: 3px solid var(--ac); padding-left: 10px;">
            <div style="font-weight: 600; font-size: 13px;">Dispute & Claim Management</div>
            <div class="mu" style="font-size: 12px;">Automated discrepancy flagging, debit note generation, and vendor recovery tracking.</div>
          </div>
          <div style="border-left: 3px solid var(--wn); padding-left: 10px;">
            <div style="font-weight: 600; font-size: 13px;">Custom ERP Integration</div>
            <div class="mu" style="font-size: 12px;">Direct connector pipelines into SAP S/4HANA, TallyPrime, Oracle NetSuite, and Zoho.</div>
          </div>
        </div>

        <form id="consulting-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 600;">Full Name *</label>
            <input type="text" id="cs-name" required placeholder="John Doe" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Company / Store Name *</label>
            <input type="text" id="cs-company" required placeholder="Apex Mobiles Ltd" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Work Email *</label>
            <input type="email" id="cs-email" required placeholder="john@apex.com" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Phone / WhatsApp *</label>
            <input type="text" id="cs-phone" required placeholder="+91 98765 43210" style="width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Monthly Reconciliation Volume</label>
            <select id="cs-volume" style="width: 100%; background: var(--card); color: var(--tx); border: 1px solid var(--bd); border-radius: 6px; padding: 6px 8px; font: inherit;">
              <option value="Under 1,000 records">Under 1,000 records/mo</option>
              <option value="1,000 - 10,000 records">1,000 - 10,000 records/mo</option>
              <option value="10,000 - 50,000 records">10,000 - 50,000 records/mo</option>
              <option value="50,000+ records">Enterprise (50,000+ records/mo)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600;">Primary Service Interest</label>
            <select id="cs-service" style="width: 100%; background: var(--card); color: var(--tx); border: 1px solid var(--bd); border-radius: 6px; padding: 6px 8px; font: inherit;">
              <option value="Full Automation Pipeline">Full Automation Pipeline</option>
              <option value="ERP Integration (SAP/Tally/Zoho)">ERP Integration (SAP/Tally/Zoho)</option>
              <option value="Dispute & Recovery Audit">Dispute & Recovery Audit</option>
              <option value="Custom Excel/Python Workflow">Custom Excel/Python Workflow</option>
            </select>
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="font-size: 12px; font-weight: 600;">Describe Your Challenges or Questions</label>
            <textarea id="cs-message" rows="2" placeholder="Tell us about your current reconciliation pain points, timelines, or requirements..." style="width: 100%; box-sizing: border-box; background: var(--card); color: var(--tx); border: 1px solid var(--bd); border-radius: 6px; padding: 6px 8px; font: inherit;"></textarea>
          </div>
          <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px;">
            <label style="font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="cs-callback" checked>
              <strong>Request a callback from a senior automation consultant</strong>
            </label>
            <label style="font-size: 11px; color: var(--mu); display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="cs-consent" required checked>
              I consent to being contacted by Reconciliation Automation specialists regarding this inquiry. We respect your privacy and never sell or share your data.
            </label>
          </div>
          <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
            <div id="cs-status" style="font-size: 13px;"></div>
            <button type="submit" id="cs-submit" style="background: var(--ok); color: #fff; padding: 9px 22px; font-weight: 600;">Request Consultation &rarr;</button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById('consulting-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('cs-submit');
        const statusEl = document.getElementById('cs-status');
        btn.disabled = true;
        statusEl.innerHTML = '<span class="mu">Submitting your inquiry...</span>';

        try {
          const payload = {
            fullName: document.getElementById('cs-name').value,
            company: document.getElementById('cs-company').value,
            email: document.getElementById('cs-email').value,
            phone: document.getElementById('cs-phone').value,
            businessSize: document.getElementById('cs-volume').value,
            serviceType: document.getElementById('cs-service').value,
            message: document.getElementById('cs-message').value,
            callbackRequested: document.getElementById('cs-callback').checked,
            consent: document.getElementById('cs-consent').checked,
          };

          const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            statusEl.innerHTML = `<span class="ok">✓ Consultation request submitted (Ref: <b>${esc(data.leadId)}</b>). We will be in touch shortly.</span>`;
            form.reset();
          } else {
            statusEl.innerHTML = `<span class="er">✗ ${esc(data.error || 'Failed to submit inquiry')}</span>`;
          }
        } catch (err) {
          statusEl.innerHTML = `<span class="er">✗ Network error: ${esc(err.message)}</span>`;
        } finally {
          btn.disabled = false;
        }
      };
    }
  }

  // --- 2. Pay-Per-Use Premium Reports Integration ---
  function setupResultsHook() {
    // Observe changes to #out so when reconciliation finishes, we mount the Premium Reports button
    const outEl = document.getElementById('out');
    if (!outEl) return;

    const observer = new MutationObserver(() => {
      if (!outEl.hidden) {
        injectPremiumReportsUI();
      }
    });

    observer.observe(outEl, { attributes: true, attributeFilter: ['hidden'] });

    // Also inject if already visible
    if (!outEl.hidden) {
      injectPremiumReportsUI();
    }
  }

  function injectPremiumReportsUI() {
    const tabsEl = document.getElementById('tabs');
    if (!tabsEl) return;

    if (!document.getElementById('btn-premium-reports')) {
      const btn = document.createElement('button');
      btn.id = 'btn-premium-reports';
      btn.style.background = '#e67e22';
      btn.style.color = '#fff';
      btn.style.border = '0';
      btn.style.fontWeight = '600';
      btn.innerHTML = '⭐ Premium Reports';
      btn.title = 'Unlock Executive Financial Summary and Root Cause Analysis';
      btn.onclick = () => openPremiumReportsModal();
      tabsEl.appendChild(btn);
    }
  }

  function openPremiumReportsModal() {
    let modal = document.getElementById('premium-reports-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'premium-reports-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.background = 'rgba(0, 0, 0, 0.6)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.style.padding = '16px';
      document.body.appendChild(modal);
    }

    const priceDetailed = config.pricing.detailedReport || 49;
    const priceAdvanced = config.pricing.advancedAnalysis || 99;
    const purchases = getStoredPurchases();

    modal.innerHTML = `
      <div style="background: var(--card); color: var(--tx); border: 1px solid var(--bd); border-radius: 12px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
          <div>
            <h2 style="margin: 0; font-size: 18px; color: var(--tx);">Unlock Premium Reconciliation Reports</h2>
            <div class="mu" style="font-size: 13px; margin-top: 2px;">
              Pay-per-use, one-time unlock. 100% of your financial data stays private on your computer.
            </div>
          </div>
          <button id="p-modal-close" style="background: transparent; color: var(--mu); border: 0; font-size: 22px; line-height: 1; cursor: pointer; padding: 4px;">&times;</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 18px;">
          <!-- Option 1: Detailed Report -->
          <div style="border: 2px solid var(--bd); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; background: var(--card);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 15px;">Executive Summary</span>
                <span style="font-size: 20px; font-weight: 800; color: var(--ac);">₹${priceDetailed}</span>
              </div>
              <ul style="padding-left: 18px; font-size: 12.5px; line-height: 1.5; margin: 0 0 12px; color: var(--tx);">
                <li>Executive Financial KPI Brief</li>
                <li>GL Matching rate & Billed vs Unbilled variance</li>
                <li>Prioritized Discrepancy Matrix (High/Med/Low)</li>
                <li>Actionable recovery checklist for Servify</li>
                <li>Audit-ready formatted multi-sheet Excel</li>
              </ul>
            </div>
            <button class="unlock-btn" data-type="detailed" data-amount="${priceDetailed}" style="background: var(--ac); color: #fff; width: 100%; padding: 10px; font-weight: 600;">
              Unlock Detailed Report (₹${priceDetailed})
            </button>
          </div>

          <!-- Option 2: Advanced Analysis -->
          <div style="border: 2px solid #e67e22; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; background: rgba(230,126,34,0.03); position: relative;">
            <div style="position: absolute; top: -10px; right: 12px; background: #e67e22; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">
              Most Popular
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 15px;">Advanced Analysis</span>
                <span style="font-size: 20px; font-weight: 800; color: #e67e22;">₹${priceAdvanced}</span>
              </div>
              <ul style="padding-left: 18px; font-size: 12.5px; line-height: 1.5; margin: 0 0 12px; color: var(--tx);">
                <li>Everything in Executive Summary</li>
                <li><strong>Root-Cause Categorization Sheet</strong> (Timing, Tax, Mapping)</li>
                <li><strong>GST & Tax Compliance Audit Sheet</strong> (ITC eligibility)</li>
                <li><strong>Partner Net Settlement Matrix</strong> with Servify</li>
                <li>Statistical variance & outlier analytics</li>
              </ul>
            </div>
            <button class="unlock-btn" data-type="advanced" data-amount="${priceAdvanced}" style="background: #e67e22; color: #fff; width: 100%; padding: 10px; font-weight: 600;">
              Unlock Advanced Report (₹${priceAdvanced})
            </button>
          </div>
        </div>

        <div style="border-top: 1px solid var(--bd); padding-top: 12px; font-size: 12px; color: var(--mu); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            🔒 Secured by <strong>Razorpay</strong> &middot; One-time payment &middot; No subscription
          </div>
          ${purchases.length ? `<button id="btn-show-history" style="background: transparent; color: var(--ac); border: 1px solid var(--bd); padding: 4px 10px; font-size: 12px;">View Past Purchases (${purchases.length})</button>` : ''}
        </div>

        <div id="p-history-container" style="display: none; margin-top: 14px; border-top: 1px solid var(--bd); padding-top: 10px;">
          <h4 style="margin: 0 0 8px; font-size: 13px;">Past Purchases in this Browser:</h4>
          ${purchases
            .map(
              (p) => `
            <div style="font-size: 12px; padding: 6px 0; border-bottom: 1px dashed var(--bd); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b>${p.reportType === 'advanced' ? 'Advanced Analysis' : 'Detailed Report'}</b> (₹${p.amount})
                <br><span class="mu">Txn: ${esc(p.transactionId)} &middot; ${new Date(p.timestamp).toLocaleDateString()}</span>
              </div>
              <button class="redownload-btn" data-type="${esc(p.reportType)}" data-tx="${esc(p.transactionId)}" style="background: transparent; border: 1px solid var(--ac); color: var(--ac); padding: 4px 8px; font-size: 11px;">
                Download Again
              </button>
            </div>
          `
            )
            .join('')}
        </div>

        <div id="p-checkout-status" style="margin-top: 12px; font-size: 13px; text-align: center;"></div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('p-modal-close').onclick = () => {
      modal.style.display = 'none';
    };

    const historyBtn = document.getElementById('btn-show-history');
    if (historyBtn) {
      historyBtn.onclick = () => {
        const hc = document.getElementById('p-history-container');
        hc.style.display = hc.style.display === 'none' ? 'block' : 'none';
      };
    }

    modal.querySelectorAll('.redownload-btn').forEach((b) => {
      b.onclick = () => {
        const type = b.dataset.type;
        const tx = b.dataset.tx;
        generateAndDownloadPremiumReport(type, tx);
      };
    });

    modal.querySelectorAll('.unlock-btn').forEach((b) => {
      b.onclick = () => {
        const type = b.dataset.type;
        const amount = b.dataset.amount;
        initiateRazorpayCheckout(type, amount);
      };
    });
  }

  async function initiateRazorpayCheckout(reportType, amount) {
    const statusEl = document.getElementById('p-checkout-status');
    statusEl.innerHTML = '<span class="mu">Initializing secure payment gateway...</span>';

    try {
      // 1. Create order on backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // Check if Razorpay is running in demo/sandbox test mode
      if (orderData.isDemo) {
        statusEl.innerHTML = `
          <div style="background: rgba(31,95,191,0.08); padding: 12px; border-radius: 8px; margin-top: 8px;">
            <b>Test Mode Active:</b> Simulating payment of ₹${amount}...
            <br><button id="btn-simulate-pay" style="margin-top: 8px; background: var(--ok); color: #fff; padding: 6px 14px;">Confirm Test Payment &rarr;</button>
          </div>
        `;

        document.getElementById('btn-simulate-pay').onclick = async () => {
          statusEl.innerHTML = '<span class="mu">Verifying signature on server...</span>';
          await completeVerification({
            orderId: orderData.orderId,
            paymentId: 'pay_dev_' + Date.now(),
            signature: 'sig_dev_valid',
            reportType,
            amount,
          });
        };
        return;
      }

      // Live Razorpay Checkout
      if (typeof Razorpay === 'undefined') {
        // Dynamically load Razorpay script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
          document.head.appendChild(script);
        });
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Trade-in Reconciliation',
        description: reportType === 'advanced' ? 'Advanced Mismatch Analysis' : 'Detailed Reconciliation Report',
        order_id: orderData.orderId,
        handler: async function (response) {
          statusEl.innerHTML = '<span class="mu">Verifying payment with bank...</span>';
          await completeVerification({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            reportType,
            amount,
          });
        },
        theme: {
          color: '#1f5fbf',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        statusEl.innerHTML = `<span class="er">✗ Payment Failed: ${esc(response.error.description)}</span>`;
      });
      rzp.open();
    } catch (err) {
      statusEl.innerHTML = `<span class="er">✗ Checkout Error: ${esc(err.message)}</span>`;
    }
  }

  async function completeVerification({ orderId, paymentId, signature, reportType, amount }) {
    const statusEl = document.getElementById('p-checkout-status');
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, signature, reportType }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server payment verification failed');
      }

      // Record successful purchase
      const purchase = {
        transactionId: paymentId,
        orderId,
        reportType,
        amount,
        timestamp: new Date().toISOString(),
        token: data.token,
      };
      savePurchase(purchase);

      statusEl.innerHTML = `
        <div style="background: rgba(27,127,75,0.1); color: var(--ok); padding: 12px; border-radius: 8px; margin-top: 8px;">
          <b>✓ Payment Verified Successfully!</b>
          <br>Transaction ID: <code>${esc(paymentId)}</code>
          <div style="margin-top: 8px;">
            <button id="btn-download-premium" style="background: var(--ok); color: #fff; padding: 8px 16px; font-weight: 600;">
              📥 Download Premium Report Now
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-download-premium').onclick = () => {
        generateAndDownloadPremiumReport(reportType, paymentId);
      };

      // Auto-trigger download
      generateAndDownloadPremiumReport(reportType, paymentId);
    } catch (err) {
      statusEl.innerHTML = `<span class="er">✗ Verification failed: ${esc(err.message)}</span>`;
    }
  }

  // Generate enriched client-side premium Excel workbook
  async function generateAndDownloadPremiumReport(reportType, transactionId) {
    if (typeof wbOut === 'undefined' || !wbOut || typeof S === 'undefined' || !S.reg) {
      alert('Please run the reconciliation first before downloading the premium report.');
      return;
    }

    try {
      // Clone or create new workbook based on wbOut
      const pWb = new ExcelJS.Workbook();
      
      // Copy existing worksheets from wbOut to retain all original reconciliation sheets
      for (const srcSheet of wbOut.worksheets) {
        const destSheet = pWb.addWorksheet(srcSheet.name);
        srcSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const destRow = destSheet.getRow(rowNumber);
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const destCell = destRow.getCell(colNumber);
            destCell.value = cell.value;
            if (cell.numFmt) destCell.numFmt = cell.numFmt;
            if (cell.fill) destCell.fill = cell.fill;
            if (cell.font) destCell.font = cell.font;
            if (cell.alignment) destCell.alignment = cell.alignment;
            if (cell.border) destCell.border = cell.border;
          });
        });
      }

      const k = S.k;
      const HF = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
      const GOLD = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2A900' } };
      const BAND = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F6FB' } };

      // --- PREMIUM SHEET 1: Executive Financial Brief ---
      let execSheet = pWb.getWorksheet('Executive Financial Brief');
      if (execSheet) pWb.removeWorksheet(execSheet.id);
      execSheet = pWb.addWorksheet('Executive Financial Brief');
      
      execSheet.addRow(['EXECUTIVE FINANCIAL RECONCILIATION SUMMARY']);
      execSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      execSheet.getCell('A1').fill = HF;
      execSheet.mergeCells('A1:D1');
      execSheet.getRow(1).height = 30;

      execSheet.addRow([`Report Generated: ${new Date().toLocaleString('en-IN')}`, '', `Transaction ID: ${transactionId || 'PREM-UNLOCKED'}`, '']);
      execSheet.addRow([]);

      execSheet.addRow(['Core Financial KPIs', 'Amount (INR)', 'Record Count', 'Audit Status']);
      const kpiHead = execSheet.getRow(4);
      kpiHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      kpiHead.eachCell((c) => { c.fill = HF; });

      const kpiData = [
        ['Total Trade-in Register Records', S.reg.reduce((a, r) => a + r.price, 0), k.tot, 'Source Baseline'],
        ['Deducted Retailer Payouts', S.reg.filter((r) => r.st === 'DEDUCTED').reduce((a, r) => a + r.price, 0), k.ded, 'Debit Confirmed'],
        ['GL-Booked Device Invoice Amount', k.dv, k.bk, 'Verified in Books'],
        ['GL-Booked Service Fee Amount (incl GST)', k.sv, k.bk, 'Verified in Books'],
        ['At-Risk / Unbooked Invoices from Servify', k.miss, k.ub, 'Dispute / Claim Required'],
        ['Cleanly Matched Books & GL', S.reg.filter((r) => r.rem === REM.M).reduce((a, r) => a + r.price, 0), k.M || 0, 'Reconciled 100%'],
      ];

      kpiData.forEach((row, i) => {
        const r = execSheet.addRow(row);
        r.getCell(2).numFmt = '#,##0.00;[Red](#,##0.00);-';
        r.getCell(3).numFmt = '#,##0';
        if (i % 2 === 0) r.eachCell((c) => { c.fill = BAND; });
      });

      execSheet.addRow([]);
      execSheet.addRow(['DISCREPANCY ACTION CHECKLIST FOR FINANCE TEAM']);
      execSheet.getCell('A13').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      execSheet.getCell('A13').fill = HF;
      execSheet.mergeCells('A13:D13');

      execSheet.addRow(['Priority', 'Issue Category', 'Affected Amount (INR)', 'Suggested Financial Action']);
      const actHead = execSheet.getRow(14);
      actHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      actHead.eachCell((c) => { c.fill = GOLD; });

      const actions = [
        ['HIGH', 'Unbooked Invoices in Customer Statement', inr(k.miss), 'Issue debit note or request Servify to post missing vouchers.'],
        ['HIGH', 'IMEI Deducted but not Billed in GL', inr(S.reg.filter((r) => r.rem === REM.I).reduce((a, r) => a + r.price, 0)), 'Audit retail point-of-sale deduction vs Servify invoice queue.'],
        ['MEDIUM', 'Price Difference on Booked Invoices', inr(S.reg.filter((r) => r.rem === REM.X).reduce((a, r) => a + Math.abs(r.devD || 0) + Math.abs(r.svcD || 0), 0)), 'Review retailer trade-in price vs billed invoice line price.'],
        ['MEDIUM', 'AR of Service Fee Not Booked', inr(S.reg.filter((r) => r.rem === REM.R).reduce((a, r) => a + r.fee, 0)), 'Book service fee voucher in GL accounting system.'],
      ];

      actions.forEach((row, i) => {
        const r = execSheet.addRow(row);
        if (i % 2 === 0) r.eachCell((c) => { c.fill = BAND; });
      });

      for (let j = 1; j <= 4; j++) execSheet.getColumn(j).width = 32;

      // --- PREMIUM SHEET 2: Advanced Root Cause Analysis (Only for advanced report) ---
      if (reportType === 'advanced') {
        let rootSheet = pWb.getWorksheet('Root Cause & Tax Analysis');
        if (rootSheet) pWb.removeWorksheet(rootSheet.id);
        rootSheet = pWb.addWorksheet('Root Cause & Tax Analysis');

        rootSheet.addRow(['ADVANCED ROOT CAUSE & GST TAX COMPLIANCE AUDIT']);
        rootSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        rootSheet.getCell('A1').fill = HF;
        rootSheet.mergeCells('A1:E1');

        rootSheet.addRow([`Report Grade: Enterprise Deep-Dive`, '', '', `Reconciliation Engine: v2.0`, '']);
        rootSheet.addRow([]);

        rootSheet.addRow(['Root Cause Category', 'Count', 'Variance ₹', 'Risk Level', 'Mitigation Strategy']);
        const rcHead = rootSheet.getRow(4);
        rcHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        rcHead.eachCell((c) => { c.fill = HF; });

        const unmappedLines = S.lines.filter((l) => !l.booked);
        const diffRecords = S.reg.filter((r) => r.rem === REM.X);

        const rootCauses = [
          ['Timing Discrepancy (Voucher Pending Posting)', k.dmiss, k.miss, 'Low-Medium', 'Wait for next billing cycle or request ledger confirmation.'],
          ['Rate / Tax Variance (GST Calculation Mismatch)', diffRecords.length, diffRecords.reduce((a, r) => a + Math.abs(r.svcD || 0), 0), 'Medium', 'Verify 18% GST inclusivity toggle with Servify rate matrix.'],
          ['Unmapped Trade-in Reference', S.exc.filter((e) => e.Type === 'Unmapped invoice line').length, 0, 'High', 'Cross-reference POS transaction ID with retailer system.'],
          ['Shared Invoice Lines Across References', S.exc.filter((e) => e.Type === 'Shared invoice').length, 0, 'Medium', 'Verify whether invoice bundling occurred at Servify.'],
        ];

        rootCauses.forEach((row, i) => {
          const r = rootSheet.addRow(row);
          r.getCell(3).numFmt = '#,##0.00;[Red](#,##0.00);-';
          if (i % 2 === 0) r.eachCell((c) => { c.fill = BAND; });
        });

        rootSheet.addRow([]);
        rootSheet.addRow(['GST & INPUT TAX CREDIT (ITC) ELIGIBILITY SUMMARY']);
        rootSheet.getCell('A10').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        rootSheet.getCell('A10').fill = HF;
        rootSheet.mergeCells('A10:E10');

        rootSheet.addRow(['Tax Line Item', 'GST Rate', 'Base Amount ₹', 'GST Amount ₹', 'ITC Eligibility']);
        const gstHead = rootSheet.getRow(11);
        gstHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        gstHead.eachCell((c) => { c.fill = GOLD; });

        const svcBookedLines = S.lines.filter((l) => l.booked && l.type === 'Service Fee');
        const totalBaseFee = svcBookedLines.reduce((a, l) => a + l.amt, 0);
        const totalGst = svcBookedLines.reduce((a, l) => a + (l.gst || 0), 0);

        const taxSummary = [
          ['Service Fee / Logistics Commission', `${document.getElementById('gst')?.value || 18}%`, totalBaseFee, totalGst, 'Eligible (Forward Charge)'],
          ['Device Trade-in Value (Non-GST / Margin)', '0%', k.dv, 0, 'Exempt / Not Applicable'],
          ['Unbooked Service Fee GST at Risk', `${document.getElementById('gst')?.value || 18}%`, unmappedLines.filter((l) => l.type === 'Service Fee').reduce((a, l) => a + l.amt, 0), unmappedLines.filter((l) => l.type === 'Service Fee').reduce((a, l) => a + (l.gst || 0), 0), 'Ineligible until Voucher Booked'],
        ];

        taxSummary.forEach((row, i) => {
          const r = rootSheet.addRow(row);
          r.getCell(3).numFmt = '#,##0.00;[Red](#,##0.00);-';
          r.getCell(4).numFmt = '#,##0.00;[Red](#,##0.00);-';
          if (i % 2 === 0) r.eachCell((c) => { c.fill = BAND; });
        });

        for (let j = 1; j <= 5; j++) rootSheet.getColumn(j).width = 28;
      }

      const fileName = reportType === 'advanced'
        ? 'Trade_in_Advanced_Mismatch_Analysis.xlsx'
        : 'Trade_in_Detailed_Reconciliation_Report.xlsx';

      // Save using standard save() function from index.html
      await save(pWb, fileName);
    } catch (err) {
      console.error('Failed to generate premium workbook:', err);
      alert('Error generating premium workbook: ' + err.message);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

