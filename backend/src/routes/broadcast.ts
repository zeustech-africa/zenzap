import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface Broadcast {
  id: string;
  userId: string;
  name: string;
  message: string;
  recipients: string[]; // Array of phone numbers
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  scheduledFor?: string;
  createdAt: string;
  completedAt?: string;
}

// In-memory storage (replace with database)
const broadcasts: Broadcast[] = [];

// Helper: Send WhatsApp message via Meta API
async function sendWhatsAppMessage(to: string, message: string, accessToken: string, phoneNumberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: message },
      }),
    });
    
    const data = await response.json() as any;
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data?.error?.message || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Create broadcast
router.post('/broadcasts', (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { name, message, recipients, scheduledFor } = req.body;
  
  if (!name || !message || !recipients || recipients.length === 0) {
    return res.status(400).json({ error: 'Name, message, and recipients are required' });
  }
  
  const newBroadcast: Broadcast = {
    id: uuidv4(),
    userId,
    name,
    message,
    recipients,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    status: scheduledFor ? 'draft' : 'sending',
    scheduledFor,
    createdAt: new Date().toISOString(),
  };
  
  broadcasts.push(newBroadcast);
  
  // If not scheduled, start sending immediately
  if (!scheduledFor) {
    sendBroadcastMessages(newBroadcast.id);
  }
  
  res.status(201).json(newBroadcast);
});

// Get user's broadcasts
router.get('/broadcasts', (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userBroadcasts = broadcasts.filter(b => b.userId === userId);
  res.json(userBroadcasts);
});

// Get single broadcast
router.get('/broadcasts/:id', (req, res) => {
  const userId = (req as any).user?.id;
  const broadcast = broadcasts.find(b => b.id === req.params.id && b.userId === userId);
  
  if (!broadcast) {
    return res.status(404).json({ error: 'Broadcast not found' });
  }
  
  res.json(broadcast);
});

// Send broadcast messages
async function sendBroadcastMessages(broadcastId: string) {
  const broadcast = broadcasts.find(b => b.id === broadcastId);
  if (!broadcast || broadcast.status !== 'sending') return;
  
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!whatsappToken || !phoneNumberId) {
    console.error('WhatsApp credentials missing');
    broadcast.status = 'failed';
    return;
  }
  
  for (const recipient of broadcast.recipients) {
    const result = await sendWhatsAppMessage(recipient, broadcast.message, whatsappToken, phoneNumberId);
    
    if (result.success) {
      broadcast.sentCount++;
      broadcast.deliveredCount++;
    } else {
      broadcast.failedCount++;
    }
    
    // Update broadcast in storage
    const index = broadcasts.findIndex(b => b.id === broadcastId);
    if (index !== -1) {
      broadcasts[index] = broadcast;
    }
    
    // Rate limit: wait 100ms between messages
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  broadcast.status = 'completed';
  broadcast.completedAt = new Date().toISOString();
  
  const index = broadcasts.findIndex(b => b.id === broadcastId);
  if (index !== -1) {
    broadcasts[index] = broadcast;
  }
}

// Delete broadcast
router.delete('/broadcasts/:id', (req, res) => {
  const userId = (req as any).user?.id;
  const index = broadcasts.findIndex(b => b.id === req.params.id && b.userId === userId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Broadcast not found' });
  }
  
  broadcasts.splice(index, 1);
  res.json({ success: true });
});

export default router;