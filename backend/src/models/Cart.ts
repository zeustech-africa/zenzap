export interface AbandonedCart {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: CartItem[];
  totalAmount: number;
  status: 'new' | 'reminder_sent_1' | 'reminder_sent_2' | 'reminder_sent_3' | 'recovered' | 'lost';
  reminderSentAt?: string[];
  recoveredAt?: string;
  discountCode?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountPercent: number;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

// In-memory storage
export const abandonedCarts: AbandonedCart[] = [];
export const discountCodes: DiscountCode[] = [];