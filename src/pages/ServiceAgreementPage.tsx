import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ServiceScope {
  label: string;
  checked: boolean;
}

interface Agreement {
  id: string;
  type: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLicense: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  responseTime: string;
  pricingMode: string;
  monthlyPrice: string;
  scope: ServiceScope[];
  terms: string;
  createdAt: number;
}

const LS_KEY = 'ep_agreements';

function uid() { return Math.random().toString(36).slice(2, 9); }

const SCOPE_OPTIONS = [
  'Electrical Inspection', 'Panel Testing', 'Outlet & Switch Repair',
  'Lighting Maintenance', 'Emergency Service (24/7)', 'Circuit Tracing & Repair',
  'Smoke/CO Detector Service', 'Surge Protection Check', 'Grounding System Check',
];

const AGREEMENT_TYPES = [
  'Annual Maintenance Agreement',
  'Service Agreement',
  'Commercial Service Agreement',
];

const DEFAULT_TERMS = `This agreement is entered into between the Contractor and Client for electrical services as described above. Contractor agrees to provide services in a professional and workmanlike manner in accordance with all applicable electrical codes and standards. Client agrees to provide reasonable access to the premises and to pay for services rendered within 15 days of invoice. Either party may terminate this agreement with 30 days written notice. Contractor carries general liability insurance and workers compensation coverage.`;

export default function ServiceAgreementPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [form, setForm] = useState<Partial<Agreement>>({
    type: AGREEMENT_TYPES[0],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    responseTime: 'Same day',
    pricingMode: 'Monthly',
    monthlyPrice: '149',
    scope: SCOPE_OPTIONS.map(label => ({ label, checked: false })),
    terms: DEFAULT_TERMS,
  });

  useEffect(() => {
    setAgreements(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  }, []);

  function saveAgreement() {
    if (!form.clientName || !form.businessName) return;
    const agree: Agreement = {
      id: uid(),
      type: form.type || AGREEMENT_TYPES[0],
      businessName: form.businessName || '',
      businessAddress: form.businessAddress || '',
      businessPhone: form.businessPhone || '',
      businessEmail: form.businessEmail || '',
      businessLicense: form.businessLicense || '',
      clientName: form.clientName || '',
      clientAddress: form.clientAddress || '',
      clientPhone: form.clientPhone || '',
      clientEmail: form.clientEmail || '',
      startDate: form.startDate || '',
      endDate: form.endDate || '',
      responseTime: form.responseTime || 'Same day',
      pricingMode: form.pricingMode || 'Monthly',
      monthlyPrice: form.monthlyPrice || '0',
      scope: form.scope || [],
      terms: form.terms || '',
      createdAt: Date.now(),
    };
    const updated = [agree, ...agreements];
    setAgreements(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    alert('Agreement saved!');
  }

  function toggleScope(idx: number) {
    const updated = [...(form.scope || [])];
    updated[idx] = { ...updated[idx], checked: !updated[idx].checked };
    setForm(f => ({ ...f, scope: updated }));
  }

  function calcPrice() {
    const base = parseFloat(form.monthlyPrice || '0');
    if (form.pricingMode === 'Quarterly') return (base * 3).toFixed(2);
    if (form.pricingMode === 'Annual') return (base * 12 * 0.9).toFixed(2);
    return base.toFixed(2);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">📜 Service Agreement</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={saveAgreement} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300">💾 Save</button>
          <button onClick={() => window.print()} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-600">🖨️ Print</button>
          <button onClick={() => {
            const subject = encodeURIComponent(`Service Agreement from ${form.businessName}`);
            const body = encodeURIComponent(`Dear ${form.clientName},\n\nPlease find our service agreement attached.\n\nBest regards,\n${form.businessName}`);
            window.location.href = `mailto:${form.clientEmail}?subject=${subject}&body=${body}`;
          }} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-500">📧 Email</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Type Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {AGREEMENT_TYPES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${form.type === t ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6" id="agreement-print">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-6">{form.type}</h2>

          {/* Business Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Service Provider</h3>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="Business Name" value={form.businessName || ''} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 resize-none" rows={2} placeholder="Business Address" value={form.businessAddress || ''} onChange={e => setForm(f => ({ ...f, businessAddress: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Phone" value={form.businessPhone || ''} onChange={e => setForm(f => ({ ...f, businessPhone: e.target.value }))} />
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" value={form.businessEmail || ''} onChange={e => setForm(f => ({ ...f, businessEmail: e.target.value }))} />
              </div>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-2" placeholder="License #" value={form.businessLicense || ''} onChange={e => setForm(f => ({ ...f, businessLicense: e.target.value }))} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Client</h3>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="Client Name" value={form.clientName || ''} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 resize-none" rows={2} placeholder="Client Address" value={form.clientAddress || ''} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Phone" value={form.clientPhone || ''} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} />
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" value={form.clientEmail || ''} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Start Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">End Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Response Time</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.responseTime || 'Same day'} onChange={e => setForm(f => ({ ...f, responseTime: e.target.value }))}>
                <option>Same day</option><option>24 hours</option><option>48 hours</option>
              </select>
            </div>
          </div>

          {/* Scope */}
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Scope of Services</h3>
            <div className="grid grid-cols-2 gap-2">
              {(form.scope || SCOPE_OPTIONS.map(l => ({ label: l, checked: false }))).map((s, i) => (
                <label key={s.label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 cursor-pointer">
                  <input type="checkbox" checked={s.checked} onChange={() => toggleScope(i)} className="accent-amber-400 w-4 h-4" />
                  <span className="text-sm text-slate-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Pricing</h3>
            <div className="flex gap-2 mb-3">
              {['Monthly', 'Quarterly', 'Annual'].map(mode => (
                <button key={mode} onClick={() => setForm(f => ({ ...f, pricingMode: mode }))}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${form.pricingMode === mode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-600'}`}>
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">$</span>
              <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-32" type="number" value={form.monthlyPrice || ''} onChange={e => setForm(f => ({ ...f, monthlyPrice: e.target.value }))} />
              <span className="text-slate-500 text-sm">per month</span>
              <div className="ml-auto bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                <div className="text-xs text-slate-500">Total: </div>
                <div className="font-black text-amber-600">${calcPrice()} / {form.pricingMode === 'Annual' ? 'year' : form.pricingMode === 'Quarterly' ? 'quarter' : 'month'}</div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-2">Terms & Conditions</h3>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" rows={6} value={form.terms || ''} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} />
          </div>

          {/* Signature Blocks */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
            <div>
              <div className="border-b-2 border-slate-300 h-10 mb-1"></div>
              <div className="text-xs text-slate-500 font-semibold">{form.businessName || 'Contractor'} — Signature & Date</div>
            </div>
            <div>
              <div className="border-b-2 border-slate-300 h-10 mb-1"></div>
              <div className="text-xs text-slate-500 font-semibold">{form.clientName || 'Client'} — Signature & Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
