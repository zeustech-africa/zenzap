export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  notes: CustomerNote[];
  totalInteractions: number;
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'lead';
  lifetimeValue?: number; // For tracking purchase value
}

export interface CustomerNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'message_sent' | 'message_received' | 'booking' | 'purchase' | 'tag_added';
  details: string;
  timestamp: string;
}

// In-memory storage (replace with database)
export const customers: Customer[] = [];
export const customerInteractions: CustomerInteraction[] = [];