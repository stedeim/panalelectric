import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface MaterialItem {
  name: string;
  unit: string;
  low: number;
  high: number;
  notes: string;
}

interface Category {
  name: string;
  emoji: string;
  items: MaterialItem[];
}

const CATEGORIES: Category[] = [
  {
    name: 'Rough-In Materials', emoji: '🔨',
    items: [
      { name: '12/2 Romex NM-B (250ft)', unit: 'roll', low: 85, high: 120, notes: 'Standard residential branch circuits' },
      { name: '14/2 Romex NM-B (250ft)', unit: 'roll', low: 65, high: 90, notes: 'Lighting circuits, 15A' },
      { name: '10/3 Romex NM-B (250ft)', unit: 'roll', low: 145, high: 195, notes: '30A circuits: dryers, ranges' },
      { name: '1/2" EMT Conduit (10ft)', unit: 'piece', low: 2.5, high: 4.5, notes: '+ connectors/couplings' },
      { name: '4" Square Box', unit: 'each', low: 2.5, high: 5, notes: 'With 1/2" KO, switch/staple' },
      { name: 'Single Gang Device Box', unit: 'each', low: 0.75, high: 2, notes: 'Old work / new work' },
      { name: 'Wire Nuts (100pc assorted)', unit: 'bag', low: 8, high: 18, notes: 'Red, yellow, blue' },
      { name: 'NM Staple Gun / 3/8" staples', unit: 'box', low: 6, high: 15, notes: 'Romex securing' },
    ],
  },
  {
    name: 'Finishing Materials', emoji: '💡',
    items: [
      { name: 'Standard Duplex Outlet 15A', unit: 'each', low: 1.5, high: 4, notes: 'Tamper-resistant recommended' },
      { name: 'GFCI Outlet 15A', unit: 'each', low: 12, high: 22, notes: 'Bathrooms, kitchens, outdoors' },
      { name: 'Single Pole Switch 15A', unit: 'each', low: 1, high: 3.5, notes: 'Decora vs standard style' },
      { name: '3-Gang Decorator Wall Plate', unit: 'each', low: 3, high: 7, notes: 'Match decorator devices' },
      { name: 'LED Recessed Downlight (6")', unit: 'each', low: 8, high: 25, notes: 'IC-rated for insulated ceilings' },
      { name: 'Smart Switch (WiFi, neutral)', unit: 'each', low: 25, high: 55, notes: 'Check neutral wire needed' },
      { name: 'Ceiling Fan Bracket', unit: 'each', low: 8, high: 18, notes: 'Fan-rated box required' },
    ],
  },
  {
    name: 'Service & Panel Upgrades', emoji: '⚡',
    items: [
      { name: '200A Main Panel (40-space)', unit: 'each', low: 180, high: 320, notes: 'Includes main breaker' },
      { name: '100A Sub-Panel (20-space)', unit: 'each', low: 95, high: 175, notes: 'Sub-panel or smaller home' },
      { name: '50A Double Pole Breaker', unit: 'each', low: 18, high: 38, notes: 'Ranges, EVs, dryers' },
      { name: '20A Single Pole Breaker', unit: 'each', low: 7, high: 18, notes: 'Standard 120V circuit' },
      { name: '200A Main Breaker (2-pole)', unit: 'each', low: 45, high: 95, notes: 'Service entrance' },
      { name: 'Meter Socket Base', unit: 'each', low: 45, high: 95, notes: 'Verify utility requirements' },
      { name: 'Copper SE Cable 2/0-1/1/1 (100ft)', unit: 'roll', low: 295, high: 430, notes: 'Service entrance cable' },
    ],
  },
  {
    name: 'EV Charger Supplies', emoji: '🚗',
    items: [
      { name: 'NEMA 14-50 Receptacle', unit: 'each', low: 18, high: 45, notes: '50A, range/dryer outlet' },
      { name: 'NEMA 14-50 Plate + Receptacle', unit: 'each', low: 25, high: 55, notes: 'Usually sold together' },
      { name: '6/3 + 8/1 Romex (250ft)', unit: 'roll', low: 225, high: 340, notes: '50A EV circuit wiring' },
      { name: '50A GFCI Breaker', unit: 'each', low: 35, high: 65, notes: 'Required for EV circuits' },
      { name: 'Level 2 EV Charger (40A)', unit: 'each', low: 200, high: 600, notes: 'Add labor markup on hardware' },
      { name: '1" Surface Mount EMT (4ft)', unit: 'piece', low: 8, high: 18, notes: 'Exposed conduit runs' },
    ],
  },
  {
    name: 'Solar Supplies', emoji: '☀️',
    items: [
      { name: 'Solar Panel Mounting Rail', unit: 'set', low: 25, high: 65, notes: 'Per panel, adjustable tilt' },
      { name: 'MC4 Connector Pair', unit: 'pair', low: 2, high: 6, notes: 'Panel output connectors' },
      { name: '10 AWG USE-2 Wire (500ft)', unit: 'spool', low: 180, high: 290, notes: 'Ground/reroofting runs' },
      { name: 'Combiner Box (4-16 string)', unit: 'each', low: 45, high: 120, notes: 'Combines panel strings' },
      { name: 'Rapid Shutdown Transmitter', unit: 'each', low: 85, high: 180, notes: 'NEC 690.12 compliant' },
    ],
  },
  {
    name: 'Common Devices', emoji: '🔌',
    items: [
      { name: 'USB Outlet (2-Port, 15A)', unit: 'each', low: 12, high: 28, notes: 'Popular retrofit upgrade' },
      { name: 'Motion Sensor Switch', unit: 'each', low: 18, high: 42, notes: 'Occupancy/vacancy modes' },
      { name: 'Dimmer Switch (LED compat.)', unit: 'each', low: 15, high: 38, notes: 'Check LED compatibility' },
      { name: '7-Day Programmable Timer', unit: 'each', low: 18, high: 45, notes: 'Pools, signage, HVAC' },
      { name: 'Junction Box 4" Round', unit: 'each', low: 1.5, high: 4, notes: 'Ceiling fan or fixture mount' },
      { name: 'LB Conduit Body 1/2"', unit: 'each', low: 3.5, high: 8, notes: 'Pull points, weatherproof' },
    ],
  },
];

