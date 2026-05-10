import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Store user tokens (in-memory for now)
const userTokens: Record<string, { token: string; expiresAt: number }> = {};

// Store QR sessions
const qrSessions: Map<string, { userId: string; createdAt: number; status: string }> = new Map();

// Generate device-linking QR code
router.get('/qr/generate', async (req, res) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return res.status(400).json({
      error: 'WhatsApp API not configured',
      setupRequired: true
    });
  }

  try {
    const sessionId = uuidv4();
    const userId = req.query.userId as string;

    qrSessions.set(sessionId, {
      userId: userId || 'unknown',
      createdAt: Date.now(),
      status: 'pending'
    });

    // Generate QR code using Meta API
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/message_qrdls`,
      {
        prefilled_message: 'Connect to ZENZAP',
        qr_code_options: {
          qr_code_size: 512
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      sessionId,
      qrCode: response.data.qr_code,
      qrCodeUrl: response.data.qr_code_url,
      expiry: response.data.expiry_time,
      success: true
    });
  } catch (error: any) {
    console.error('QR generation error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate QR code',
      details: error.response?.data?.error?.message
    });
  }
});

// Callback endpoint for Embedded Signup
router.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  
  const redirectUri = `${process.env.APP_URL || 'https://zenzap-omega.vercel.app'}/dashboard/whatsapp-connection`;
  
  if (error) {
    console.error('OAuth error:', error, error_description);
    res.redirect(`${redirectUri}?error=access_denied`);
    return;
  }
  
  if (code) {
    // Redirect to frontend with the code
    res.redirect(`${redirectUri}?code=${code}`);
  }
});

// Check QR connection status
router.get('/qr/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = qrSessions.get(sessionId);

  if (session && session.status === 'connected') {
    res.json({ status: 'connected' });
  } else if (session) {
    res.json({ status: 'pending' });
  } else {
    res.json({ status: 'expired' });
  }
});

// Update connection status (called from webhook)
router.post('/qr/connected', (req, res) => {
  const { sessionId, userId } = req.body;

  if (sessionId && qrSessions.has(sessionId)) {
    const session = qrSessions.get(sessionId);
    session!.status = 'connected';
    qrSessions.set(sessionId, session!);
    console.log(`✅ WhatsApp connected for user ${userId || session?.userId}`);
  }

  res.json({ success: true });
});

export default router;