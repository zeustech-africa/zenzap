export interface CallRecord {
  id: string;
  userId: string;
  customerPhone: string;
  customerName: string;
  type: 'voice' | 'video';
  direction: 'outgoing' | 'incoming';
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'missed' | 'failed';
  duration: number; // seconds
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

// In-memory storage
export const callRecords: CallRecord[] = [];