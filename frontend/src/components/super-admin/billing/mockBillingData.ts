import { SubscriptionPlan, TenantBillingRecord, CouponCampaign, RefundRequest, TaxRule, FailedPaymentRecord } from '@/types/billing';

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

export const mockCoupons: CouponCampaign[] = [
  { id: 'cpn-1', code: 'RAMADAN2026', discountType: 'percentage', discountValue: 15, status: 'active', expiryDate: '2026-06-30', usageCount: 42, minSpend: 299 },
  { id: 'cpn-2', code: 'ENTERPRISE100', discountType: 'fixed', discountValue: 100, status: 'active', expiryDate: '2026-12-31', usageCount: 12, minSpend: 999 },
  { id: 'cpn-3', code: 'EXPIRED50', discountType: 'percentage', discountValue: 50, status: 'expired', expiryDate: '2026-05-01', usageCount: 128, minSpend: 0 },
  { id: 'cpn-4', code: 'LAUNCH25', discountType: 'percentage', discountValue: 25, status: 'inactive', expiryDate: '2026-08-15', usageCount: 0, minSpend: 199 }
];

export const mockRefundRequests: RefundRequest[] = [
  { id: 'ref-1', tenantId: 'tenant-hyperone', tenantName: 'HyperOne Retail Egypt', amount: 299, reason: 'Duplicate billing instance during migration', billingReference: 'INV-2026-049', timestamp: '2026-06-02 14:32:10', status: 'pending' },
  { id: 'ref-2', tenantId: 'tenant-noon', tenantName: 'Noon Logistics Portal', amount: 150, reason: 'SLA breach refund claim', billingReference: 'INV-2026-035', timestamp: '2026-06-03 09:15:00', status: 'pending' },
  { id: 'ref-3', tenantId: 'tenant-legacy', tenantName: 'Legacy Support Partners', amount: 99, reason: 'Unused user seats adjustment', billingReference: 'INV-2026-022', timestamp: '2026-05-28 11:20:00', status: 'approved' },
  { id: 'ref-4', tenantId: 'tenant-stc', tenantName: 'Saudi Telecom Corp (HQ)', amount: 999, reason: 'Accidental double payment check', billingReference: 'INV-2026-041', timestamp: '2026-05-25 16:40:00', status: 'rejected' }
];

export const mockTaxRules: TaxRule[] = [
  { id: 'tax-1', region: 'GCC VAT (Saudi Arabia / UAE)', taxRate: 15, invoiceLabel: 'VAT 15%', status: 'active', exempt: false },
  { id: 'tax-2', region: 'Egypt VAT', taxRate: 14, invoiceLabel: 'VAT 14%', status: 'active', exempt: false },
  { id: 'tax-3', region: 'US Sales Tax (Exempt Zone)', taxRate: 0, invoiceLabel: 'US TAX EXEMPT', status: 'active', exempt: true },
  { id: 'tax-4', region: 'Europe VAT (Fallback)', taxRate: 20, invoiceLabel: 'VAT 20%', status: 'inactive', exempt: false }
];

export const mockFailedPayments: FailedPaymentRecord[] = [
  { id: 'fail-1', tenantName: 'HyperOne Retail Egypt', invoiceId: 'INV-2026-049', amount: 299, failedDate: '2026-05-21', retryCount: 2, lastAttemptDate: '2026-05-28', dunningStatus: 'second_notice', recoveryStage: 'active_recovery' },
  { id: 'fail-2', tenantName: 'Noon Logistics Portal', invoiceId: 'INV-2026-035', amount: 299, failedDate: '2026-05-01', retryCount: 4, lastAttemptDate: '2026-05-15', dunningStatus: 'suspended', recoveryStage: 'suspended_grace' },
  { id: 'fail-3', tenantName: 'Legacy Support Partners', invoiceId: 'INV-2026-022', amount: 150, failedDate: '2026-04-15', retryCount: 5, lastAttemptDate: '2026-04-30', dunningStatus: 'suspended', recoveryStage: 'write_off' }
];
