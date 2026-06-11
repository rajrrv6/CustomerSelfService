import { BillingStatus } from './billing';

export type TenantStatus = 'active' | 'suspended' | 'expired' | 'trial';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  currentPlanId: string;
  status: TenantStatus;
  billingStatus: BillingStatus;
  resourceLoad: number; // percentage (0-100)
  createdAt: string;
  adminEmail: string;
  ipWhitelist: string[];
  customDomain?: string;
  activeSeats: number;
  maxSeats: number;
  apiKey: string;
  nluVersion: string;
}

export interface TenantMeteringDataPoint {
  date: string;
  apiRequests: number;
  tokenUsage: number;
  cpuUsage: number;
}

export interface TenantMetering {
  tenantId: string;
  tenantName: string;
  dbRowsCount: number;
  dbRowsLimit: number;
  apiCallsLimit: number;
  tokensLimit: number;
  history: TenantMeteringDataPoint[];
}

export interface TenantFeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
}
