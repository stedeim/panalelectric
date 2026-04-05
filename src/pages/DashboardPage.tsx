import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TIER_LABELS, TIER_COLORS } from '../lib/tiers';

const TOOLS = [
  { id: 'residential-pricing', name: 'Residential Flat-Rate Pricing Guide', desc: 'Price 60 common jobs correctly', icon: '💰', tier: 't1' },
  { id: 'overhead', name: 'Overhead & Hourly Rate Calculator', desc: 'Know exactly what to charge per hour', icon: '⚡', tier: 't1' },
  { id: 'job-costing', name: 'Job Costing Tracker', desc: 'Track every job\'s real profit', icon: '📊', tier: 't1' },
  { id: 'residential-proposal', name: 'Residential Proposal Template', desc: 'Win more jobs with professional quotes', icon: '📋', tier: 't1' },
  { id: 'change-order-form', name: 'Change Order Form', desc: 'Protect yourself when scopes change', icon: '🔄', tier: 't1' },
  { id: 'client-comms', name: 'Client Communication Templates', desc: 'Professional emails and texts', icon: '💬', tier: 't1' },
  { id: 'commercial-estimating', name: 'Commercial Estimating Spreadsheet', desc: 'Bid commercial jobs with confidence', icon: '🏗️', tier: 't2' },
  { id: 'ev-charger', name: 'EV Charger Pricing Calculator', desc: 'Quote EV charger installs accurately', icon: '🔌', tier: 't2' },
  { id: 'hiring-cost', name: 'Hiring Cost Calculator', desc: 'Know what employees really cost', icon: '👷', tier: 't2' },
  { id: 'commercial-bid', name: 'Commercial Bid Proposal', desc: 'Professional bids for bigger jobs', icon: '📁', tier: 't2' },
  { id: 'service-agreement', name: 'Master Electrical Service Agreement', desc: 'Protect your business on every job', icon: '📜', tier: 't2' },
  { id: 'maintenance-agreement', name: 'Commercial Maintenance Agreement', desc: 'Recurring revenue template', icon: '🔧', tier: 't2' },
  { id: 'subcontractor-agreement', name: 'Subcontractor Agreement', desc: 'Clean contracts for your subs', icon: '🤝', tier: 't2' },
  { id: 'nec-2023', name: 'NEC 2023 Update Summary', desc: 'Stay code-compliant', icon: '📖', tier: 't2' },
  { id: 'google-local-seo', name: 'Google Local SEO Guide', desc: 'Get found on Google Maps', icon: '🔍', tier: 't2' },
  { id: 'hiring-onboarding', name: 'Hiring & Onboarding Kit', desc: 'Hire and train people properly', icon: '🧑‍🔧', tier: 't2' },
  { id: 'lead-generation', name: 'Lead Generation Machine', desc: 'Systematic lead flow every month', icon: '🚀', tier: 't3' },
  { id: 'client-crm', name: 'Client CRM', desc: 'Track every lead to signed contract', icon: '💼', tier: 't3' },
  { id: 'reputation-system', name: 'Reputation Management System', desc: '5-star reviews on autopilot', icon: '⭐', tier: 't3' },
  { id: 'social-media-kit', name: 'Social Media Kit', desc: '30 ready-to-post captions monthly', icon: '📱', tier: 't3' },
  { id: 'email-marketing', name: 'Email Marketing Templates', desc: 'Newsletters, re-engagement, referral', icon: '📧', tier: 't3' },
  { id: 'google-ads-playbook', name: 'Google Ads Playbook', desc: '$500/mo campaign that converts', icon: '🎯', tier: 't3' },
  { id: 'referral-marketing', name: 'Referral Marketing System', desc: 'Scripts and templates that get referrals', icon: '🎁', tier: 't3' },
  { id: 'partner-program', name: 'Partner Program Playbook', desc: 'Get referred by builders and Realtors', icon: '🏗️', tier: 't3' },
  { id: 'geo-audit', name: 'Quarterly GEO Audit Report', desc: 'Your actionable AI search report', icon: '🌐', tier: 't3' },
  { id: 'ai-marketing', name: 'AI Marketing Assistant', desc: 'AI writes your posts and emails', icon: '🤖', tier: 't3' },
];

