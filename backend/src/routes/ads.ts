import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Generate WhatsApp click-to-chat link (exact same format as Wati)
router.post('/ads/generate-link', (req, res) => {
  const { phoneNumber, message, utmSource, utmCampaign } = req.body;
  
  // Format phone number (remove non-digits, add country code if missing)
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('27') && cleanPhone.length === 9) {
    cleanPhone = `27${cleanPhone}`;
  }
  
  // Build URL (same as Wati's format)
  let url = `https://wa.me/${cleanPhone}`;
  
  // Add pre-filled message if provided
  const params = new URLSearchParams();
  if (message) {
    params.append('text', message);
  }
  
  // Add UTM parameters for tracking (if provided)
  if (utmSource) params.append('utm_source', utmSource);
  if (utmCampaign) params.append('utm_campaign', utmCampaign);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  // Generate unique link ID for tracking
  const linkId = uuidv4();
  
  res.json({
    linkId,
    url,
    qrCodeData: url,
    message: 'Link generated successfully',
    instructions: 'Copy this link to use in Facebook/Instagram ads or on your website'
  });
});

// Track link clicks (for analytics)
router.post('/ads/track/:linkId', (req, res) => {
  const { linkId } = req.params;
  // In production, store click analytics
  res.json({ success: true });
});

export default router;