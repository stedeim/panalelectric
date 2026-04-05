import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface Proposal {
  id: string;
  clientName: string;
  date: string;
  businessName: string;
}

interface FormData {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  clientName: string;
  clientAddress: string;
  jobAddress: string;
  jobDescription: string;
  lineItems: LineItem[];
  taxRate: number;
  terms: string;
  template: 'basic' | 'professional' | 'premium';
  date: string;
}

const DEFAULT_TERMS = `1. This proposal is valid for 30 days from the date issued.\n2. A deposit of 50% is required to begin work.\n3. Final payment is due upon completion of work.\n4. Any additional work not included in this proposal will require a written change order.\n5. We are not responsible for delays caused by factors beyond our control.\n6. All materials are guaranteed to be as specified.`;

const TEMPLATE_THEMES = {
  basic: { bg: 'bg-white', accent: 'text-slate-900', border: 'border-gray-200', headerBg: 'bg-slate-900' },
  professional: { bg: 'bg-white', accent: 'text-slate-900', border: 'border-gray-300', headerBg: 'bg-slate-900' },
  premium: { bg: 'bg-gradient-to-br from-slate-900 to-slate-800', accent: 'text-white', border: 'border-amber-400', headerBg: 'bg-amber-400' },
};

function generateProposalHTML(data: FormData, theme: typeof TEMPLATE_THEMES.professional): string {
  const subtotal = data.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax;

  const itemsHTML = data.lineItems.map((item, i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600">${item.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">${item.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700">$${(item.qty * item.unitPrice).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Proposal - ${data.clientName}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a2e; background: #f8f9fa; }
  .sheet { max-width: 800px; margin: 0 auto; background: white; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 12px; }
  .header { padding-bottom: 32px; border-bottom: 3px solid ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'}; margin-bottom: 32px; }
  .accent { color: ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'} }
  h1 { font-size: 28px; font-weight: 900; margin: 0 0 4px 0; }
  .subtitle { color: #64748b; font-size: 14px; margin: 0; }
  .proposal-id { text-align: right; font-size: 13px; color: #64748b; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin: 0 0 8px 0; }
  .info-block p { margin: 3px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
  th { background: ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'}; color: ${theme.headerBg === 'bg-amber-400' ? '#1D2D44' : 'white'}; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
  .totals { margin-left: auto; width: 320px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  .totals-row.total { border-bottom: none; border-top: 2px solid ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'}; padding-top: 12px; font-size: 20px; font-weight: 900; color: ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'}; }
  .terms { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-top: 32px; }
  .terms h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 800; }
  .terms p { margin: 0; font-size: 13px; color: #475569; white-space: pre-line; line-height: 1.7; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  .dark-header { background: ${theme.headerBg === 'bg-amber-400' ? '#F9B934' : '#1D2D44'}; color: ${theme.headerBg === 'bg-amber-400' ? '#1D2D44' : 'white'}; }
  @media print { body { background: white; padding: 0; } .sheet { box-shadow: none; padding: 40px; } }
</style>
</head>
<body>
<div class="sheet">
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h1 class="accent">${data.businessName}</h1>
        <p class="subtitle">${data.businessAddress}</p>
        <p class="subtitle">${data.businessPhone} · ${data.businessEmail}</p>
      </div>
      <div class="proposal-id">
        <div class="accent" style="font-size:22px;font-weight:900">PROPOSAL</div>
        <div style="margin-top:4px">${data.date}</div>
      </div>
    </div>
  </div>

  <div class="grid2">
    <div class="info-block">
      <p class="section-title">Prepared For</p>
      <p style="font-weight:800;font-size:16px">${data.clientName}</p>
      <p>${data.clientAddress}</p>
    </div>
    <div class="info-block">
      <p class="section-title">Project Location</p>
      <p>${data.jobAddress}</p>
    </div>
  </div>

  ${data.jobDescription ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:32px">
    <p class="section-title">Scope of Work</p>
    <p style="font-size:14px;line-height:1.7;margin:0">${data.jobDescription}</p>
  </div>` : ''}

  <table>
    <thead><tr>
      <th style="width:40px">#</th>
      <th>Description</th>
      <th style="text-align:right">Qty</th>
      <th style="text-align:right">Unit Price</th>
      <th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${itemsHTML}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="totals-row"><span>Tax (${data.taxRate}%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="totals-row total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
  </div>

  <div class="terms">
    <h3 class="accent">Terms & Conditions</h3>
    <p>${data.terms || DEFAULT_TERMS}</p>
  </div>

  <div class="footer">
    <p>Thank you for your business. We look forward to working with you.</p>
    <p style="margin-top:8px">${data.businessName} · ${data.businessPhone} · ${data.businessEmail}</p>
  </div>
</div>
</body>
</html>`;
}

function ProposalPreview({ data }: { data: FormData }) {
  const subtotal = data.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax;
  const theme = TEMPLATE_THEMES[data.template];

  return (
    <div className="space-y-4">
      {/* Mini Proposal Preview */}
      <div className={`rounded-xl border ${theme.border} ${theme.bg} overflow-hidden`}>
        <div className={`px-5 py-4 ${theme.headerBg === 'bg-amber-400' ? 'bg-amber-400' : 'bg-slate-900'} flex items-center justify-between`}>
          <div>
            <div className={`font-black text-lg ${theme.headerBg === 'bg-amber-400' ? 'text-slate-900' : 'text-white'}`}>{data.businessName || 'Your Business Name'}</div>
            <div className={`text-xs ${theme.headerBg === 'bg-amber-400' ? 'text-slate-700' : 'text-slate-400'}`}>{data.businessPhone} · {data.businessEmail}</div>
          </div>
          <div className={`text-right ${theme.headerBg === 'bg-amber-400' ? 'text-slate-900' : 'text-white'}`}>
            <div className="font-black">PROPOSAL</div>
            <div className="text-xs opacity-80">{data.date}</div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Prepared For</div>
              <div className={`font-bold text-sm ${theme.accent}`}>{data.clientName || 'Client Name'}</div>
              <div className="text-xs text-slate-500">{data.clientAddress || 'Client Address'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Job Location</div>
              <div className={`text-sm font-semibold ${theme.accent}`}>{data.jobAddress || 'Job Address'}</div>
            </div>
          </div>
          {data.jobDescription && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Scope of Work</div>
              <div className="text-xs text-slate-600">{data.jobDescription}</div>
            </div>
          )}
          {/* Line items */}
          <div className="text-xs">
            <div className={`grid grid-cols-12 gap-1 font-bold ${theme.headerBg === 'bg-amber-400' ? 'text-slate-900' : 'text-white'} bg-slate-900 rounded-t-lg p-2`}>
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {data.lineItems.length === 0 && (
              <div className="text-center text-slate-400 py-3 border border-t-0 border-gray-100">No items yet</div>
            )}
            {data.lineItems.map((item, i) => (
              <div key={i} className={`grid grid-cols-12 gap-1 p-2 border border-t-0 border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="col-span-6 font-semibold">{item.description || 'Item ' + (i + 1)}</div>
                <div className="col-span-2 text-right text-slate-600">{item.qty}</div>
                <div className="col-span-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</div>
                <div className="col-span-2 text-right font-bold">${(item.qty * item.unitPrice).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-slate-500"><span>Tax ({data.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
            <div className={`flex justify-between font-black text-base border-t-2 ${theme.headerBg === 'bg-amber-400' ? 'border-amber-400 text-amber-700' : 'border-slate-900 text-slate-900'} pt-1`}><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM: FormData = {
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  clientName: '',
  clientAddress: '',
  jobAddress: '',
  jobDescription: '',
  lineItems: [{ description: '', qty: 1, unitPrice: 0 }],
  taxRate: 13,
  terms: DEFAULT_TERMS,
  template: 'professional',
  date: new Date().toLocaleDateString(),
};

export default function ProposalBuilderPage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ep_proposals');
    if (saved) setSavedProposals(JSON.parse(saved));
  }, []);

  function updateItem(i: number, field: keyof LineItem, val: string | number) {
    setForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, idx) =>
        idx === i ? { ...item, [field]: field === 'description' ? val : Number(val) } : item
      ),
    }));
  }

  function addItem() {
    setForm(prev => ({ ...prev, lineItems: [...prev.lineItems, { description: '', qty: 1, unitPrice: 0 }] }));
  }

  function removeItem(i: number) {
    setForm(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, idx) => idx !== i) }));
  }

  function saveProposal() {
    if (!form.clientName) { alert('Please enter a client name'); return; }
    const proposal: Proposal = { id: Date.now().toString(), clientName: form.clientName, date: form.date || new Date().toLocaleDateString(), businessName: form.businessName };
    const updated = [proposal, ...savedProposals].slice(0, 50);
    setSavedProposals(updated);
    localStorage.setItem('ep_proposals', JSON.stringify(updated));
    setSavedMsg('✓ Proposal saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function loadProposal(id: string) {
    const saved = localStorage.getItem(`ep_proposal_${id}`);
    if (saved) {
      setForm(JSON.parse(saved));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function saveCurrentToStorage(id: string) {
    localStorage.setItem(`ep_proposal_${id}`, JSON.stringify(form));
  }

  function openPDF() {
    const html = generateProposalHTML(form, TEMPLATE_THEMES[form.template]);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  function emailProposal() {
    const subtotal = form.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const tax = subtotal * (form.taxRate / 100);
    const total = subtotal + tax;
    const subject = encodeURIComponent(`Proposal from ${form.businessName} — ${form.clientName}`);
    const body = encodeURIComponent(`Dear ${form.clientName},\n\nPlease find our proposal for the following work:\n\n${form.jobDescription}\n\nTotal: $${total.toFixed(2)}\n\nPlease reply to this email if you have any questions.\n\nBest regards,\n${form.businessName}\n${form.businessPhone}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function loadSaved(id: string) {
    const raw = localStorage.getItem(`ep_proposal_${id}`);
    if (raw) setForm(JSON.parse(raw));
  }

  const subtotal = form.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = subtotal * (form.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="font-black">Proposal Builder</h1>
            <p className="text-slate-400 text-sm">Create professional proposals in minutes</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your Business */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">Your Business</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Business Name</label>
                    <input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Your Company Inc."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Phone</label>
                    <input value={form.businessPhone} onChange={e => setForm({ ...form, businessPhone: e.target.value })} placeholder="(555) 000-0000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email</label>
                    <input value={form.businessEmail} onChange={e => setForm({ ...form, businessEmail: e.target.value })} placeholder="you@company.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Address</label>
                    <input value={form.businessAddress} onChange={e => setForm({ ...form, businessAddress: e.target.value })} placeholder="123 Main St, City, ST"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Client & Job */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">Client & Job Details</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Client Name *</label>
                    <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client or business name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Client Address</label>
                    <input value={form.clientAddress} onChange={e => setForm({ ...form, clientAddress: e.target.value })} placeholder="Client's address"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Job Address</label>
                  <input value={form.jobAddress} onChange={e => setForm({ ...form, jobAddress: e.target.value })} placeholder="Address where work will be performed"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Scope of Work</label>
                  <textarea value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} rows={3} placeholder="Describe what you'll do..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none" />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <h2 className="font-black text-sm">Line Items</h2>
                <div className="flex gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold mr-2">Tax %</label>
                    <input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-400" />
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {form.lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item description"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} min={1}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} min={0} step={0.01}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="col-span-2 text-right font-black text-slate-900 text-sm">
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </div>
                    <div className="col-span-1 text-right">
                      {form.lineItems.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addItem}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2 text-sm font-bold text-slate-500 hover:border-amber-400 hover:text-amber-600 transition-colors">
                  + Add Line Item
                </button>
                <div className="bg-slate-900 text-white rounded-xl p-4 mt-4">
                  <div className="flex justify-between text-sm text-slate-400 mb-1"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-slate-400 mb-1"><span>Tax ({form.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xl font-black text-amber-400 border-t border-slate-700 mt-2 pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">Terms & Conditions</h2>
              </div>
              <div className="p-5">
                <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} rows={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
            </div>

            {/* Template & Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">Template & Actions</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Template Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['basic', 'professional', 'premium'] as const).map(t => (
                      <button key={t} onClick={() => setForm({ ...form, template: t })}
                        className={`px-4 py-3 rounded-xl font-bold text-xs capitalize transition-colors border-2 ${form.template === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 text-slate-600 hover:border-slate-400'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveProposal}
                    className="bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                    {savedMsg || '💾 Save Proposal'}
                  </button>
                  <button onClick={emailProposal}
                    className="bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                    📧 Email Proposal
                  </button>
                  <button onClick={openPDF}
                    className="col-span-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors text-sm">
                    🖨️ Download / Print PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Proposals */}
            {savedProposals.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3">
                  <h2 className="font-black text-sm">Saved Proposals</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {savedProposals.slice(0, 10).map(p => (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{p.clientName}</div>
                        <div className="text-xs text-slate-400">{p.businessName} · {p.date}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadSaved(p.id)} className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200">Load</button>
                        <button onClick={() => { localStorage.removeItem(`ep_proposal_${p.id}`); setSavedProposals(prev => prev.filter(x => x.id !== p.id)); localStorage.setItem('ep_proposals', JSON.stringify(savedProposals.filter(x => x.id !== p.id))); }}
                          className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <div className="text-xs font-bold text-slate-500 uppercase mb-3">📄 Live Preview</div>
              <ProposalPreview data={form} />
              <div className="mt-4 text-xs text-center text-slate-400">
                This is a preview. Use "Download PDF" for a print-ready version.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
