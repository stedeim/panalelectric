import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TIER_LABELS } from '../lib/tiers';

const TIERS = [
  {
    id: 't1', name: 'Foundation', price: 97, annual: 877, color: 'bg-white border-gray-200',
    badge: 'bg-blue-500 text-white', features: [
      'Residential Flat-Rate Pricing Guide',
      'Overhead & Hourly Rate Calculator',
      'Job Costing Tracker',
      'Residential Proposal Template',
      'Change Order Form',
      'Client Communication Templates',
      'Members portal access',
      'Email support',
    ],
  },
  {
    id: 't2', name: 'Business', price: 297, annual: 2677, color: 'bg-white border-slate-800',
    badge: 'bg-slate-800 text-white', badgeLabel: 'Most Popular',
    features: [
      'Everything in Foundation, plus:',
      'Commercial Electrical Estimating',
      'EV Charger Pricing Calculator',
      'Hiring Cost Calculator',
      'Commercial Bid Proposal',
      'Master Electrical Service Agreement',
      'Commercial Maintenance Agreement',
      'Subcontractor Agreement',
      'NEC 2023 Update Summary',
      'Google Local SEO Guide',
      'Hiring & Onboarding Kit',
      'Priority support',
      'All future additions',
    ],
  },
  {
    id: 't3', name: 'Growth', price: 497, annual: 4477, color: 'bg-slate-900 text-white',
    badge: 'bg-amber-400 text-slate-900', badgeLabel: 'Best Value',
    features: [
      'Everything in Business, plus:',
      'Full Lead Generation Machine',
      'Client CRM',
      'Reputation Management System',
      'Social Media Kit (monthly)',
      'Email Marketing Templates',
      'Google Ads Playbook',
      'Referral Marketing System',
      'Partner Program Playbook',
      'Quarterly GEO Audit Report',
      'AI Marketing Assistant (Watt)',
      'All future Growth tools',
    ],
  },
];

export default function UpgradePage() {
  const { subscription } = useAuth();
  const currentTier = subscription.tier;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">⚡ Electrician<span className="text-amber-400">Pro</span></h1>
          <p className="text-slate-400 text-sm">Upgrade your plan</p>
        </div>
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back to Dashboard</Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Choose Your Plan</h2>
          <p className="text-slate-500">Current plan: <span className="font-bold text-slate-700">{TIER_LABELS[currentTier]}</span></p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map(tier => (
            <div key={tier.id} className={`${tier.color} rounded-2xl p-6 border-2 ${tier.id === 't2' ? 'border-slate-800' : tier.id === 't3' ? 'border-amber-400' : 'border-gray-200'} relative`}>
              {tier.badgeLabel && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tier.badge} text-xs font-black px-3 py-1 rounded-full`}>
                  {tier.badgeLabel}
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className={`text-lg font-black mb-1 ${tier.id === 't3' ? 'text-amber-400' : 'text-slate-900'}`}>{tier.name}</h3>
                <div className={`text-3xl font-black ${tier.id === 't3' ? 'text-white' : 'text-slate-900'}`}>
                  ${tier.price}<span className={`text-base font-normal ${tier.id === 't3' ? 'text-slate-400' : 'text-slate-400'}`}>/mo</span>
                </div>
                <div className={`text-sm ${tier.id === 't3' ? 'text-slate-400' : 'text-slate-500'}`}>or ${tier.annual}/year</div>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map(f => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${tier.id === 't3' ? 'text-slate-200' : 'text-slate-600'}`}>
                    <span className={`font-bold ${tier.id === 't3' ? 'text-amber-400' : 'text-green-500'}`}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="#"
                className={`block text-center font-black py-3 rounded-xl transition-colors text-sm ${
                  tier.id === currentTier
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : tier.id === 't3'
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                {tier.id === currentTier ? 'Current Plan' : 'Upgrade Now'}
              </a>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <h3 className="font-black text-slate-900 mb-2">💬 Ask Watt — Before You Decide</h3>
          <p className="text-slate-600 text-sm mb-3">Not sure which plan is right for you? Ask Watt inside your dashboard — he'll help you figure out what's worth it based on where your business is right now.</p>
          <Link to="/watt" className="text-amber-600 font-bold hover:underline text-sm">💬 Chat with Watt →</Link>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">© 2026 ElectricianPro · All prices in USD · Cancel anytime</p>
      </div>
    </div>
  );
}
