export interface Message {
  id: string;
  fromUserId: string;
  fromUserType: 'admin' | 'business';
  toUserId: string;
  toUserType: 'admin' | 'business';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  businessId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const messages: Message[] = [];
export const supportTickets: SupportTicket[] = [];