import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: string;
  description: string;
  receipt: string;
  createdAt: number;
}

const CATEGORIES = [
  { name: 'Mileage', color: 'bg-blue-100 text-blue-700' },
  { name: 'Materials', color: 'bg-orange-100 text-orange-700' },
  { name: 'Equipment', color: 'bg-purple-100 text-purple-700' },
  { name: 'Subcontractor', color: 'bg-teal-100 text-teal-700' },
  { name: 'Insurance', color: 'bg-red-100 text-red-700' },
  { name: 'License', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Fuel', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Other', color: 'bg-gray-100 text-gray-700' },
];
const LS_KEY = 'ep_expenses';

function uid() { return Math.random().toString(36).slice(2, 9); }

function catColor(name: string) {
  return CATEGORIES.find(c => c.name === name)?.color || 'bg-gray-100 text-gray-700';
}

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function ExpenseTrackerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterCat, setFilterCat] = useState<string>('All');
  const [monthKey, setMonthKey] = useState<string>(getMonthKey(new Date()));
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: 'Materials', amount: '', description: '', receipt: '' });

  useEffect(() => {
    setExpenses(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  }, []);

  function addExpense() {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    const exp: Expense = { id: uid(), ...form, createdAt: Date.now() };
    const updated = [exp, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setForm({ date: new Date().toISOString().slice(0, 10), category: 'Materials', amount: '', description: '', receipt: '' });
  }

  function deleteExpense(id: string) {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }

  const monthExpenses = expenses.filter(e => {
    const key = e.date.slice(0, 7);
    const catOk = filterCat === 'All' || e.category === filterCat;
    return key === monthKey && catOk;
  });

  const totalMonth = monthExpenses.reduce((s, e) => s + parseFloat(e.amount || '0'), 0);
  const taxDeductible = totalMonth * 0.25;
  const catTotals = monthExpenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || '0');
    return acc;
  }, {});
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  const allMonths = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();
  const monthKeys = allMonths.length ? allMonths : [monthKey];

  function exportCSV() {
    const rows = [['Date', 'Category', 'Amount', 'Description', 'Receipt #']];
    monthExpenses.forEach(e => rows.push([e.date, e.category, e.amount, e.description, e.receipt]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `expenses-${monthKey}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const sorted = [...monthExpenses].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'amount') return parseFloat(b.amount) - parseFloat(a.amount);
    return a.category.localeCompare(b.category);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">💸 Expense Tracker</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Month Picker */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => {
            const [y, m] = monthKey.split('-');
            const d = new Date(parseInt(y), parseInt(m) - 2);
            setMonthKey(getMonthKey(d));
          }} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-600 hover:bg-gray-50 text-sm">← Prev</button>
          <span className="font-black text-slate-900 text-lg">{monthLabel(monthKey)}</span>
          <button onClick={() => {
            const [y, m] = monthKey.split('-');
            const d = new Date(parseInt(y), parseInt(m));
            setMonthKey(getMonthKey(d));
          }} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-slate-600 hover:bg-gray-50 text-sm">Next →</button>
          <select value={monthKey} onChange={e => setMonthKey(e.target.value)} className="ml-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm">
            {monthKeys.map(k => <option key={k} value={k}>{monthLabel(k)}</option>)}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Expenses</div>
            <div className="text-2xl font-black text-slate-900">${totalMonth.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Top Category</div>
            <div className="text-lg font-black text-slate-900">{topCategory ? `${topCategory[0]} ($${topCategory[1].toFixed(2)})` : '—'}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Est. Tax Savings (25%)</div>
            <div className="text-2xl font-black text-green-600">${taxDeductible.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-black text-slate-900 mb-4">+ Add Expense</h2>
            <div className="space-y-3">
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Amount ($)" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Receipt # (optional)" value={form.receipt} onChange={e => setForm(f => ({ ...f, receipt: e.target.value }))} />
              <button onClick={addExpense} className="w-full bg-amber-400 text-slate-900 font-black py-3 rounded-xl hover:bg-amber-300 text-sm">Add Expense</button>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="font-bold text-slate-700 text-xs uppercase mb-2">Filter by Category</h3>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => setFilterCat('All')} className={`text-xs font-bold px-2 py-1 rounded-full ${filterCat === 'All' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-600'}`}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.name} onClick={() => setFilterCat(c.name)} className={`text-xs font-bold px-2 py-1 rounded-full ${filterCat === c.name ? c.color : 'bg-gray-50 text-slate-400'}`}>{c.name}</button>
                ))}
              </div>
            </div>

            <button onClick={exportCSV} className="w-full mt-4 border border-gray-200 text-slate-600 font-bold py-2 rounded-xl text-xs hover:bg-gray-50">📥 Export CSV</button>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-black text-slate-900">Expenses ({monthExpenses.length})</h2>
              <div className="flex gap-1">
                {(['date', 'amount', 'category'] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)} className={`text-xs font-bold px-3 py-1 rounded-lg ${sortBy === s ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-500'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>
            {sorted.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="text-4xl mb-2">📋</div>
                <p>No expenses this month. Add your first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {sorted.map(exp => (
                  <div key={exp.id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50">
                    <div className="text-sm text-slate-500 w-24 shrink-0">{exp.date}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${catColor(exp.category)}`}>{exp.category}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{exp.description || '—'}</div>
                      {exp.receipt && <div className="text-xs text-slate-400">#{exp.receipt}</div>}
                    </div>
                    <div className="font-black text-slate-900 text-sm">${parseFloat(exp.amount).toFixed(2)}</div>
                    <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
