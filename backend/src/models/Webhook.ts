export interface WebhookEndpoint {
  id: string;
  userId: string;
  name: string;
  event: 'new_customer' | 'new_lead' | 'new_message' | 'new_booking' | 'new_order';
  url: string;
  isActive: boolean;
  secret: string;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  responseCode?: number;
  errorMessage?: string;
  attemptedAt: string;
  completedAt?: string;
}

// In-memory storage
export const webhookEndpoints: WebhookEndpoint[] = [];
export const webhookDeliveries: WebhookDelivery[] = [];