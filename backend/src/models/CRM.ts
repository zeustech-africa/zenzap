export interface CRMConnection {
  id: string;
  userId: string;
  provider: 'hubspot' | 'salesforce';
  accessToken: string;
  refreshToken?: string;
  instanceUrl?: string; // for Salesforce
  portalId?: string; // for HubSpot
  isConnected: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMContact {
  id: string;
  crmId: string;
  userId: string;
  provider: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  lastSyncedAt: string;
}

// In-memory storage
export const crmConnections: CRMConnection[] = [];
export const crmContacts: CRMContact[] = [];