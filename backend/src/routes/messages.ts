import express from 'express';
import { whatsappService } from '../services/whatsapp';

const router = express.Router();

// Send a message
router.post('/send', async (req, res) => {
  const { to, message, type = 'text' } = req.body;
  
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    let result;
    
    if (type === 'template') {
      result = await whatsappService.sendTemplateMessage(to, message);
    } else {
      result = await whatsappService.sendTextMessage(to, message);
    }
    
    res.json({ success: true, messageId: result.messages?.[0]?.id });
  } catch (error: any) {
    console.error('Failed to send message:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error?.message || 'Failed to send message' });
  }
});

// Mark message as read
router.post('/read/:messageId', async (req, res) => {
  const { messageId } = req.params;
  
  try {
    await whatsappService.markAsRead(messageId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Get templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await whatsappService.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router;