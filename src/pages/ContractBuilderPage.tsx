import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ContractForm {
  // Your business
  businessName: string;
  businessLicense: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  // Client
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  // Job
  scopeOfWork: string;
  jobAddress: string;
  startDate: string;
  completionDate: string;
  // Pricing
  pricingType: 'fixed' | 'tandm';
  fixedPrice: number;
  depositPercent: number;
  paymentSchedule: string;
  // Terms
  liabilityClause: string;
  changeOrderProcess: string;
  permitResponsibility: 'contractor' | 'client' | 'shared';
  warrantyYears: number;
  // Signatures
  contractorSignature: string;
  clientSignature: string;
  contractDate: string;
}

const DEFAULT_SCOPE = `The Contractor agrees to provide all labor, materials, and equipment necessary to complete the electrical work described below at the job site. All work shall be performed in accordance with applicable local, state, and national electrical codes and regulations, including the current edition of the National Electrical Code (NEC).`;

const DEFAULT_LIABILITY = `The Contractor shall maintain general liability insurance coverage of at least $1,000,000 per occurrence and $2,000,000 aggregate. The Contractor is not responsible for any damage to property not part of the contracted work scope, nor for any injury to persons not directly employed by the Contractor. The Client agrees to maintain adequate property insurance coverage for the premises during the project.`;

const DEFAULT_CHANGE_ORDER = `Any additional work not included in this contract requires a written Change Order signed by both parties before work begins. Change Orders will include a description of the additional work, associated costs, and any schedule adjustments. No additional work will be performed without an approved Change Order.`;

const DEFAULT_PAYMENT = `1. Deposit (50%): Due upon signing this agreement before work begins.\n2. Progress Payment (40%): Due upon completion of rough-in inspection.\n3. Final Payment (10%): Due upon completion of final inspection and before occupancy.`;

const EMPTY: ContractForm = {
  businessName: '',
  businessLicense: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  clientName: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
  scopeOfWork: DEFAULT_SCOPE,
  jobAddress: '',
  startDate: '',
  completionDate: '',
  pricingType: 'fixed',
  fixedPrice: 0,
  depositPercent: 50,
  paymentSchedule: DEFAULT_PAYMENT,
  liabilityClause: DEFAULT_LIABILITY,
  changeOrderProcess: DEFAULT_CHANGE_ORDER,
  permitResponsibility: 'contractor',
  warrantyYears: 1,
  contractorSignature: '',
  clientSignature: '',
  contractDate: new Date().toLocaleDateString(),
};

