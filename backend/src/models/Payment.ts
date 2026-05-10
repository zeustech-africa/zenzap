export interface PaymentLink {
  id: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string;
  paymentId?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

export interface PaymentTransaction {
  id: string;
  paymentLinkId: string;
  amount: number;
  status: string;
  payfastPaymentId?: string;
  createdAt: string;
}

// In-memory storage
export const paymentLinks: PaymentLink[] = [];
export const paymentTransactions: PaymentTransaction[] = [];