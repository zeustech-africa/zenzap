import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface AutoReplyRule {
  id: string;
  userId: string;
  keyword: string;
  response: string;
  enabled: boolean;
  matchExact: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
const rules: AutoReplyRule[] = [];

// Helper: Send WhatsApp message via Meta API
async function sendWhatsAppMessage(to: string, message: string, accessToken: string, phoneNumberId: string) {
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
  return response.json();
}

// Get all rules for authenticated user
router.get('/automation/rules', (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userRules = rules.filter(r => r.userId === userId);
  res.json(userRules);
});

// Create a new auto-reply rule
router.post('/automation/rules', (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { keyword, response, matchExact = false } = req.body;
  
  if (!keyword || !response) {
    return res.status(400).json({ error: 'Keyword and response are required' });
  }
  
  const newRule: AutoReplyRule = {
    id: uuidv4(),
    userId,
    keyword: keyword.toLowerCase(),
    response,
    enabled: true,
    matchExact,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  rules.push(newRule);
  res.status(201).json(newRule);
});

// Update a rule
router.put('/automation/rules/:id', (req, res) => {
  const userId = (req as any).user?.id;
  const rule = rules.find(r => r.id === req.params.id && r.userId === userId);
  
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  
  const { keyword, response, enabled, matchExact } = req.body;
  if (keyword !== undefined) rule.keyword = keyword.toLowerCase();
  if (response !== undefined) rule.response = response;
  if (enabled !== undefined) rule.enabled = enabled;
  if (matchExact !== undefined) rule.matchExact = matchExact;
  rule.updatedAt = new Date().toISOString();
  
  res.json(rule);
});

// Delete a rule
router.delete('/automation/rules/:id', (req, res) => {
  const userId = (req as any).user?.id;
  const index = rules.findIndex(r => r.id === req.params.id && r.userId === userId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  
  rules.splice(index, 1);
  res.json({ success: true });
});

// Webhook endpoint - called when a message arrives
// This checks if any rule matches and sends auto-reply
router.post('/automation/webhook', async (req, res) => {
  const { from, message, userId } = req.body;
  
  // Find matching rule for this user
  const userRules = rules.filter(r => r.userId === userId && r.enabled);
  
  for (const rule of userRules) {
    const messageLower = message.toLowerCase();
    const keywordLower = rule.keyword.toLowerCase();
    
    let matches = false;
    if (rule.matchExact) {
      matches = messageLower === keywordLower;
    } else {
      matches = messageLower.includes(keywordLower);
    }
    
    if (matches) {
      // Send auto-reply via WhatsApp API
      const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (whatsappToken && phoneNumberId) {
        await sendWhatsAppMessage(from, rule.response, whatsappToken, phoneNumberId);
      }
      
      return res.json({ matched: true, ruleId: rule.id, response: rule.response });
    }
  }
  
  res.json({ matched: false });
});

export default router;