export type SipTrunkStatus = 'active' | 'inactive' | 'degraded' | 'connecting';

export interface SipTrunk {
  id: string;
  provider: string;
  ipGateway: string;
  routePrefix: string;
  concurrencyLimit: number;
  activeSessions: number;
  avgMos: number;
  status: SipTrunkStatus;
}

export type DidStatus = 'active' | 'inactive';
export type DidAssignmentState = 'assigned' | 'available' | 'reserved';

export interface DidNumber {
  id: string;
  phoneNumber: string;
  countryRegion: string;
  provider: string;
  assignedTenant: string;
  activationDate: string;
  status: DidStatus;
  assignmentState: DidAssignmentState;
}
