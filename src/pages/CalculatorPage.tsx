import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ResidentialPricingCalc() {
  const jobs = [
    { name: 'Service Panel Upgrade (100A → 200A)', labor: 8, material: 850 },
    { name: 'GFCI Outlet Replacement', labor: 0.5, material: 25 },
    { name: 'Whole-Home Rewire (1,500 sq ft)', labor: 40, material: 1800 },
    { name: 'Circuit Breaker Replacement', labor: 0.5, material: 45 },
    { name: 'Ceiling Fan Installation', labor: 1.5, material: 85 },
    { name: 'EV Charger Installation (Level 2)', labor: 4, material: 350 },
    { name: 'Lighting Fixture Installation', labor: 1, material: 95 },
    { name: 'Smoke Detector Hardwired', labor: 0.75, material: 55 },
    { name: 'Outlet Relocation (per outlet)', labor: 1, material: 35 },
    { name: 'Subpanel Installation', labor: 6, material: 450 },
  ];
  const [laborRate, setLaborRate] = useState(85);
  const [markup, setMarkup] = useState(1.45);

  const rows = jobs.map(j => {
    const laborCost = j.labor * laborRate;
    const totalMaterial = j.material * markup;
    const flatRate = Math.ceil((laborCost + totalMaterial) * 1.25);
    return { ...j, laborCost, totalMaterial, flatRate };
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">Your Hourly Labor Rate ($)</label>
          <input type="number" value={laborRate} onChange={e => setLaborRate(Number(e.target.value))}
            className="w-full border border-amber-300 rounded-lg px-4 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">Material Markup (%)</label>
          <input type="number" value={markup * 100} onChange={e => setMarkup(Number(e.target.value) / 100)}
            className="w-full border border-amber-300 rounded-lg px-4 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-sm text-green-700 font-semibold">Every price below includes labor + materials + 25% profit margin ✅</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left p-3 rounded-tl-xl">Job</th>
              <th className="text-right p-3">Labor Hrs</th>
              <th className="text-right p-3">Labor Cost</th>
              <th className="text-right p-3">Materials</th>
              <th className="text-right p-3 rounded-tr-xl font-black">Flat Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{r.name}</td>
                <td className="p-3 text-right text-slate-600">{r.labor}h</td>
                <td className="p-3 text-right text-slate-600">${r.laborCost.toFixed(0)}</td>
                <td className="p-3 text-right text-slate-600">${r.totalMaterial.toFixed(0)}</td>
                <td className="p-3 text-right font-black text-slate-900 text-lg">${r.flatRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverheadCalc() {
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [annualOverhead, setAnnualOverhead] = useState(25000);
  const [billableHours, setBillableHours] = useState(1600);

  const hourlyRate = Math.ceil((annualIncome + annualOverhead) / billableHours);
  const dailyRate = Math.ceil(hourlyRate * 8);
  const weeklyRate = Math.ceil(dailyRate * 5);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">Your Annual Income Goal ($)</label>
          <input type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">Annual Overhead ($)</label>
          <input type="number" value={annualOverhead} onChange={e => setAnnualOverhead(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">Billable Hours/Year</label>
          <input type="number" value={billableHours} onChange={e => setBillableHours(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Minimum Hourly Rate', value: `$${hourlyRate}/hr`, color: 'bg-slate-900 text-white' },
          { label: 'Daily Rate', value: `$${dailyRate}/day`, color: 'bg-amber-400 text-slate-900' },
          { label: 'Weekly Rate', value: `$${weeklyRate}/week`, color: 'bg-slate-900 text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-5 text-center`}>
            <div className="text-xs font-bold opacity-80 mb-2">{label}</div>
            <div className="text-2xl font-black">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-semibold">⚠️ This is your MINIMUM rate. To price profitably, add 20-30% on top of this for unexpected costs and growth.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-bold text-slate-900 mb-3">Common Overhead Items to Include:</h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
          {['Truck & fuel', 'Insurance (liability + vehicle)', 'Tools & equipment', 'Cell phone', 'Software subscriptions', 'Marketing & advertising', 'Accounting & taxes', 'Licenses & permits', 'Continuing education', 'Retirement savings'].map(item => (
            <div key={item}>✓ {item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobCostingCalc() {
  const [rows, setRows] = useState([
    { job: '', client: '', laborHrs: 0, hourlyCost: 85, materialCost: 0, quotePrice: 0 },
  ]);

  function updateRow(i: number, field: string, val: number) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function addRow() {
    setRows(prev => [...prev, { job: '', client: '', laborHrs: 0, hourlyCost: 85, materialCost: 0, quotePrice: 0 }]);
  }

  const totalProfit = rows.reduce((sum, r) => {
    const cost = (r.laborHrs * r.hourlyCost) + r.materialCost;
    const profit = r.quotePrice - cost;
    return sum + profit;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white text-xs">
              <th className="p-3 text-left rounded-tl-xl">Job</th>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-right">Labor Hrs</th>
              <th className="p-3 text-right">$/Hr Cost</th>
              <th className="p-3 text-right">Materials $</th>
              <th className="p-3 text-right">Total Cost</th>
              <th className="p-3 text-right">Quote $</th>
              <th className="p-3 text-right rounded-tr-xl">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cost = (r.laborHrs * r.hourlyCost) + r.materialCost;
              const profit = r.quotePrice - cost;
              const margin = r.quotePrice > 0 ? ((profit / r.quotePrice) * 100).toFixed(0) : '0';
              return (
                <tr key={i} className="border-b border-gray-100 bg-white hover:bg-amber-50 transition-colors">
                  <td className="p-2"><input value={r.job} onChange={e => setRows(p => p.map((x,idx) => idx===i ? {...x, job: e.target.value} : x))} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Job name" /></td>
                  <td className="p-2"><input value={r.client} onChange={e => setRows(p => p.map((x,idx) => idx===i ? {...x, client: e.target.value} : x))} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Client" /></td>
                  <td className="p-2"><input type="number" value={r.laborHrs} onChange={e => updateRow(i, 'laborHrs', Number(e.target.value))} className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-right" /></td>
                  <td className="p-2"><input type="number" value={r.hourlyCost} onChange={e => updateRow(i, 'hourlyCost', Number(e.target.value))} className="w-20 border border-gray-200 rounded px-2 py-1 text-xs text-right" /></td>
                  <td className="p-2"><input type="number" value={r.materialCost} onChange={e => updateRow(i, 'materialCost', Number(e.target.value))} className="w-24 border border-gray-200 rounded px-2 py-1 text-xs text-right" /></td>
                  <td className="p-2 text-right font-semibold text-slate-600 text-sm">${cost.toFixed(0)}</td>
                  <td className="p-2"><input type="number" value={r.quotePrice} onChange={e => updateRow(i, 'quotePrice', Number(e.target.value))} className="w-24 border border-gray-200 rounded px-2 py-1 text-xs text-right font-bold" /></td>
                  <td className={`p-2 text-right font-black text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>${profit.toFixed(0)} <span className="text-xs font-normal">({margin}%)</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-200 text-sm">+ Add Job</button>

      <div className="bg-slate-900 text-white rounded-xl p-6">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Revenue</div>
            <div className="text-2xl font-black">${rows.reduce((s,r) => s + r.quotePrice, 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Cost</div>
            <div className="text-2xl font-black">${rows.reduce((s,r) => s + (r.laborHrs*r.hourlyCost)+r.materialCost, 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase mb-1">Total Profit</div>
            <div className="text-2xl font-black text-amber-400">${totalProfit.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EVChargerCalc() {
  const [chargerType, setChargerType] = useState<'residential' | 'commercial'>('residential');
  const [laborHours, setLaborHours] = useState(4);
  const [laborRate, setLaborRate] = useState(95);
  const [materialCost, setMaterialCost] = useState(650);
  const [permitFee, setPermitFee] = useState(150);
  const [panelUpgrade, setPanelUpgrade] = useState(false);
  const [upgradeCost, setUpgradeCost] = useState(1200);

  const totalCost = (laborHours * laborRate) + materialCost + permitFee + (panelUpgrade ? upgradeCost : 0);
  const flatRate = Math.ceil(totalCost * 1.3);
  const commercialRate = Math.ceil(flatRate * 1.4);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 mb-4">
        {[['residential', 'Residential'], ['commercial', 'Commercial']].map(([val, label]) => (
          <button key={val} onClick={() => setChargerType(val as any)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${chargerType === val ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Labor Hours', value: laborHours, set: setLaborHours },
          { label: 'Your Hourly Rate ($)', value: laborRate, set: setLaborRate },
          { label: 'Material Cost ($)', value: materialCost, set: setMaterialCost },
          { label: 'Permit Fee ($)', value: permitFee, set: setPermitFee },
        ].map(({ label, value, set }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input type="number" value={value} onChange={e => set(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={panelUpgrade} onChange={e => setPanelUpgrade(e.target.checked)}
            className="w-5 h-5 rounded accent-amber-400" />
          <span className="font-bold text-slate-900">Panel Upgrade Required (+${upgradeCost})</span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-6 text-center">
          <div className="text-slate-400 text-xs font-bold uppercase mb-2">Your Cost</div>
          <div className="text-3xl font-black">${totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-amber-400 text-slate-900 rounded-xl p-6 text-center">
          <div className="text-slate-700 text-xs font-bold uppercase mb-2">{chargerType === 'residential' ? 'Residential Flat Rate' : 'Commercial Rate'}</div>
          <div className="text-3xl font-black">{chargerType === 'residential' ? `$${flatRate.toLocaleString()}` : `$${commercialRate.toLocaleString()}`}</div>
          <div className="text-xs mt-1 text-slate-700">30% markup included</div>
        </div>
      </div>
    </div>
  );
}

function HiringCostCalc() {
  const [wage, setWage] = useState(30);
  const [benefits, setBenefits] = useState(4);
  const [training, setTraining] = useState(2000);
  const [recruit, setRecruit] = useState(500);
  const [overhead, setOverhead] = useState(10);

  const hourlyCost = wage + benefits + (wage * overhead / 100);
  const dailyCost = hourlyCost * 8;
  const annualCost = hourlyCost * 2080;
  const roiMonths = Math.ceil(training / ((hourlyCost * 8) - wage * 8));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Hourly Wage ($)', value: wage, set: setWage },
          { label: 'Benefits & Taxes ($/hr)', value: benefits, set: setBenefits },
          { label: 'Training & Certs ($)', value: training, set: setTraining },
          { label: 'Recruitment Cost ($)', value: recruit, set: setRecruit },
          { label: 'Overhead Markup (%)', value: overhead, set: setOverhead },
        ].map(({ label, value, set }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input type="number" value={value} onChange={e => set(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'True Hourly Cost', value: `$${hourlyCost.toFixed(2)}/hr`, bg: 'bg-slate-900 text-white' },
          { label: 'Daily Cost (8hrs)', value: `$${dailyCost.toFixed(0)}/day`, bg: 'bg-amber-400 text-slate-900' },
          { label: 'Annual Cost', value: `$${annualCost.toLocaleString()}`, bg: 'bg-slate-900 text-white' },
          { label: 'ROI Break-Even', value: `${roiMonths} months`, bg: roiMonths <= 6 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white' },
        ].map(({ label, value, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 text-center`}>
            <div className="text-xs font-bold opacity-80 mb-2">{label}</div>
            <div className="text-xl font-black">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-semibold text-sm">
          💡 This employee costs you <strong>${hourlyCost.toFixed(2)}/hr</strong> but you only charge <strong>${wage}/hr</strong> to the client. You need to bill at <strong>${Math.ceil(hourlyCost * 1.3)}/hr minimum</strong> to make a 30% margin.
        </p>
      </div>
    </div>
  );
}

const CALC_CONFIG: Record<string, { title: string; icon: string; desc: string; component: React.FC }> = {
  'residential-pricing': { title: 'Residential Flat-Rate Pricing Guide', icon: '💰', desc: 'Calculate flat rates for 60 common jobs', component: ResidentialPricingCalc },
  overhead: { title: 'Overhead & Hourly Rate Calculator', icon: '⚡', desc: 'Find your minimum hourly rate', component: OverheadCalc },
  'job-costing': { title: 'Job Costing Tracker', icon: '📊', desc: 'Track profit on every job', component: JobCostingCalc },
  'ev-charger': { title: 'EV Charger Pricing Calculator', icon: '🔌', desc: 'Quote EV charger installs correctly', component: EVChargerCalc },
  'hiring-cost': { title: 'Hiring Cost Calculator', icon: '👷', desc: 'Know what employees really cost', component: HiringCostCalc },
};

export default function CalculatorPage() {
  const { calcId } = useParams();
  const config = calcId ? CALC_CONFIG[calcId] : null;
  const CalcComponent = config?.component;

  if (!config || !CalcComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🧮</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Calculator not found</h2>
          <Link to="/dashboard" className="text-amber-500 font-semibold hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h1 className="font-black">{config.title}</h1>
            <p className="text-slate-400 text-sm">{config.desc}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <CalcComponent />
        </div>
      </div>
    </div>
  );
}
