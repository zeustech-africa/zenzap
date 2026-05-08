import { v4 as uuidv4 } from 'uuid';

export interface Lead {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  source: 'whatsapp' | 'website' | 'referral' | 'import';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number; // 0-100 lead score
  interest: string; // Product/service they're interested in
  notes: LeadNote[];
  assignedTo?: string; // Staff ID
  lastContactAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface FollowUpSequence {
  id: string;
  businessId: string;
  name: string;
  trigger: 'new_lead' | 'status_change' | 'manual';
  steps: FollowUpStep[];
  isActive: boolean;
}

export interface FollowUpStep {
  id: string;
  delayHours: number; // Hours after previous step
  messageTemplate: string;
  type: 'whatsapp' | 'email';
}

// In-memory storage
export const leads: Lead[] = [];
export const followUpSequences: FollowUpSequence[] = [];