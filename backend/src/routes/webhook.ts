import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { customers, customerInteractions } from '../models/Customer';

const router = express.Router();

// Store for messages (replace with database)
const incomingMessages: any[] = [];

// Verify webhook for Meta setup
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'zenzap_verify_token_2025';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive incoming messages
router.post('/webhook', (req, res) => {
  const body = req.body;
  
  // Check if this is a WhatsApp message
  if (body.object === 'whatsapp_business_account') {
    const entries = body.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        const messages = change.value?.messages || [];
        const contacts = change.value?.contacts || [];
        
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          const contact = contacts[i] || {};
          
          const incomingMessage = {
            id: message.id,
            from: message.from,
            to: change.value?.metadata?.phone_number_id,
            text: message.text?.body || '',
            timestamp: message.timestamp,
            type: message.type,
            contactName: contact.profile?.name || 'Unknown',
            status: 'received',
            createdAt: new Date().toISOString()
          };
          
          incomingMessages.push(incomingMessage);
          console.log('Received message:', incomingMessage);
          
          // Auto-create/update customer from WhatsApp message
          const businessId = change.value?.metadata?.phone_number_id || 'default';
          const existingCustomer = customers.find(c => c.phone === message.from && c.businessId === businessId);

          if (!existingCustomer) {
            // Create new customer
            const newCustomer = {
              id: uuidv4(),
              businessId,
              name: contact.profile?.name || message.from,
              phone: message.from,
              tags: ['lead'],
              notes: [],
              totalInteractions: 1,
              lastInteractionAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const
            };
            customers.push(newCustomer);

            // Record interaction
            customerInteractions.push({
              id: uuidv4(),
              customerId: newCustomer.id,
              type: 'message_received',
              details: message.text?.body || '',
              timestamp: new Date().toISOString()
            });
          } else {
            existingCustomer.totalInteractions += 1;
            existingCustomer.lastInteractionAt = new Date().toISOString();

            // Record interaction
            customerInteractions.push({
              id: uuidv4(),
              customerId: existingCustomer.id,
              type: 'message_received',
              details: message.text?.body || '',
              timestamp: new Date().toISOString()
            });
          }
          
          // Auto-reply logic will be handled by a separate processor
        }
      }
    }
    
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Get messages for a conversation
router.get('/messages/:phoneNumber', (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const messages = incomingMessages.filter(m => m.from === phoneNumber || m.to === phoneNumber);
  res.json(messages);
});

export default router;