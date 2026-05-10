import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { crmConnections, crmContacts, CRMConnection, CRMContact } from '../models/CRM';

const router = express.Router();

// ============ HUBSPOT INTEGRATION ============

// Get HubSpot auth URL
router.get('/crm/hubspot/auth-url', (req, res) => {
  const userId = req.query.userId as string;
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/crm/hubspot/callback`;
  const scope = 'crm.objects.contacts.read crm.objects.contacts.write';
  
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}`;
  
  res.json({ authUrl });
});

// HubSpot OAuth callback
router.get('/crm/hubspot/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = state as string;
  
  try {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/crm/hubspot/callback`;
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      }
    });
    
    const { access_token, refresh_token } = tokenResponse.data;
    
    // Get portal info
    const portalResponse = await axios.get('https://api.hubapi.com/account-info/v3/details', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    // Save connection
    const existingConnection = crmConnections.find(c => c.userId === userId && c.provider === 'hubspot');
    
    if (existingConnection) {
      existingConnection.accessToken = access_token;
      existingConnection.refreshToken = refresh_token;
      existingConnection.isConnected = true;
      existingConnection.updatedAt = new Date().toISOString();
    } else {
      const newConnection: CRMConnection = {
        id: uuidv4(),
        userId,
        provider: 'hubspot',
        accessToken: access_token,
        refreshToken: refresh_token,
        portalId: portalResponse.data.portalId,
        isConnected: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      crmConnections.push(newConnection);
    }
    
    res.redirect(`${process.env.APP_URL}/dashboard/crm?connected=true&provider=hubspot`);
  } catch (error) {
    console.error('HubSpot OAuth error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard/crm?error=connection_failed`);
  }
});

// ============ SALESFORCE INTEGRATION ============

// Get Salesforce auth URL
router.get('/crm/salesforce/auth-url', (req, res) => {
  const userId = req.query.userId as string;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/crm/salesforce/callback`;
  const scope = 'id api refresh_token';
  
  const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}`;
  
  res.json({ authUrl });
});

// Salesforce OAuth callback
router.get('/crm/salesforce/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = state as string;
  
  try {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/crm/salesforce/callback`;
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://login.salesforce.com/services/oauth2/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      }
    });
    
    const { access_token, refresh_token, instance_url } = tokenResponse.data;
    
    // Save connection
    const existingConnection = crmConnections.find(c => c.userId === userId && c.provider === 'salesforce');
    
    if (existingConnection) {
      existingConnection.accessToken = access_token;
      existingConnection.refreshToken = refresh_token;
      existingConnection.instanceUrl = instance_url;
      existingConnection.isConnected = true;
      existingConnection.updatedAt = new Date().toISOString();
    } else {
      const newConnection: CRMConnection = {
        id: uuidv4(),
        userId,
        provider: 'salesforce',
        accessToken: access_token,
        refreshToken: refresh_token,
        instanceUrl: instance_url,
        isConnected: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      crmConnections.push(newConnection);
    }
    
    res.redirect(`${process.env.APP_URL}/dashboard/crm?connected=true&provider=salesforce`);
  } catch (error) {
    console.error('Salesforce OAuth error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard/crm?error=connection_failed`);
  }
});

// ============ COMMON CRM ENDPOINTS ============

// Get CRM connections status
router.get('/crm/connections', (req, res) => {
  const userId = req.query.userId as string;
  const connections = crmConnections.filter(c => c.userId === userId);
  res.json(connections);
});

// Disconnect CRM
router.delete('/crm/disconnect/:provider', (req, res) => {
  const { provider } = req.params;
  const userId = req.query.userId as string;
  
  const index = crmConnections.findIndex(c => c.userId === userId && c.provider === provider);
  if (index !== -1) {
    crmConnections.splice(index, 1);
  }
  
  res.json({ success: true });
});

// Sync contact to CRM (called when new customer messages)
router.post('/crm/sync-contact', async (req, res) => {
  const { userId, firstName, lastName, email, phone, company } = req.body;
  
  const connections = crmConnections.filter(c => c.userId === userId && c.isConnected);
  
  const results = [];
  
  for (const connection of connections) {
    if (connection.provider === 'hubspot') {
      try {
        const response = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', {
          properties: {
            firstname: firstName,
            lastname: lastName,
            email,
            phone,
            company
          }
        }, {
          headers: { 'Authorization': `Bearer ${connection.accessToken}` }
        });
        
        results.push({ provider: 'hubspot', success: true, id: response.data.id });
      } catch (error: any) {
        results.push({ provider: 'hubspot', success: false, error: error.message });
      }
    } else if (connection.provider === 'salesforce') {
      try {
        const response = await axios.post(`${connection.instanceUrl}/services/data/v58.0/sobjects/Contact`, {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          Phone: phone,
          AccountId: company
        }, {
          headers: { 'Authorization': `Bearer ${connection.accessToken}` }
        });
        
        results.push({ provider: 'salesforce', success: true, id: response.data.id });
      } catch (error: any) {
        results.push({ provider: 'salesforce', success: false, error: error.message });
      }
    }
  }
  
  res.json({ synced: results });
});

export default router;