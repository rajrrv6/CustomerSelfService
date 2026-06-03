export type BillingStatus = 'active' | 'trial' | 'overdue' | 'suspended' | 'expired' | 'draft' | 'archived';

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
