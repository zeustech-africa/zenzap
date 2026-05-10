export interface ShopifyStore {
  id: string;
  userId: string;
  storeName: string;
  storeUrl: string;
  accessToken: string;
  scope: string;
  isConnected: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyOrder {
  id: string;
  userId: string;
  orderId: number;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  currency: string;
  status: string;
  items: ShopifyOrderItem[];
  createdAt: string;
  syncedToWhatsApp: boolean;
}

export interface ShopifyOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

// In-memory storage
export const shopifyStores: ShopifyStore[] = [];
export const shopifyOrders: ShopifyOrder[] = [];