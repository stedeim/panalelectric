import { User } from 'firebase/auth';

export type Tier = 'none' | 't1' | 't2' | 't3' | 'dfy';

export interface SubscriptionData {
  tier: Tier;
  status: 'active' | 'cancelled' | 'past_due' | 'none';
  currentPeriodEnd?: number; // Unix timestamp
  planName?: string;
}

export const TIER_LABELS: Record<Tier, string> = {
  none: 'No Subscription',
  t1: 'Foundation — $97/mo',
  t2: 'Business — $297/mo',
  t3: 'Growth — $497/mo',
  dfy: 'Done-For-You GEO — $1,000/mo',
};

export const TIER_COLORS: Record<Tier, string> = {
  none: 'bg-gray-400',
  t1: 'bg-blue-500',
  t2: 'bg-slate-700',
  t3: 'bg-amber-400 text-slate-900',
  dfy: 'bg-green-600',
};

// Which tools each tier can access
export const TIER_TOOLS: Record<Tier, string[]> = {
  none: [],
  t1: [
    'residential-pricing-guide',
    'overhead-calculator',
    'job-costing-tracker',
    'residential-proposal',
    'change-order-form',
    'client-comms',
  ],
  t2: [
    'residential-pricing-guide',
    'overhead-calculator',
    'job-costing-tracker',
    'residential-proposal',
    'change-order-form',
    'client-comms',
    'commercial-estimating',
    'ev-charger-calculator',
    'hiring-cost-calculator',
    'commercial-bid-proposal',
    'electrical-service-agreement',
    'commercial-maintenance-agreement',
    'subcontractor-agreement',
    'nec-2023-summary',
    'google-local-seo',
    'hiring-onboarding-kit',
  ],
  t3: [
    'all-t2-tools',
    'lead-generation-machine',
    'client-crm',
    'reputation-system',
    'social-media-kit',
    'email-marketing-templates',
    'google-ads-playbook',
    'referral-marketing',
    'partner-program',
    'geo-audit-report',
    'ai-marketing-assistant',
  ],
  dfy: ['all-t3-tools', 'dfy-geo-management'],
};

export const TIER_CALCULATORS: Record<Tier, string[]> = {
  none: [],
  t1: ['residential-pricing', 'overhead', 'job-costing'],
  t2: ['residential-pricing', 'overhead', 'job-costing', 'ev-charger', 'hiring-cost'],
  t3: ['residential-pricing', 'overhead', 'job-costing', 'ev-charger', 'hiring-cost'],
  dfy: ['residential-pricing', 'overhead', 'job-costing', 'ev-charger', 'hiring-cost'],
};

// LS product IDs mapped to tiers
export const LS_TIER_MAP: Record<string, Tier> = {
  // Replace with actual LS product IDs once created
  'tier-97': 't1',
  'tier-297': 't2',
  'tier-497': 't3',
  'tier-1000': 'dfy',
};
