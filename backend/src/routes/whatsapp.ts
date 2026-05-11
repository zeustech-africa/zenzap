import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Store user WhatsApp connections
const userWhatsAppConnections: Map<string, { phoneNumberId: string; wabaId: string; accessToken: string }> = new Map();

// ============ TEST ENDPOINT ============
router.get('/test', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp routes are working',
    endpoints: ['/auth-url', '/callback', '/status', '/disconnect', '/test']
  });
});

// ============ EMBEDDED SIGNUP (OAuth) - WHAT COMPETITORS USE ============

// Get OAuth URL for WhatsApp connection
router.get('/auth-url', (req, res) => {
  const userId = req.query.userId as string;
  const appId = process.env.META_APP_ID;
  const configId = process.env.META_CONFIG_ID;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/callback`;
  
  const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}&config_id=${configId}&response_type=code`;
  
  res.json({ authUrl });
});

// OAuth Callback - After user grants permission
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const userId = state as string;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/whatsapp-connection`;
  
  if (error) {
    console.error('OAuth error:', error, error_description);
    res.redirect(`${redirectUri}?error=${error}`);
    return;
  }
  
  if (!code) {
    res.redirect(`${redirectUri}?error=no_code`);
    return;
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.APP_URL}/api/whatsapp/callback`,
        code: code
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user's WhatsApp Business Accounts
    const accountsResponse = await axios.get('https://graph.facebook.com/v22.0/me/whatsapp_business_accounts', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    const wabaAccounts = accountsResponse.data.data;
    
    if (wabaAccounts && wabaAccounts.length > 0) {
      const waba = wabaAccounts[0];
      
      // Get phone numbers for this WABA
      const phoneResponse = await axios.get(`https://graph.facebook.com/v22.0/${waba.id}/phone_numbers`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      
      const phoneNumbers = phoneResponse.data.data;
      
      if (phoneNumbers && phoneNumbers.length > 0) {
        const phoneNumber = phoneNumbers[0];
        
        userWhatsAppConnections.set(userId, {
          phoneNumberId: phoneNumber.id,
          wabaId: waba.id,
          accessToken: access_token
        });
        
        console.log(`✅ WhatsApp connected for user ${userId}: ${phoneNumber.display_phone_number}`);
        res.redirect(`${redirectUri}?connected=true`);
      } else {
        res.redirect(`${redirectUri}?error=no_phone_number`);
      }
    } else {
      res.redirect(`${redirectUri}?error=no_waba`);
    }
  } catch (error: any) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.redirect(`${redirectUri}?error=server_error`);
  }
});

// Get connection status
router.get('/status', (req, res) => {
  const userId = req.query.userId as string;
  const connection = userWhatsAppConnections.get(userId);
  res.json({ 
    status: connection ? 'connected' : 'disconnected',
    phoneNumberId: connection?.phoneNumberId
  });
});

// Disconnect WhatsApp
router.delete('/disconnect', (req, res) => {
  const userId = req.query.userId as string;
  userWhatsAppConnections.delete(userId);
  res.json({ success: true });
});

// ============ KEPT FOR BACKWARD COMPATIBILITY ============
router.get('/qr/generate', (req, res) => {
  res.status(400).json({ error: 'QR code method deprecated. Please use OAuth connection.' });
});

router.get('/qr/status/:sessionId', (req, res) => {
  res.json({ status: 'deprecated' });
});

router.post('/qr/connected', (req, res) => {
  res.json({ status: 'deprecated' });
});

export default router;