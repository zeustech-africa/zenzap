export interface FacebookPage {
  id: string;
  userId: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  isConnected: boolean;
  connectedAt: string;
  lastSyncAt?: string;
}

export interface FacebookConversation {
  id: string;
  pageId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'attachment';
}

export const facebookPages: FacebookPage[] = [];
export const facebookConversations: FacebookConversation[] = [];