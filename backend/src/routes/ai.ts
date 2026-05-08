import express from 'express';
import { aiService } from '../services/ai';

const router = express.Router();

// Analyze customer message and get suggestions
router.post('/analyze', async (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const analysis = await aiService.analyzeMessage(message, context);
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

// Generate AI response to customer message
router.post('/generate-response', async (req, res) => {
  const { message, businessContext } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const response = await aiService.generateResponse(message, businessContext);
    res.json({ response });
  } catch (error) {
    console.error('Response generation error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Detect language of customer message
router.post('/detect-language', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const language = await aiService.detectLanguage(message);
    res.json({ language });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ error: 'Failed to detect language' });
  }
});

export default router;