function generateContractHTML(form: ContractForm): string {
  const deposit = form.pricingType === 'fixed' ? form.fixedPrice * (form.depositPercent / 100) : 0;
  const permitLabel = form.permitResponsibility === 'contractor' ? 'Contractor shall obtain all required permits' : form.permitResponsibility === 'client' ? 'Client shall obtain all required permits' : 'Permits responsibility to be determined per scope item';
  const pricingText = form.pricingType === 'fixed'
    ? `$${form.fixedPrice.toLocaleString()} (Fixed Price)`
    : 'Time and Materials (billed at hourly rates + material cost)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Master Electrical Service Agreement — ${form.clientName}</title>
<style>
  body { font-family: 'Georgia', serif; margin: 0; padding: 40px; background: #f8f9fa; color: #1a1a2e; font-size: 15px; line-height: 1.7; }
  .sheet { max-width: 800px; margin: 0 auto; background: white; padding: 56px 64px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 8px; }
  h1 { font-size: 24px; font-weight: 900; text-align: center; margin: 0 0 6px 0; color: #1D2D44; text-transform: uppercase; letter-spacing: 1px; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 32px; }
  h2 { font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #1D2D44; border-bottom: 2px solid #1D2D44; padding-bottom: 6px; margin: 28px 0 12px 0; }
  p { margin: 0 0 10px 0; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 16px 0; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; }
  .info-box h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 0 8px 0; }
  .info-box p { font-size: 14px; margin: 3px 0; }
  .sig-section { margin-top: 40px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 24px; }
  .sig-line { border-top: 1px solid #1a1a2e; padding-top: 8px; margin-top: 8px; }
  .sig-label { font-size: 13px; color: #64748b; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  ol { padding-left: 20px; margin: 8px 0; }
  ol li { margin-bottom: 6px; }
  strong { color: #1D2D44; }
  @media print { body { background: white; padding: 0; } .sheet { box-shadow: none; } }
</style>
</head>
<body>
<div class="sheet">
  <h1>Master Electrical Service Agreement</h1>
  <p class="subtitle">Contract No. _________ &nbsp;|&nbsp; Date: ${form.contractDate}</p>

  <div class="grid2">
    <div class="info-box">
      <h3>Contractor</h3>
      <p><strong>${form.businessName}</strong></p>
      <p>License #: ${form.businessLicense}</p>
      <p>${form.businessAddress}</p>
      <p>${form.businessPhone}</p>
      <p>${form.businessEmail}</p>
    </div>
    <div class="info-box">
      <h3>Client</h3>
      <p><strong>${form.clientName}</strong></p>
      <p>${form.clientAddress}</p>
      <p>${form.clientPhone}</p>
      <p>${form.clientEmail}</p>
    </div>
  </div>

  <h2>1. Scope of Work</h2>
  <p>${form.scopeOfWork}</p>
  <p><strong>Job Site Address:</strong> ${form.jobAddress}</p>
  <p><strong>Project Start Date:</strong> ${form.startDate} &nbsp;&nbsp; <strong>Est. Completion:</strong> ${form.completionDate}</p>

  <h2>2. Compensation</h2>
  <p><strong>Total Contract Price:</strong> ${pricingText}</p>
  ${form.pricingType === 'fixed' ? `<p>A deposit of <strong>${form.depositPercent}% ($${deposit.toLocaleString()})</strong> is required upon signing this agreement.</p>` : ''}
  <p><strong>Payment Schedule:</strong></p>
  <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;font-size:14px">${form.paymentSchedule}</div>

  <h2>3. Permits & Compliance</h2>
  <p>${permitLabel}. All work shall be performed in compliance with the current edition of the National Electrical Code (NEC), applicable local codes, and any other relevant regulations. The Contractor is responsible for scheduling and passing all required inspections.</p>

  <h2>4. Change Orders</h2>
  <p>${form.changeOrderProcess}</p>

  <h2>5. Liability</h2>
  <p>${form.liabilityClause}</p>

  <h2>6. Warranty</h2>
  <p>The Contractor warrants all labor performed under this agreement for a period of <strong>${form.warrantyYears} year${form.warrantyYears > 1 ? 's' : ''}</strong> from the date of final inspection. This warranty covers defective workmanship but does not cover damage caused by improper use, unauthorized modifications, or acts of God. All manufacturer warranties on installed materials are passed through to the Client.</p>

  <h2>7. Termination</h2>
  <p>Either party may terminate this agreement with 5 business days written notice. Upon termination, the Client shall pay the Contractor for all work completed to the date of termination, including materials purchased. If the Contractor terminates due to non-payment, the Contractor retains the right to remove all materials installed until full payment is received.</p>

  <h2>8. Governing Law</h2>
  <p>This agreement shall be governed by and construed in accordance with the laws of the state in which the work is performed. Any disputes shall be resolved in the jurisdiction where the job site is located.</p>

  <div class="sig-section">
    <h2 style="border-bottom:none;text-align:center;margin-bottom:0">Signatures</h2>
    <p style="text-align:center;color:#64748b;font-size:13px;margin-top:4px">By signing below, both parties agree to the terms and conditions set forth in this agreement.</p>
    <div class="sig-grid">
      <div>
        <div class="sig-line">
          <div class="sig-label">Contractor Signature</div>
          <div style="font-style:italic;color:#64748b;margin-top:4px">${form.contractorSignature || '(Signature)'}</div>
        </div>
        <div style="margin-top:16px">
          <div class="sig-label">Print Name: <strong>${form.businessName}</strong></div>
        </div>
        <div style="margin-top:8px">
          <div class="sig-label">Date: ${form.contractDate}</div>
        </div>
      </div>
      <div>
        <div class="sig-line">
          <div class="sig-label">Client Signature</div>
          <div style="font-style:italic;color:#64748b;margin-top:4px">${form.clientSignature || '(Signature)'}</div>
        </div>
        <div style="margin-top:16px">
          <div class="sig-label">Print Name: <strong>${form.clientName}</strong></div>
        </div>
        <div style="margin-top:8px">
          <div class="sig-label">Date: ${form.contractDate}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>${form.businessName} · License #${form.businessLicense} · ${form.businessPhone}</p>
    <p>This document was generated using ElectricianPro — PanelElectric</p>
  </div>
</div>
</body>
</html>`;
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="font-black text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number; placeholder?: string }) {
  const common = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: 'w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm',
  };
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">{label}</label>
      {rows ? <textarea {...common} rows={rows} className={common.className + ' resize-none'} /> : <input type={type} {...common} />}
    </div>
  );
}

function ContractPreview({ form }: { form: ContractForm }) {
  const pricingText = form.pricingType === 'fixed'
    ? `$${form.fixedPrice.toLocaleString()} (Fixed Price)`
    : 'Time and Materials';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden font-serif text-sm">
      <div className="bg-slate-900 text-white px-4 py-3 text-center">
        <div className="font-black text-sm tracking-wider uppercase">Master Electrical Service Agreement</div>
        <div className="text-slate-400 text-xs mt-0.5">Contract Date: {form.contractDate}</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Contractor</div>
            <div className="font-bold text-slate-900 text-xs">{form.businessName || '—'}</div>
            <div className="text-slate-500 text-xs">{form.businessLicense && `Lic: ${form.businessLicense}`}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Client</div>
            <div className="font-bold text-slate-900 text-xs">{form.clientName || '—'}</div>
            <div className="text-slate-500 text-xs">{form.clientPhone || form.clientEmail}</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xs font-bold text-amber-600 uppercase mb-1">Compensation</div>
          <div className="font-black text-amber-700">{pricingText}</div>
          {form.pricingType === 'fixed' && <div className="text-xs text-amber-600 mt-1">Deposit: {form.depositPercent}%</div>}
        </div>
        <div className="text-xs text-slate-600 leading-relaxed border-t border-gray-100 pt-3">
          <div className="font-bold text-slate-800 uppercase text-xs mb-1">Scope Preview</div>
          <div className="line-clamp-3">{form.scopeOfWork}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-bold text-slate-500">Job Site:</span> <span className="text-slate-700">{form.jobAddress || '—'}</span></div>
          <div><span className="font-bold text-slate-500">Permits:</span> <span className="text-slate-700 capitalize">{form.permitResponsibility}</span></div>
          <div><span className="font-bold text-slate-500">Start:</span> <span className="text-slate-700">{form.startDate || '—'}</span></div>
          <div><span className="font-bold text-slate-500">Warranty:</span> <span className="text-slate-700">{form.warrantyYears}yr</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="text-xs">
            <div className="border-t border-gray-300 pt-1 mt-1">
              <div className="text-slate-400">Contractor</div>
              <div className="text-slate-700 italic">{form.contractorSignature || '(Signature)'}</div>
            </div>
          </div>
          <div className="text-xs">
            <div className="border-t border-gray-300 pt-1 mt-1">
              <div className="text-slate-400">Client</div>
              <div className="text-slate-700 italic">{form.clientSignature || '(Signature)'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractBuilderPage() {
  const [form, setForm] = useState<ContractForm>(EMPTY);
  const [savedMsg, setSavedMsg] = useState('');

  function set(field: keyof ContractForm, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function saveContract() {
    if (!form.clientName || !form.businessName) { alert('Please fill in your business name and client name'); return; }
    const saved = JSON.parse(localStorage.getItem('ep_contracts') || '[]');
    const entry = { id: Date.now().toString(), clientName: form.clientName, businessName: form.businessName, date: form.contractDate };
    localStorage.setItem('ep_contracts', JSON.stringify([entry, ...saved].slice(0, 50)));
    localStorage.setItem(`ep_contract_${entry.id}`, JSON.stringify(form));
    setSavedMsg('✓ Contract saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function openPDF() {
    const html = generateContractHTML(form);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  function emailContract() {
    const subject = encodeURIComponent(`Electrical Service Agreement — ${form.businessName}`);
    const body = encodeURIComponent(`Dear ${form.clientName},\n\nPlease find our Master Electrical Service Agreement attached.\n\nPlease review, sign, and return a copy to confirm your acceptance.\n\nBusiness: ${form.businessName}\nContact: ${form.businessPhone} / ${form.businessEmail}\nLicense #: ${form.businessLicense}\n\nWe look forward to working with you.\n\nBest regards,\n${form.businessName}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">📜</span>
          <div>
            <h1 className="font-black">Contract Builder</h1>
            <p className="text-slate-400 text-sm">Master Electrical Service Agreement</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-3 space-y-5">
            <SectionCard title="Your Business Information" icon="🏢">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Business Name *" value={form.businessName} onChange={v => set('businessName', v)} placeholder="Your Company Inc." />
                <Field label="Electrical License #" value={form.businessLicense} onChange={v => set('businessLicense', v)} placeholder="EC-000000" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Business Address" value={form.businessAddress} onChange={v => set('businessAddress', v)} placeholder="123 Main St, City, ST ZIP" />
                <Field label="Phone" value={form.businessPhone} onChange={v => set('businessPhone', v)} placeholder="(555) 000-0000" />
              </div>
              <Field label="Email" value={form.businessEmail} onChange={v => set('businessEmail', v)} placeholder="you@company.com" />
            </SectionCard>

            <SectionCard title="Client Information" icon="👤">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Client Name *" value={form.clientName} onChange={v => set('clientName', v)} placeholder="Client full name" />
                <Field label="Client Phone" value={form.clientPhone} onChange={v => set('clientPhone', v)} placeholder="(555) 000-0000" />
              </div>
              <Field label="Client Address" value={form.clientAddress} onChange={v => set('clientAddress', v)} placeholder="Client address" />
              <Field label="Client Email" value={form.clientEmail} onChange={v => set('clientEmail', v)} placeholder="client@email.com" />
            </SectionCard>

            <SectionCard title="Job Details" icon="🔧">
              <Field label="Scope of Work" value={form.scopeOfWork} onChange={v => set('scopeOfWork', v)} rows={6} placeholder="Describe the work..." />
              <div className="grid md:grid-cols-3 gap-4">
                <div md:col-span-1>
                  <Field label="Job Address" value={form.jobAddress} onChange={v => set('jobAddress', v)} placeholder="Job site address" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <Field label="Start Date" type="date" value={form.startDate} onChange={v => set('startDate', v)} />
                  <Field label="Est. Completion" type="date" value={form.completionDate} onChange={v => set('completionDate', v)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pricing & Payment" icon="💰">
              <div className="flex gap-3 mb-4">
                {([['fixed', 'Fixed Price'], ['tandm', 'Time & Materials']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => set('pricingType', val)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors border-2 ${form.pricingType === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 text-slate-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {form.pricingType === 'fixed' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Contract Price ($)" value={form.fixedPrice.toString()} onChange={v => set('fixedPrice', Number(v))} type="number" placeholder="0" />
                  <Field label="Deposit %" value={form.depositPercent.toString()} onChange={v => set('depositPercent', Number(v))} type="number" placeholder="50" />
                </div>
              )}
              <Field label="Payment Schedule" value={form.paymentSchedule} onChange={v => set('paymentSchedule', v)} rows={5} />
            </SectionCard>

            <SectionCard title="Terms & Conditions" icon="⚖️">
              <Field label="Liability Clause" value={form.liabilityClause} onChange={v => set('liabilityClause', v)} rows={4} />
              <Field label="Change Order Process" value={form.changeOrderProcess} onChange={v => set('changeOrderProcess', v)} rows={3} />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Permit Responsibility</label>
                  <div className="space-y-2">
                    {([['contractor', 'Contractor'], ['client', 'Client'], ['shared', 'Shared']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="permit" checked={form.permitResponsibility === val} onChange={() => set('permitResponsibility', val)}
                          className="accent-amber-400" />
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Labor Warranty (years)</label>
                  <input type="number" value={form.warrantyYears} onChange={e => set('warrantyYears', Number(e.target.value))} min={0} max={10}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Signatures" icon="✍️">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Field label="Contractor Signature Line (print name)" value={form.contractorSignature} onChange={v => set('contractorSignature', v)} placeholder="John Smith" />
                </div>
                <div>
                  <Field label="Client Signature Line (print name)" value={form.clientSignature} onChange={v => set('clientSignature', v)} placeholder="Jane Doe" />
                </div>
              </div>
              <Field label="Contract Date" type="date" value={form.contractDate} onChange={v => set('contractDate', v)} />
            </SectionCard>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">Actions</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveContract}
                    className="bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                    {savedMsg || '💾 Save Contract'}
                  </button>
                  <button onClick={emailContract}
                    className="bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                    📧 Email Contract
                  </button>
                  <button onClick={openPDF}
                    className="col-span-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors text-sm">
                    🖨️ Download / Print PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <div className="text-xs font-bold text-slate-500 uppercase mb-3">📜 Live Preview</div>
              <ContractPreview form={form} />
              <div className="mt-4 text-xs text-center text-slate-400">
                Use "Download PDF" to open a print-ready version in a new window.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
