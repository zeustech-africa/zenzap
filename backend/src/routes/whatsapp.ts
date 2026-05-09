import express from 'express';
import axios from 'axios';

const router = express.Router();

// Store user tokens (in-memory for now)
const userTokens: Record<string, { token: string; expiresAt: number }> = {};

// Generate WhatsApp QR code using Meta Graph API
router.get('/qr', async (req, res) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return res.status(400).json({ error: 'WhatsApp API not configured' });
  }

  try {
    // For Embedded Signup, we return a config ID instead of QR code
    res.json({ 
      configId: process.env.META_CONFIG_ID,
      appId: process.env.META_APP_ID,
      redirectUri: `${process.env.APP_URL || 'https://zenzap-omega.vercel.app'}/api/whatsapp/callback`
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Exchange authorization code for access token
router.post('/exchange-token', async (req, res) => {
  const { code, userId } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const response = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.APP_URL || 'https://zenzap-omega.vercel.app'}/api/whatsapp/callback`,
        code: code
      }
    });

    const { access_token, expires_in } = response.data;

    // Store token for user
    if (userId) {
      userTokens[userId] = {
        token: access_token,
        expiresAt: Date.now() + (expires_in * 1000)
      };
    }

    console.log('✅ Token exchanged successfully');
    res.json({ success: true, expiresIn: expires_in });
  } catch (error: any) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error.response?.data?.error?.message || 'Unknown error'
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
  } else {
    res.redirect(`${redirectUri}?error=no_code`);
  }
});

// Get connection status
router.get('/status', async (req, res) => {
  // Check if user has a valid token (simplified)
  res.json({ status: 'disconnected' });
});

export default router;
