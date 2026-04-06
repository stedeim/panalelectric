export type Tier = 'none' | 'starter' | 'pro' | 'business' | 'growth' | 'dfy';

export interface SubscriptionData {
  tier: Tier;
  status: 'active' | 'cancelled' | 'past_due' | 'none';
  currentPeriodEnd?: number;
  planName?: string;
}

export const TIER_LABELS: Record<Tier, string> = {
  none: 'No Subscription',
  starter: 'Starter — $47/mo',
  pro: 'Pro — $97/mo',
  business: 'Business — $197/mo',
  growth: 'Growth — $297/mo',
  dfy: 'Done-For-You — $1,000/mo',
};

export const TIER_COLORS: Record<Tier, string> = {
  none: 'bg-gray-400',
  starter: 'bg-gray-500',
  pro: 'bg-blue-600',
  business: 'bg-slate-700',
  growth: 'bg-amber-400 text-slate-900',
  dfy: 'bg-green-600',
};

// Tool IDs
export const TOOLS: Record<string, string> = {
  // CALCULATORS
  'residential-pricing': 'Residential Flat-Rate Pricing Guide',
  'overhead-calculator': 'Overhead & Hourly Rate Calculator',
  'job-costing': 'Job Costing Tracker',
  'ev-charger': 'EV Charger Pricing Calculator',
  'hiring-cost': 'Hiring Cost Calculator',
  // BUSINESS TOOLS
  'invoice-generator': 'Invoice Generator',
  'expense-tracker': 'Expense Tracker',
  'material-price-list': 'Material Price List',
  'job-scheduler': 'Job Scheduling Calendar',
  'service-agreement': 'Service Agreement Templates',
  'license-tracker': 'License & Permit Tracker',
  // PROPOSALS & CONTRACTS
  'proposal-builder': 'Proposal Builder',
  'contract-builder': 'Contract Builder',
  'change-order': 'Change Order Form',
  // CRM & MARKETING
  'job-tracker': 'Job Tracker CRM',
  'lead-generation': 'Lead Generation Machine',
  'reputation-system': 'Reputation Management System',
  'social-media-kit': 'Social Media Kit',
  'email-marketing': 'Email Marketing Templates',
  'referral-partner': 'Referral & Partner Program',
  // DOCUMENTS & AI
  'documents-library': 'Documents Library',
  'nec-quick-ref': 'NEC 2023 Quick Reference',
  'geo-audit': 'GEO Audit Quiz',
  'watt-chat': 'Ask Watt (AI Assistant)',
  'google-ads-playbook': 'Google Ads Playbook',
};

export const TIER_TOOLS: Record<Tier, string[]> = {
  none: [],
  starter: [
    'residential-pricing',
    'overhead-calculator',
    'job-costing',
  ],
  pro: [
    'residential-pricing',
    'overhead-calculator',
    'job-costing',
    'ev-charger',
    'hiring-cost',
    'invoice-generator',
    'expense-tracker',
    'proposal-builder',
    'contract-builder',
    'change-order',
    'documents-library',
    'watt-chat',
  ],
  business: [
    'residential-pricing',
    'overhead-calculator',
    'job-costing',
    'ev-charger',
    'hiring-cost',
    'invoice-generator',
    'expense-tracker',
    'material-price-list',
    'job-scheduler',
    'proposal-builder',
    'contract-builder',
    'change-order',
    'service-agreement',
    'job-tracker',
    'lead-generation',
    'reputation-system',
    'documents-library',
    'watt-chat',
    'geo-audit',
  ],
  growth: [
    'residential-pricing',
    'overhead-calculator',
    'job-costing',
    'ev-charger',
    'hiring-cost',
    'invoice-generator',
    'expense-tracker',
    'material-price-list',
    'job-scheduler',
    'proposal-builder',
    'contract-builder',
    'change-order',
    'service-agreement',
    'license-tracker',
    'nec-quick-ref',
    'job-tracker',
    'lead-generation',
    'reputation-system',
    'social-media-kit',
    'email-marketing',
    'referral-partner',
    'google-ads-playbook',
    'documents-library',
    'watt-chat',
    'geo-audit',
  ],
  dfy: Object.keys(TOOLS),
};

export const LS_TIER_MAP: Record<string, Tier> = {
  'tier-47': 'starter',
  'tier-97': 'pro',
  'tier-197': 'business',
  'tier-297': 'growth',
  'tier-1000': 'dfy',
};

export const TIER_CALCULATORS: Record<Tier, string[]> = {
  none: [],
  starter: ['residential-pricing', 'overhead-calculator', 'job-costing'],
  pro: ['residential-pricing', 'overhead-calculator', 'job-costing', 'ev-charger', 'hiring-cost'],
  business: ['residential-pricing', 'overhead-calculator', 'job-costing', 'ev-charger', 'hiring-cost'],
  growth: ['residential-pricing', 'overhead-calculator', 'job-costing', 'ev-charger', 'hiring-cost'],
  dfy: ['residential-pricing', 'overhead-calculator', 'job-costing', 'ev-charger', 'hiring-cost'],
};

export const TIER_ORDER: Tier[] = ['starter', 'pro', 'business', 'growth', 'dfy'];