const LS_KEY = 'ep_custom_prices';

export default function MaterialPriceListPage() {
  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState('');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(() =>
    JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  );
  const [estimateItems, setEstimateItems] = useState<{ name: string; qty: number; low: number; high: number }[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  function saveCustomPrice(key: string, val: number) {
    const updated = { ...customPrices, [key]: val };
    setCustomPrices(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }

  function getAvg(key: string, item: MaterialItem) {
    if (customPrices[key] !== undefined) return customPrices[key];
    return (item.low + item.high) / 2;
  }

  function addToEstimate(item: MaterialItem) {
    const key = CATEGORIES[activeCat].name + ':' + item.name;
    setEstimateItems(prev => {
      const existing = prev.find(i => i.name === key);
      if (existing) return prev.map(i => i.name === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { name: key, qty: 1, low: item.low, high: item.high }];
    });
  }

  function removeEstimate(name: string) {
    setEstimateItems(prev => prev.filter(i => i.name !== name));
  }

  const estimateLow = estimateItems.reduce((s, i) => s + i.qty * i.low, 0);
  const estimateHigh = estimateItems.reduce((s, i) => s + i.qty * i.high, 0);

  const filtered = CATEGORIES[activeCat].items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">📦 Material Price List</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowEstimate(e => !e)} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300">
            📊 Estimate ({estimateItems.length})
          </button>
          <button onClick={() => window.print()} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-600">🖨️ Print</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat, i) => (
            <button key={cat.name} onClick={() => setActiveCat(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeCat === i ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white" placeholder="Search items or notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
              <span className="text-xl">{CATEGORIES[activeCat].emoji}</span>
              <h2 className="font-black">{CATEGORIES[activeCat].name}</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-slate-500 uppercase font-bold">
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-3 py-3 text-center">Unit</th>
                  <th className="px-3 py-3 text-right">Low</th>
                  <th className="px-3 py-3 text-right">High</th>
                  <th className="px-3 py-3 text-center">Avg / Custom</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const key = CATEGORIES[activeCat].name + ':' + item.name;
                  const avg = getAvg(key, item);
                  const isCustom = customPrices[key] !== undefined;
                  return (
                    <tr key={key} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-slate-400 text-xs">{item.notes}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">{item.unit}</td>
                      <td className="px-3 py-3 text-right text-xs text-slate-700">${item.low.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right text-xs text-slate-700">${item.high.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center">
                        <input className="w-16 border rounded px-1 py-0.5 text-xs text-center font-bold bg-amber-50" type="number" value={avg.toFixed(2)}
                          style={{ borderColor: isCustom ? '#f59e0b' : '#e5e7eb' }}
                          onChange={e => saveCustomPrice(key, parseFloat(e.target.value) || 0)} />
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => addToEstimate(item)} className="bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-lg text-xs hover:bg-amber-200">+ Est</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showEstimate && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
              <h2 className="font-black text-slate-900 mb-4">📊 Material Estimate</h2>
              {estimateItems.length === 0 ? (
                <p className="text-slate-400 text-sm">Click "+ Est" on items to add them.</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {estimateItems.map(item => (
                      <div key={item.name} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{item.name.split(':')[1]}</div>
                          <div className="text-xs text-slate-500">Qty: {item.qty}</div>
                        </div>
                        <div className="text-xs font-bold text-slate-700">${(item.qty * ((item.low + item.high) / 2)).toFixed(2)}</div>
                        <button onClick={() => removeEstimate(item.name)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-3 space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Low:</span><span className="font-bold">${estimateLow.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">High:</span><span className="font-bold">${estimateHigh.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-sm font-bold">Avg:</span><span className="font-black text-amber-600">${((estimateLow + estimateHigh) / 2).toFixed(2)}</span></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
