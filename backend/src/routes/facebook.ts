import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { facebookPages, facebookConversations } from '../models/Facebook';

const router = express.Router();

// Get Facebook Pages connection URL
router.get('/facebook/auth-url', (req, res) => {
  const userId = req.query.userId as string;
  const appId = process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const redirectUri = `${process.env.APP_URL}/api/facebook/callback`;
  const scope = 'pages_manage_metadata,pages_read_engagement,pages_manage_messages';
  
  const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}`;
  
  res.json({ authUrl });
});

// OAuth Callback
router.get('/facebook/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = state as string;
  const appId = process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;
  const redirectUri = `${process.env.APP_URL}/api/facebook/callback`;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user's pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
      params: { access_token }
    });
    
    const pages = pagesResponse.data.data;
    
    for (const page of pages) {
      const existingPage = facebookPages.find(p => p.userId === userId && p.pageId === page.id);
      
      if (!existingPage) {
        facebookPages.push({
          id: uuidv4(),
          userId,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          isConnected: true,
          connectedAt: new Date().toISOString()
        });
      }
    }
    
    res.redirect(`${process.env.APP_URL}/dashboard/facebook?connected=true`);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard/facebook?error=connection_failed`);
  }
});

// Get connected Facebook pages
router.get('/facebook/pages', (req, res) => {
  const userId = req.query.userId as string;
  const pages = facebookPages.filter(p => p.userId === userId);
  res.json(pages);
});

// Send Facebook message
router.post('/facebook/send', async (req, res) => {
  const { userId, pageId, recipientId, message } = req.body;
  const page = facebookPages.find(p => p.userId === userId && p.pageId === pageId);
  
  if (!page) {
    return res.status(404).json({ error: 'Facebook page not connected' });
  }
  
  try {
    const response = await axios.post(`https://graph.facebook.com/v22.0/${page.pageId}/messages`, {
      recipient: { id: recipientId },
      message: { text: message },
      messaging_type: 'RESPONSE'
    }, {
      headers: { 'Authorization': `Bearer ${page.pageAccessToken}` }
    });
    
    res.json({ success: true, messageId: response.data.message_id });
  } catch (error) {
    console.error('Facebook send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Disconnect Facebook page
router.delete('/facebook/disconnect/:pageId', (req, res) => {
  const userId = req.query.userId as string;
  const index = facebookPages.findIndex(p => p.userId === userId && p.pageId === req.params.pageId);
  
  if (index !== -1) {
    facebookPages.splice(index, 1);
  }
  
  res.json({ success: true });
});

export default router;