export type BillingStatus = 'active' | 'trial' | 'overdue' | 'suspended' | 'expired' | 'draft' | 'archived' | 'pending_refund' | 'refunded' | 'failed_payment' | 'recovering' | 'coupon_active' | 'coupon_expired';

export type PlanStatus = 'active' | 'draft' | 'archived' | 'disabled';

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  includedSeats: number;
  usageTier: 'free' | 'growth' | 'enterprise';
  aiCredits: number;
  status: PlanStatus;
  description?: string;
}

export interface TenantBillingRecord {
  id: string;
  tenantName: string;
  currentPlanId: string;
  renewalDate: string;
  invoiceStatus: 'paid' | 'overdue' | 'unpaid' | 'pending';
  monthlySpend: number;
  usageTier: 'free' | 'growth' | 'enterprise';
  billingStatus: BillingStatus;
}

export interface CouponCampaign {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  status: 'active' | 'inactive' | 'expired';
  expiryDate: string;
  usageCount: number;
  minSpend: number;
}

export interface RefundRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  reason: string;
  billingReference: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'reviewed';
}

export interface TaxRule {
  id: string;
  region: string;
  taxRate: number;
  invoiceLabel: string;
  status: 'active' | 'inactive';
  exempt: boolean;
}

export interface FailedPaymentRecord {
  id: string;
  tenantName: string;
  invoiceId: string;
  amount: number;
  failedDate: string;
  retryCount: number;
  lastAttemptDate: string;
  dunningStatus: 'first_notice' | 'second_notice' | 'final_notice' | 'suspended';
  recoveryStage: 'active_recovery' | 'suspended_grace' | 'write_off';
}
