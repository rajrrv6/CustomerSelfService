export interface ConflictFieldDetail {
  fieldName: string;
  fieldLabel: string;
  localValue: string;
  externalValue: string;
}

export interface SyncConflict {
  id: string;
  customerId: string;
  customerName: string;
  avatarUrl?: string;
  sourceConnectorId: string;
  conflictDescription: string;
  detectedAt: string;
  fields: ConflictFieldDetail[];
}

export const initialConflicts: SyncConflict[] = [
  {
    id: 'conf-1',
    customerId: 'cust-1029',
    customerName: 'Sarah Jenkins',
    avatarUrl: '/avatars/female-1.png',
    sourceConnectorId: 'salesforce',
    conflictDescription: 'Telephone number mismatch detected during hourly contact sync.',
    detectedAt: '2026-05-20 17:10:00',
    fields: [
      {
        fieldName: 'phone',
        fieldLabel: 'Mobile Phone',
        localValue: '+1 (555) 902-1209',
        externalValue: '+1 (555) 902-1888'
      },
      {
        fieldName: 'lastName',
        fieldLabel: 'Last Name',
        localValue: 'Jenkins',
        externalValue: 'Jenkins-Connor'
      }
    ]
  },
  {
    id: 'conf-2',
    customerId: 'cust-9922',
    customerName: 'Ahmad bin Saud',
    avatarUrl: '/avatars/male-2.png',
    sourceConnectorId: 'shopify',
    conflictDescription: 'Fulfillment delivery address differs from account billing address.',
    detectedAt: '2026-05-20 16:32:00',
    fields: [
      {
        fieldName: 'shippingAddress',
        fieldLabel: 'Default Shipping Address',
        localValue: 'King Fahd Road, Sector 4, Riyadh, Saudi Arabia',
        externalValue: 'Tahlia St, Block 12, Jeddah, Saudi Arabia'
      }
    ]
  },
  {
    id: 'conf-3',
    customerId: 'cust-4410',
    customerName: 'Michael Vance',
    avatarUrl: '/avatars/male-3.png',
    sourceConnectorId: 'stripe',
    conflictDescription: 'Credit card overdue notification status conflicts with active subscription token.',
    detectedAt: '2026-05-20 15:40:00',
    fields: [
      {
        fieldName: 'isOverdue',
        fieldLabel: 'Payment Delinquency Status',
        localValue: 'false',
        externalValue: 'true'
      },
      {
        fieldName: 'billingStatus',
        fieldLabel: 'Subscription Plan Tier',
        localValue: 'Premium Monthly',
        externalValue: 'Canceled (Unpaid)'
      }
    ]
  }
];
