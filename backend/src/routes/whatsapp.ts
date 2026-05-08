import express from 'express';
import axios from 'axios';

const router = express.Router();

// Store connection sessions
const sessions: Map<string, any> = new Map();

// Store user tokens (in-memory for now)
const userTokens: Record<string, { token: string; expiresAt: number }> = {};

// Generate WhatsApp QR code using Meta Graph API
// Uses message_qrdls endpoint to create a QR code that opens a WhatsApp chat
router.get('/qr', async (req, res) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return res.status(400).json({ error: 'WhatsApp API not configured' });
  }

  try {
    // Call Meta Graph API to generate a QR code for the phone number
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/message_qrdls`,
      {
        prefilled_message: 'Hello! I\'d like to connect.',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // The API returns a QR code image URL and related data
    res.json({
      qrCodeUrl: response.data.qr_code_url,
      code: response.data.code,
      prefilledMessage: response.data.prefilled_message,
    });
  } catch (error: any) {
    console.error('QR generation error:', error.response?.data || error.message);

    // Fallback: Return QR code text for frontend to render as a QR code
    // This fallback uses a whatsapp:// deep link as a bridge until the
    // phone number is fully registered with Meta
    const qrText = `whatsapp://send?phone=+${phoneNumberId}`;
    res.json({
      qrCodeUrl: null,
      qrCodeText: qrText,
      code: null,
      prefilledMessage: null,
      instructions:
        'QR could not be generated via Meta API. The phone number may need to be in CONNECTED status. Consider using Meta Business Suite to complete setup.',
    });
  }
});

// Exchange authorization code for access token (Embedded Signup)
router.post('/exchange-token', async (req, res) => {
  const { code, userId } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const response = await axios.post('https://graph.facebook.com/v22.0/oauth/access_token', null, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/callback`
      }
    });

    const { access_token, expires_in } = response.data;

    // Store token for user (in-memory for now)
    if (userId) {
      userTokens[userId] = {
        token: access_token,
        expiresAt: Date.now() + (expires_in * 1000)
      };
    }

    console.log('✅ Token exchanged successfully for user:', userId);

    res.json({ success: true, expiresIn: expires_in });
  } catch (error: any) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error.response?.data?.error?.message || 'Unknown error'
    });
  }
});

// Get connection status
router.get('/status', async (req, res) => {
  // First check if this is an Embedded Signup user with a stored token
  const userId = req.query.userId as string;
  const token = userId ? userTokens[userId]?.token : null;

  if (token) {
    try {
      // Check if token is still valid by calling Graph API
      const response = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json({ status: 'connected' });
    } catch (error) {
      return res.json({ status: 'disconnected' });
    }
  }

  // Fallback to checking WhatsApp phone number registration status
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return res.json({ status: 'disconnected' });
  }

  try {
    // Check the phone number registration status from Meta
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const status = response.data?.code_verification_status || response.data?.status;
    // Map Meta statuses to our connection states
    const mappedStatus =
      status === 'VERIFIED' || status === 'CONNECTED' ? 'connected' : 'disconnected';

    res.json({ status: mappedStatus, raw: response.data });
  } catch (error: any) {
    console.error('Status check error:', error?.response?.data || error.message);
    res.json({ status: 'disconnected' });
  }
});

// Callback endpoint for Embedded Signup redirect
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (code) {
    // Redirect to frontend with code
    res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard/whatsapp-connection?code=${code}`);
  } else {
    res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard/whatsapp-connection?error=connection_failed`);
  }
});

export default router;