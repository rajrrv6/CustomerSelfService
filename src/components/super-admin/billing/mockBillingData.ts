import { SubscriptionPlan, TenantBillingRecord } from '@/types/billing';

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Trial Developer',
    monthlyPrice: 0,
    annualPrice: 0,
    includedSeats: 2,
    usageTier: 'free',
    aiCredits: 500000,
    status: 'active',
    description: 'Basic sandbox limits for LLM testing and IVR workflow experimentation.'
  },
  {
    id: 'plan-growth',
    name: 'Enterprise Growth Tier',
    monthlyPrice: 299,
    annualPrice: 2990,
    includedSeats: 15,
    usageTier: 'growth',
    aiCredits: 10000000,
    status: 'active',
    description: 'High concurrency voice and chat routing for mid-size customer support centers.'
  },
  {
    id: 'plan-enterprise',
    name: 'Unlimited Enterprise Suite',
    monthlyPrice: 999,
    annualPrice: 9990,
    includedSeats: 100,
    usageTier: 'enterprise',
    aiCredits: 100000000,
    status: 'active',
    description: 'Dedicated LLM deployment model, redundant custom trunks capacity, and real-time SIEM alerts.'
  },
  {
    id: 'plan-draft-premium',
    name: 'Premium Custom Core',
    monthlyPrice: 499,
    annualPrice: 4990,
    includedSeats: 30,
    usageTier: 'growth',
    aiCredits: 25000000,
    status: 'draft',
    description: 'Staged custom pricing model for advanced automation configurations.'
  }
];

export const mockTenantBillingRecords: TenantBillingRecord[] = [
  {
    id: 'tenant-stc',
    tenantName: 'Saudi Telecom Corp (HQ)',
    currentPlanId: 'plan-enterprise',
    renewalDate: '2026-07-15',
    invoiceStatus: 'paid',
    monthlySpend: 999,
    usageTier: 'enterprise',
    billingStatus: 'active'
  },
  {
    id: 'tenant-alrajhi',
    tenantName: 'Al-Rajhi Retail Group',
    currentPlanId: 'plan-growth',
    renewalDate: '2026-06-30',
    invoiceStatus: 'paid',
    monthlySpend: 299,
    usageTier: 'growth',
    billingStatus: 'active'
  },
  {
    id: 'tenant-emirates',
    tenantName: 'Emirates Airlines VoIP Hub',
    currentPlanId: 'plan-enterprise',
    renewalDate: '2026-07-01',
    invoiceStatus: 'paid',
    monthlySpend: 999,
    usageTier: 'enterprise',
    billingStatus: 'active'
  },
  {
    id: 'tenant-fintech',
    tenantName: 'Gulf Fintech Innovation Lab',
    currentPlanId: 'plan-free',
    renewalDate: '2026-06-10',
    invoiceStatus: 'pending',
    monthlySpend: 0,
    usageTier: 'free',
    billingStatus: 'trial'
  },
  {
    id: 'tenant-hyperone',
    tenantName: 'HyperOne Retail Egypt',
    currentPlanId: 'plan-growth',
    renewalDate: '2026-05-20',
    invoiceStatus: 'overdue',
    monthlySpend: 299,
    usageTier: 'growth',
    billingStatus: 'overdue'
  },
  {
    id: 'tenant-noon',
    tenantName: 'Noon Logistics Portal',
    currentPlanId: 'plan-growth',
    renewalDate: '2026-05-01',
    invoiceStatus: 'overdue',
    monthlySpend: 299,
    usageTier: 'growth',
    billingStatus: 'suspended'
  },
  {
    id: 'tenant-legacy',
    tenantName: 'Legacy Support Partners',
    currentPlanId: 'plan-free',
    renewalDate: '2026-04-15',
    invoiceStatus: 'unpaid',
    monthlySpend: 0,
    usageTier: 'free',
    billingStatus: 'expired'
  }
];
