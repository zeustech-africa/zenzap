export interface Template {
  id: string;
  userId: string;
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  content: string;
  variables: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  metaId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  successRate: number;
}

// In-memory storage (will be replaced with database)
export const templates: Template[] = [];