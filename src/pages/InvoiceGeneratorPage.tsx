import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface InvoiceLine {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  rate: string;
  amount: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  jobAddress: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLicense: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  lines: InvoiceLine[];
  taxRate: string;
  paymentTerms: string;
  notes: string;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: number;
}

const LS_KEY = 'ep_invoices';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function calcAmount(qty: string, rate: string) {
  return (parseFloat(qty || '0') * parseFloat(rate || '0')).toFixed(2);
}

export default function InvoiceGeneratorPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Partial<Invoice>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [nextNum, setNextNum] = useState(1);

  useEffect(() => {
    const saved: Invoice[] = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    setInvoices(saved);
    const maxNum = saved.reduce((m, inv) => {
      const n = parseInt(inv.invoiceNumber.replace(/\D/g, '') || '0');
      return Math.max(m, n);
    }, 0);
    setNextNum(maxNum + 1);
  }, []);

  const save = useCallback((inv: Partial<Invoice>) => {
    const full: Invoice = {
      id: inv.id || uid(),
      invoiceNumber: inv.invoiceNumber || `INV-${String(nextNum).padStart(4, '0')}`,
      date: inv.date || new Date().toISOString().slice(0, 10),
      dueDate: inv.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      jobAddress: inv.jobAddress || '',
      businessName: inv.businessName || '',
      businessAddress: inv.businessAddress || '',
      businessPhone: inv.businessPhone || '',
      businessEmail: inv.businessEmail || '',
      businessLicense: inv.businessLicense || '',
      clientName: inv.clientName || '',
      clientAddress: inv.clientAddress || '',
      clientEmail: inv.clientEmail || '',
      clientPhone: inv.clientPhone || '',
      lines: inv.lines || [newLine()],
      taxRate: inv.taxRate || '0',
      paymentTerms: inv.paymentTerms || 'Net 15 — Payment due within 15 days of invoice date.',
      notes: inv.notes || '',
      status: inv.status || 'unpaid',
      createdAt: inv.createdAt || Date.now(),
    };
    const existing = invoices.find(i => i.id === full.id);
    let updated: Invoice[];
    if (existing) {
      updated = invoices.map(i => i.id === full.id ? full : i);
    } else {
      updated = [full, ...invoices];
      setNextNum(n => n + 1);
    }
    setInvoices(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    return full;
  }, [invoices, nextNum]);

  function newLine(): InvoiceLine {
    return { id: uid(), description: '', quantity: '1', unit: 'each', rate: '', amount: '' };
  }

  function updateLine(lines: InvoiceLine[], idx: number, field: keyof InvoiceLine, val: string) {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'rate') {
      updated[idx].amount = calcAmount(updated[idx].quantity, updated[idx].rate);
    }
    return updated;
  }

  function subtotal(lines: InvoiceLine[]) {
    return lines.reduce((s, l) => s + parseFloat(l.amount || '0'), 0);
  }

  function total(inv: Partial<Invoice>) {
    const sub = subtotal(inv.lines || []);
    const tax = sub * (parseFloat(inv.taxRate || '0') / 100);
    return sub + tax;
  }

  function handleSave() {
    const saved = save(activeInvoice);
    setEditingId(saved.id);
  }

  function loadInvoice(inv: Invoice) {
    setActiveInvoice({ ...inv });
    setEditingId(inv.id);
    setShowHistory(false);
  }

  function deleteInvoice(id: string) {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    if (editingId === id) {
      setActiveInvoice({ lines: [newLine()], status: 'unpaid' });
      setEditingId(null);
    }
  }

  function handleNew() {
    setActiveInvoice({
      lines: [newLine()],
      invoiceNumber: `INV-${String(nextNum).padStart(4, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      paymentTerms: 'Net 15 — Payment due within 15 days of invoice date.',
      status: 'unpaid',
    });
    setEditingId(null);
  }

  function handleEmail(inv: Partial<Invoice>) {
    const subject = `Invoice ${inv.invoiceNumber} from ${inv.businessName}`;
    const body = [
      `Invoice Number: ${inv.invoiceNumber}`,
      `Date: ${inv.date}`,
      `Due Date: ${inv.dueDate}`,
      `Total Due: $${total(inv).toFixed(2)}`,
      '',
      `Dear ${inv.clientName},`,
      `Please find your invoice attached. Payment is due within 15 days.`,
      `Thank you for your business!`,
    ].join('\n');
    window.location.href = `mailto:${inv.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const lines = activeInvoice.lines || [newLine()];
  const sub = subtotal(lines);
  const taxAmt = sub * (parseFloat(activeInvoice.taxRate || '0') / 100);
  const tot = sub + taxAmt;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">📄 Invoice Generator</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleNew} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300">+ New Invoice</button>
          <button onClick={() => setShowHistory(h => !h)} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-600">📋 History ({invoices.length})</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showHistory && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h2 className="font-black text-slate-900 mb-4">Invoice History</h2>
            {invoices.length === 0 ? (
              <p className="text-slate-400 text-sm">No saved invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{inv.status}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{inv.invoiceNumber} — {inv.clientName || 'No client'}</div>
                        <div className="text-xs text-slate-500">{inv.date} · {inv.jobAddress || 'No job address'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-black text-slate-900 mr-4">${total(inv).toFixed(2)}</div>
                      <button onClick={() => loadInvoice(inv)} className="text-blue-600 font-bold text-xs hover:underline">Load</button>
                      <button onClick={() => deleteInvoice(inv.id)} className="text-red-500 font-bold text-xs hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm" id="invoice-print">
          {/* Business Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-black text-slate-900 mb-3 text-sm uppercase tracking-wider">From</h3>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="Business Name" value={activeInvoice.businessName || ''} onChange={e => setActiveInvoice(i => ({ ...i, businessName: e.target.value }))} />
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 resize-none" placeholder="Business Address" rows={2} value={activeInvoice.businessAddress || ''} onChange={e => setActiveInvoice(i => ({ ...i, businessAddress: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Phone" value={activeInvoice.businessPhone || ''} onChange={e => setActiveInvoice(i => ({ ...i, businessPhone: e.target.value }))} />
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" value={activeInvoice.businessEmail || ''} onChange={e => setActiveInvoice(i => ({ ...i, businessEmail: e.target.value }))} />
              </div>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-2" placeholder="License #" value={activeInvoice.businessLicense || ''} onChange={e => setActiveInvoice(i => ({ ...i, businessLicense: e.target.value }))} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 mb-3 text-sm uppercase tracking-wider">Bill To</h3>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2" placeholder="Client Name" value={activeInvoice.clientName || ''} onChange={e => setActiveInvoice(i => ({ ...i, clientName: e.target.value }))} />
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 resize-none" placeholder="Client Address" rows={2} value={activeInvoice.clientAddress || ''} onChange={e => setActiveInvoice(i => ({ ...i, clientAddress: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Phone" value={activeInvoice.clientPhone || ''} onChange={e => setActiveInvoice(i => ({ ...i, clientPhone: e.target.value }))} />
                <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" value={activeInvoice.clientEmail || ''} onChange={e => setActiveInvoice(i => ({ ...i, clientEmail: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Invoice #</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold" value={activeInvoice.invoiceNumber || ''} onChange={e => setActiveInvoice(i => ({ ...i, invoiceNumber: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={activeInvoice.date || ''} onChange={e => setActiveInvoice(i => ({ ...i, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={activeInvoice.dueDate || ''} onChange={e => setActiveInvoice(i => ({ ...i, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Job Address</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Job site address" value={activeInvoice.jobAddress || ''} onChange={e => setActiveInvoice(i => ({ ...i, jobAddress: e.target.value }))} />
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-2 mb-6">
            {(['unpaid', 'paid', 'overdue'] as const).map(s => (
              <button key={s} onClick={() => setActiveInvoice(i => ({ ...i, status: s }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activeInvoice.status === s
                  ? s === 'paid' ? 'bg-green-500 text-white' : s === 'overdue' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'
                  : 'bg-gray-100 text-slate-500'
                }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>

          {/* Line Items */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-3 py-2 text-left text-xs font-bold rounded-tl-xl">Description</th>
                  <th className="px-3 py-2 text-center text-xs font-bold w-20">Qty</th>
                  <th className="px-3 py-2 text-center text-xs font-bold w-24">Unit</th>
                  <th className="px-3 py-2 text-right text-xs font-bold w-28">Rate ($)</th>
                  <th className="px-3 py-2 text-right text-xs font-bold w-28 rounded-tr-xl">Amount ($)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-gray-100">
                    <td className="px-2 py-2"><input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Description of work" value={line.description} onChange={e => setActiveInvoice(i => ({ ...i, lines: updateLine(i.lines || lines, idx, 'description', e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" type="number" min="0" value={line.quantity} onChange={e => setActiveInvoice(i => ({ ...i, lines: updateLine(i.lines || lines, idx, 'quantity', e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" value={line.unit} onChange={e => setActiveInvoice(i => ({ ...i, lines: updateLine(i.lines || lines, idx, 'unit', e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right" type="number" min="0" step="0.01" value={line.rate} onChange={e => setActiveInvoice(i => ({ ...i, lines: updateLine(i.lines || lines, idx, 'rate', e.target.value) }))} /></td>
                    <td className="px-2 py-2 text-right font-bold text-slate-900 pr-4">{parseFloat(line.amount || '0').toFixed(2)}</td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => {
                        const updated = lines.filter((_, i) => i !== idx);
                        setActiveInvoice(i => ({ ...i, lines: updated.length ? updated : [newLine()] }));
                      }} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setActiveInvoice(i => ({ ...i, lines: [...(i.lines || lines), newLine()] }))}
              className="mt-2 text-blue-600 font-bold text-xs hover:underline">+ Add Line</button>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-slate-500 text-sm">Subtotal</span>
                <span className="font-bold text-slate-900">${sub.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-3">
                <span className="text-slate-500 text-sm flex items-center gap-2">Tax <input className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-center" type="number" min="0" max="100" value={activeInvoice.taxRate || '0'} onChange={e => setActiveInvoice(i => ({ ...i, taxRate: e.target.value }))} />%</span>
                <span className="font-bold text-slate-900">${taxAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 bg-slate-900 text-white rounded-b-xl px-4">
                <span className="font-black">Total Due</span>
                <span className="font-black text-amber-400">${tot.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Payment Terms</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" rows={2} value={activeInvoice.paymentTerms || ''} onChange={e => setActiveInvoice(i => ({ ...i, paymentTerms: e.target.value }))} />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" rows={2} placeholder="Additional notes..." value={activeInvoice.notes || ''} onChange={e => setActiveInvoice(i => ({ ...i, notes: e.target.value }))} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleSave} className="bg-amber-400 text-slate-900 font-black px-6 py-3 rounded-xl hover:bg-amber-300 text-sm">💾 Save Invoice</button>
            <button onClick={() => handleEmail(activeInvoice)} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-500 text-sm">📧 Email Invoice</button>
            <button onClick={() => window.print()} className="bg-slate-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-600 text-sm">🖨️ Print / Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}
