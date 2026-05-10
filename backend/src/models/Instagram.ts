export interface InstagramAccount {
  id: string;
  userId: string;
  instagramUserId: string;
  instagramUsername: string;
  pageId: string;
  pageName: string;
  accessToken: string;
  tokenExpiry: string;
  isConnected: boolean;
  connectedAt: string;
  lastSyncAt: string;
}

export interface InstagramMessage {
  id: string;
  accountId: string;
  fromId: string;
  fromName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'video' | 'reel_mention';
  mediaUrl?: string;
}

// In-memory storage
export const instagramAccounts: InstagramAccount[] = [];
export const instagramMessages: InstagramMessage[] = [];