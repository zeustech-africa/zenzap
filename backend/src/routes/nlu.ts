import express from 'express';
import { nluService } from '../services/nlu';

const router = express.Router();

// Analyze message intent
router.post('/nlu/analyze', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const result = await nluService.detectIntent(message);
    res.json(result);
  } catch (error) {
    console.error('NLU analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

// Batch analyze (for training or testing)
router.post('/nlu/batch', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }
  
  const results = await Promise.all(
    messages.map(async (msg: string) => ({
      message: msg,
      intent: await nluService.detectIntent(msg)
    }))
  );
  
  res.json(results);
});

export default router;