const CALC_IDS = ['residential-pricing', 'overhead', 'job-costing', 'ev-charger', 'hiring-cost'];
const TIER_ORDER = ['t1', 't2', 't3'];

function TierBadge({ tier }: { tier: string }) {
  const labels: Record<string, string> = { t1: 'Foundation', t2: 'Business', t3: 'Growth', dfy: 'DFY GEO' };
  const colors: Record<string, string> = {
    t1: 'bg-blue-100 text-blue-700', t2: 'bg-slate-100 text-slate-700',
    t3: 'bg-amber-100 text-amber-700', dfy: 'bg-green-100 text-green-700',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[tier] || 'bg-gray-100'}`}>{labels[tier] || tier}</span>;
}

export default function DashboardPage() {
  const { user, subscription, logOut } = useAuth();
  const [tab, setTab] = useState<'all' | 'calculators'>('all');

  const maxTier = subscription.tier === 'dfy' ? 't3' : subscription.tier;
  const maxIdx = TIER_ORDER.indexOf(maxTier as string);

  const visible = TOOLS.filter(t => {
    const idx = TIER_ORDER.indexOf(t.tier);
    return idx !== -1 && idx <= maxIdx;
  });

  const calcTools = visible.filter(t => CALC_IDS.includes(t.id));
  const shown = tab === 'calculators' ? calcTools : visible;
  const lockedCount = TOOLS.length - visible.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">⚡ Electrician<span className="text-amber-400">Pro</span></h1>
          <p className="text-slate-400 text-sm truncate max-w-xs">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${TIER_COLORS[subscription.tier]} text-white`}>
            {TIER_LABELS[subscription.tier]}
          </span>
          <Link to="/watt" className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors text-sm">
            💬 Ask Watt
          </Link>
          <button onClick={logOut} className="text-slate-400 hover:text-white text-sm transition-colors">Sign out</button>
        </div>
      </header>

      <div className="bg-slate-900 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-2xl font-black">Welcome back 👋</h2>
          <p className="text-slate-400 text-sm mt-1">Your complete business platform.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-4 mb-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tools Available', value: visible.length, emoji: '🛠️' },
            { label: 'Calculators', value: calcTools.length, emoji: '🧮' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
          <Link to="/watt"
            className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 border border-amber-200 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center">
            <div className="text-2xl mb-1">💬</div>
            <div className="font-black text-slate-900 text-sm">Ask Watt</div>
            <div className="text-slate-700 text-xs">Your AI advisor</div>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex gap-2">
          {[['all', `All Tools (${visible.length})`], ['calculators', `Calculators (${calcTools.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-gray-200 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map(tool => (
            <div key={tool.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <TierBadge tier={tool.tier} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm">{tool.name}</h3>
              <p className="text-slate-500 text-xs mb-4">{tool.desc}</p>
              {CALC_IDS.includes(tool.id) ? (
                <Link to={`/calculator/${tool.id}`}
                  className="block text-center bg-amber-400 text-slate-900 font-bold py-2 rounded-xl hover:bg-amber-300 transition-colors text-xs">
                  Open Calculator →
                </Link>
              ) : (
                <button className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-xl hover:bg-slate-200 transition-colors text-xs">
                  Open Tool →
                </button>
              )}
            </div>
          ))}

          {subscription.tier !== 't3' && subscription.tier !== 'dfy' && lockedCount > 0 && (
            <Link to="/upgrade"
              className="bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-200 p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm">Unlock {lockedCount} More Tools</h3>
              <p className="text-slate-500 text-xs mb-3">Upgrade to Growth tier for all tools + marketing</p>
              <span className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs">View Upgrade →</span>
            </Link>
          )}
        </div>
      </div>

      <Link to="/watt"
        className="fixed bottom-6 right-6 bg-amber-400 text-slate-900 font-black px-6 py-4 rounded-full shadow-2xl hover:bg-amber-300 transition-all flex items-center gap-2"
        style={{ boxShadow: '0 8px 32px rgba(249,185,52,0.5)' }}>
        <span className="text-xl">💬</span><span className="hidden sm:inline">Ask Watt</span>
      </Link>
    </div>
  );
}
