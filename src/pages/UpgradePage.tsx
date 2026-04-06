import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TIER_LABELS } from '../lib/tiers';

type TierId = 'starter' | 'pro' | 'business' | 'growth' | 'dfy';

interface TierConfig {
  id: TierId;
  name: string;
  tagline: string;
  price: number;
  annualPrice: number;
  colorClass: string;
  headerBg: string;
  textColor: string;
  badge: string;
  badgeLabel?: string;
  badgeType?: 'recommended' | 'bestValue';
  features: ({ text: string; highlight?: boolean } | string)[];
  cta: string;
  ctaDisabled?: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Start smart. Price jobs right from day one.',
    price: 47,
    annualPrice: 450,
    colorClass: 'bg-white border-gray-200',
    headerBg: 'bg-gray-50',
    textColor: 'text-slate-900',
    badge: 'bg-gray-400 text-white',
    features: [
      'Residential Flat-Rate Pricing Guide',
      'Overhead & Hourly Rate Calculator',
      'Job Costing Tracker',
      'Ask Watt (AI assistant)',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Most popular for starting electricians.',
    price: 97,
    annualPrice: 930,
    colorClass: 'bg-white border-blue-600 border-2',
    headerBg: 'bg-blue-600',
    textColor: 'text-slate-900',
    badge: 'bg-blue-600 text-white',
    badgeLabel: '⭐ Most Popular',
    badgeType: 'recommended',
    features: [
      { text: 'Everything in Starter, plus:', highlight: false },
      { text: 'EV Charger Pricing Calculator', highlight: false },
      { text: 'Hiring Cost Calculator', highlight: false },
      { text: 'Invoice Generator', highlight: true },
      { text: 'Expense Tracker', highlight: true },
      { text: 'Proposal Builder (live, printable)', highlight: false },
      { text: 'Contract Builder (live, printable)', highlight: false },
      { text: 'Change Order Form', highlight: false },
      { text: 'Documents Library (17 guides)', highlight: false },
      { text: 'Ask Watt AI', highlight: false },
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Scale your business with marketing & operations.',
    price: 197,
    annualPrice: 1890,
    colorClass: 'bg-white border-slate-800 border-2',
    headerBg: 'bg-slate-800',
    textColor: 'text-white',
    badge: 'bg-slate-800 text-white',
    features: [
      { text: 'Everything in Pro, plus:', highlight: false },
      { text: 'Material Price List', highlight: true },
      { text: 'Job Scheduling Calendar', highlight: true },
      { text: 'Service Agreement Templates', highlight: true },
      { text: 'Job Tracker CRM (pipeline view)', highlight: false },
      { text: 'Lead Generation Machine', highlight: false },
      { text: 'Reputation Management System', highlight: false },
      { text: 'GEO Audit Quiz', highlight: false },
      { text: 'Priority support', highlight: false },
    ],
    cta: 'Upgrade to Business',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'All tools. No limits.',
    price: 297,
    annualPrice: 2850,
    colorClass: 'bg-slate-900 text-white',
    headerBg: 'bg-amber-400',
    textColor: 'text-white',
    badge: 'bg-amber-400 text-slate-900',
    badgeLabel: '🔥 Best Value',
    badgeType: 'bestValue',
    features: [
      { text: 'Everything in Business, plus:', highlight: false },
      { text: 'License & Permit Tracker', highlight: true },
      { text: 'NEC 2023 Quick Reference', highlight: true },
      { text: 'Social Media Kit (monthly content calendar)', highlight: false },
      { text: 'Email Marketing Templates', highlight: false },
      { text: 'Referral & Partner Program', highlight: false },
      { text: 'Google Ads Playbook', highlight: false },
    ],
    cta: 'Upgrade to Growth',
  },
  {
    id: 'dfy',
    name: 'Done-For-You',
    tagline: 'We run your marketing for you.',
    price: 1000,
    annualPrice: 9600,
    colorClass: 'bg-white border-green-600 border-2',
    headerBg: 'bg-green-600',
    textColor: 'text-white',
    badge: 'bg-green-600 text-white',
    features: [
      { text: 'Everything in Growth', highlight: false },
      { text: 'Dedicated GEO Management', highlight: false },
      { text: 'White-glove onboarding', highlight: false },
      { text: 'Priority Slack access', highlight: false },
    ],
    cta: 'Go DFY',
  },
];

export default function UpgradePage() {
  const { subscription } = useAuth();
  const currentTier = subscription.tier;
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <img src="/logos/logo-E-darkonlight.png" alt="PanelElectric" className="h-10 w-auto object-contain" />
          <p className="text-slate-400 text-sm">Upgrade your plan</p>
        </div>
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back to Dashboard</Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Choose Your Plan</h2>
          <p className="text-slate-500 text-sm mb-6">
            Current plan: <span className="font-bold text-slate-700">{TIER_LABELS[currentTier]}</span>
          </p>
          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-semibold ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual <span className="text-green-600 font-bold">(-20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {TIERS.map(tier => {
            const isCurrent = tier.id === currentTier;
            const displayPrice = annual ? Math.round(tier.price * 0.8) : tier.price;
            const displayAnnual = annual ? tier.annualPrice : undefined;

            return (
              <div
                key={tier.id}
                className={`${tier.colorClass} rounded-2xl border-2 flex flex-col relative overflow-hidden`}
              >
                {/* Badge */}
                {tier.badgeLabel && (
                  <div className={`${tier.badgeType === 'bestValue' ? 'bg-amber-400 text-slate-900' : tier.badge} text-xs font-black px-3 py-1 text-center`}>
                    {tier.badgeLabel}
                  </div>
                )}

                {/* Header */}
                <div className={`${tier.headerBg} px-4 pt-4 pb-3 text-center`}>
                  <h3 className={`text-lg font-black ${tier.textColor}`}>{tier.name}</h3>
                  <div className={`text-3xl font-black ${tier.textColor}`}>
                    ${displayPrice}<span className="text-base font-normal opacity-70">/mo</span>
                  </div>
                  {displayAnnual !== undefined && (
                    <div className={`text-xs mt-0.5 ${tier.textColor} opacity-70`}>
                      ${displayAnnual.toLocaleString()}/year
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 px-4 py-4 flex flex-col">
                  <p className={`text-xs mb-4 text-center ${tier.id === 'starter' ? 'text-slate-500' : ''}`}>{tier.tagline}</p>
                  <ul className="space-y-1.5 flex-1">
                    {tier.features.map((f, i) => {
                      const feat = typeof f === 'string' ? { text: f, highlight: false } : f;
                      return (
                      <li key={i} className={`text-xs flex items-start gap-1.5 ${feat.highlight ? 'font-semibold' : ''} ${tier.id === 'growth' ? 'text-slate-200' : 'text-slate-600'}`}>
                        <span className={tier.id === 'growth' ? 'text-amber-400' : 'text-green-500'}>✓</span>
                        {feat.text}
                        {feat.highlight && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1 rounded ml-auto shrink-0">✨</span>}
                      </li>
                    );})}
                  </ul>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className={`mt-4 block text-center font-black py-2.5 rounded-xl text-sm transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : tier.id === 'growth'
                        ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                        : tier.id === 'dfy'
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : tier.cta}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-2xl mx-auto mb-8">
          <h3 className="font-black text-slate-900 mb-2">💬 Ask Watt — Before You Decide</h3>
          <p className="text-slate-600 text-sm mb-3">Not sure which plan is right for you? Ask Watt inside your dashboard — he'll help you figure out what's worth it based on where your business is right now.</p>
          <Link to="/watt" className="text-amber-600 font-bold hover:underline text-sm">💬 Chat with Watt →</Link>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">© 2026 ElectricianPro · All prices in USD · Cancel anytime</p>
      </div>
    </div>
  );
}
