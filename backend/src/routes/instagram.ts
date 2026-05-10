import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { InstagramAccount, instagramAccounts, instagramMessages } from '../models/Instagram';

const router = express.Router();

// Get Instagram connection status
router.get('/instagram/status', (req, res) => {
  const userId = req.query.userId as string;
  const account = instagramAccounts.find(a => a.userId === userId);
  res.json({ connected: !!account, account: account || null });
});

// Get Instagram connection URL (Facebook OAuth)
router.get('/instagram/auth-url', (req, res) => {
  const clientId = process.env.FACEBOOK_APP_ID || '4057562981062381';
  const redirectUri = `${process.env.APP_URL || 'https://zenzap-omega.vercel.app'}/api/instagram/callback`;
  const scope = 'instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement';
  
  const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  
  res.json({ authUrl });
});

// OAuth callback
router.get('/instagram/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = state as string; // Pass userId in state
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.APP_URL}/api/instagram/callback`,
        code
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get pages (Instagram accounts are linked to Facebook Pages)
    const pagesResponse = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
      params: { access_token }
    });
    
    const page = pagesResponse.data.data[0];
    if (!page) {
      throw new Error('No Facebook Page found');
    }
    
    // Get Instagram Business Account ID from Page
    const instagramResponse = await axios.get(`https://graph.facebook.com/v22.0/${page.id}`, {
      params: {
        fields: 'instagram_business_account,access_token',
        access_token
      }
    });
    
    const instagramBusinessId = instagramResponse.data.instagram_business_account?.id;
    
    if (!instagramBusinessId) {
      throw new Error('Instagram Business account not linked to this Facebook Page');
    }
    
    // Store Instagram account
    const newAccount: InstagramAccount = {
      id: uuidv4(),
      userId: userId as string,
      instagramUserId: instagramBusinessId,
      instagramUsername: '',
      pageId: page.id,
      pageName: page.name,
      accessToken: access_token,
      tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isConnected: true,
      connectedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString()
    };
    
    // Get username
    const userResponse = await axios.get(`https://graph.facebook.com/v22.0/${instagramBusinessId}`, {
      params: {
        fields: 'username',
        access_token
      }
    });
    newAccount.instagramUsername = userResponse.data.username;
    
    instagramAccounts.push(newAccount);
    
    res.redirect(`${process.env.APP_URL}/dashboard/instagram?connected=true`);
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard/instagram?error=connection_failed`);
  }
});

// Get recent Instagram DMs
router.get('/instagram/messages', (req, res) => {
  const userId = req.query.userId as string;
  const account = instagramAccounts.find(a => a.userId === userId);
  
  if (!account) {
    return res.status(404).json({ error: 'Instagram not connected' });
  }
  
  const messages = instagramMessages.filter(m => m.accountId === account.id);
  res.json(messages);
});

// Send Instagram DM
router.post('/instagram/send', async (req, res) => {
  const { userId, to, message } = req.body;
  const account = instagramAccounts.find(a => a.userId === userId);
  
  if (!account) {
    return res.status(404).json({ error: 'Instagram not connected' });
  }
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${account.instagramUserId}/messages`,
      {
        recipient: { id: to },
        message: { text: message },
        messaging_type: 'RESPONSE'
      },
      {
        headers: { Authorization: `Bearer ${account.accessToken}` }
      }
    );
    
    // Store sent message
    instagramMessages.push({
      id: uuidv4(),
      accountId: account.id,
      fromId: account.instagramUserId,
      fromName: account.instagramUsername,
      message,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'text'
    });
    
    res.json({ success: true, messageId: response.data.message_id });
  } catch (error) {
    console.error('Send DM error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Disconnect Instagram
router.delete('/instagram/disconnect', (req, res) => {
  const userId = req.query.userId as string;
  const index = instagramAccounts.findIndex(a => a.userId === userId);
  
  if (index !== -1) {
    instagramAccounts.splice(index, 1);
  }
  
  res.json({ success: true });
});

export default router;