export interface OptInRecord {
  id: string;
  userId: string;
  customerPhone: string;
  customerName?: string;
  optInSource: 'whatsapp' | 'website' | 'facebook' | 'instagram' | 'import' | 'api';
  optInDate: string;
  optInMethod: 'checkbox' | 'button' | 'keyword' | 'api' | 'manual' | 'import';
  consentGiven: boolean;
  marketingConsent: boolean;
  transactionalConsent: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface OptInLog {
  id: string;
  userId: string;
  customerPhone: string;
  action: 'opt_in' | 'opt_out' | 'update' | 'view';
  changes?: string;
  source: string;
  performedBy: string;
  timestamp: string;
  ipAddress?: string;
}

// In-memory storage
export const optInRecords: OptInRecord[] = [];
export const optInLogs: OptInLog[] = [];