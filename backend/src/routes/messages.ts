import express from 'express';

const router = express.Router();

// Placeholder - message sending will be re-implemented
router.post('/send', (_req, res) => {
  res.status(503).json({
    error: 'WhatsApp messaging is being upgraded',
    message: 'Please check back shortly for the new messaging system.'
  });
});

// Mark message as read - placeholder
router.post('/read/:messageId', (_req, res) => {
  res.json({ success: true, note: 'placeholder' });
});

// Get templates - placeholder
router.get('/templates', (_req, res) => {
  res.json([]);
});

export default router;