import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface License {
  id: string;
  name: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  isCustom: boolean;
  createdAt: number;
}

const LS_KEY = 'ep_licenses';

function uid() { return Math.random().toString(36).slice(2, 9); }

const DEFAULT_LICENSES: Omit<License, 'id' | 'createdAt'>[] = [
  { name: 'State Electrical License', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'Master Electrician License', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'Journeyman License', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'Electrical Contractor License', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'City/County Business License', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'General Liability Insurance', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'Workers Compensation Insurance', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'Surety Bond (if required)', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'EPA 608 Universal Certification', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
  { name: 'OSHA 10-Hour Construction Safety', licenseNumber: '', issueDate: '', expiryDate: '', isCustom: false },
];

function getStatus(expiryDate: string): 'active' | 'expiring' | 'expired' | 'unknown' {
  if (!expiryDate) return 'unknown';
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  const diff = expiry - now;
  if (diff < 0) return 'expired';
  if (diff < 30 * 86400000) return 'expiring';
  return 'active';
}

function statusStyle(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-700';
  if (status === 'expiring') return 'bg-amber-100 text-amber-700';
  if (status === 'expired') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-500';
}

function statusLabel(status: string) {
  if (status === 'active') return '✓ Active';
  if (status === 'expiring') return '⚠ Expiring Soon';
  if (status === 'expired') return '✕ Expired';
  return '— Not Set';
}

export default function LicenseTrackerPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', licenseNumber: '', issueDate: '', expiryDate: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null') as License[] | null;
    if (saved && saved.length > 0) {
      setLicenses(saved);
    } else {
      const defaults = DEFAULT_LICENSES.map(l => ({ ...l, id: uid(), createdAt: Date.now() }));
      setLicenses(defaults);
      localStorage.setItem(LS_KEY, JSON.stringify(defaults));
    }
  }, []);

  function updateLicense(id: string, field: keyof License, value: string) {
    const updated = licenses.map(l => l.id === id ? { ...l, [field]: value } : l);
    setLicenses(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }

  function addCustomLicense() {
    if (!customForm.name) return;
    const lic: License = { id: uid(), ...customForm, isCustom: true, createdAt: Date.now() };
    const updated = [...licenses, lic];
    setLicenses(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setCustomForm({ name: '', licenseNumber: '', issueDate: '', expiryDate: '' });
    setShowAddCustom(false);
  }

  function deleteLicense(id: string) {
    const updated = licenses.filter(l => l.id !== id);
    setLicenses(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }

  const activeCount = licenses.filter(l => getStatus(l.expiryDate) === 'active').length;
  const expiringCount = licenses.filter(l => getStatus(l.expiryDate) === 'expiring').length;
  const expiredCount = licenses.filter(l => getStatus(l.expiryDate) === 'expired').length;

  function exportPDF() {
    const content = licenses.map(l => {
      const status = getStatus(l.expiryDate);
      return `${l.name}\n  Number: ${l.licenseNumber || '—'}\n  Issued: ${l.issueDate || '—'}  Expires: ${l.expiryDate || '—'}  Status: ${statusLabel(status)}`;
    }).join('\n\n');
    const blob = new Blob([`License & Permit Tracker\nExported: ${new Date().toLocaleDateString()}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'license-tracker.txt'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">📋 License & Permit Tracker</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddCustom(true)} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300">+ Add Custom</button>
          <button onClick={exportPDF} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-600">📥 Export</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Alert Banner */}
        {(expiringCount > 0 || expiredCount > 0) && (
          <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${expiredCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="text-2xl">{expiredCount > 0 ? '🚨' : '⚠️'}</div>
            <div>
              <div className={`font-black text-sm ${expiredCount > 0 ? 'text-red-700' : 'text-amber-700'}`}>
                {expiredCount > 0 ? `${expiredCount} license(s) EXPIRED — renew immediately!` : `${expiringCount} license(s) expiring within 30 days`}
              </div>
              <div className="text-xs text-slate-500">Check the table below for details.</div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold">Active</div>
            <div className="text-2xl font-black text-green-600">{activeCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold">Expiring Soon</div>
            <div className="text-2xl font-black text-amber-600">{expiringCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold">Expired</div>
            <div className="text-2xl font-black text-red-600">{expiredCount}</div>
          </div>
        </div>

        {/* License Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="font-black">Licenses & Permits ({licenses.length})</h2>
            <span className="text-xs text-slate-400">Click any field to edit inline</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-slate-500 uppercase font-bold">
                <th className="px-4 py-3 text-left">License / Permit</th>
                <th className="px-3 py-3 text-left">License #</th>
                <th className="px-3 py-3 text-left">Issue Date</th>
                <th className="px-3 py-3 text-left">Expiry Date</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(lic => {
                const status = getStatus(lic.expiryDate);
                return (
                  <tr key={lic.id} className={`border-t border-gray-50 ${status === 'expired' ? 'bg-red-50' : status === 'expiring' ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{lic.name}</span>
                      {lic.isCustom && <span className="ml-2 text-xs bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">Custom</span>}
                    </td>
                    <td className="px-3 py-3">
                      <input className="border border-transparent bg-transparent rounded px-2 py-1 text-xs hover:border-gray-200 focus:border-amber-400 focus:bg-white w-full max-w-40" value={lic.licenseNumber} placeholder="License #" onChange={e => updateLicense(lic.id, 'licenseNumber', e.target.value)} />
                    </td>
                    <td className="px-3 py-3">
                      <input type="date" className="border border-transparent bg-transparent rounded px-2 py-1 text-xs hover:border-gray-200 focus:border-amber-400 focus:bg-white w-32" value={lic.issueDate} onChange={e => updateLicense(lic.id, 'issueDate', e.target.value)} />
                    </td>
                    <td className="px-3 py-3">
                      <input type="date" className="border border-transparent bg-transparent rounded px-2 py-1 text-xs hover:border-gray-200 focus:border-amber-400 focus:bg-white w-32" value={lic.expiryDate} onChange={e => updateLicense(lic.id, 'expiryDate', e.target.value)} />
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyle(status)}`}>{statusLabel(status)}</span>
                    </td>
                    <td className="px-2 py-3">
                      {lic.isCustom && (
                        <button onClick={() => deleteLicense(lic.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Modal */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-black text-slate-900 mb-4">+ Add Custom License</h2>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="License name (e.g. Solar Installer Cert)" value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="License number" value={customForm.licenseNumber} onChange={e => setCustomForm(f => ({ ...f, licenseNumber: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Issue Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={customForm.issueDate} onChange={e => setCustomForm(f => ({ ...f, issueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Expiry Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={customForm.expiryDate} onChange={e => setCustomForm(f => ({ ...f, expiryDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddCustom(false)} className="flex-1 border border-gray-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={addCustomLicense} className="flex-1 bg-amber-400 text-slate-900 font-black py-2.5 rounded-xl text-sm hover:bg-amber-300">Add License</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
