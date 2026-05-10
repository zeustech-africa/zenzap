import express from 'express';

const router = express.Router();

// Store for incoming messages (basic, in-memory)
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

// Receive incoming messages (basic handler - to be expanded)
router.post('/webhook', (req, res) => {
  const body = req.body;

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
            text: message.text?.body || '',
            timestamp: message.timestamp,
            type: message.type,
            contactName: contact.profile?.name || 'Unknown',
            receivedAt: new Date().toISOString()
          };

          incomingMessages.push(incomingMessage);
          console.log('Received WhatsApp message:', incomingMessage.id, 'from:', incomingMessage.from);
        }
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

export { incomingMessages };
export default router;