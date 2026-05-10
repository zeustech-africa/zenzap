import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import axios from 'axios';
import { webhookEndpoints, webhookDeliveries, WebhookEndpoint } from '../models/Webhook';

const router = express.Router();

// Generate webhook URL for external apps (Zapier-style)
router.post('/webhooks/create', (req, res) => {
  const { userId, name, event, targetUrl } = req.body;
  
  // Generate unique secret for webhook
  const secret = crypto.randomBytes(32).toString('hex');
  
  const newEndpoint: WebhookEndpoint = {
    id: uuidv4(),
    userId,
    name,
    event,
    url: targetUrl,
    isActive: true,
    secret,
    createdAt: new Date().toISOString(),
    triggerCount: 0
  };
  
  webhookEndpoints.push(newEndpoint);
  
  // Generate Zapier-compatible webhook URL
  const webhookUrl = `${process.env.APP_URL}/api/webhooks/trigger/${newEndpoint.id}`;
  
  res.json({
    id: newEndpoint.id,
    webhookUrl,
    secret,
    name,
    event,
    instructions: `Copy this URL to Zapier: ${webhookUrl}`
  });
});

// Trigger endpoint (called by Zapier or external apps)
router.post('/webhooks/trigger/:endpointId', async (req, res) => {
  const { endpointId } = req.params;
  const payload = req.body;
  
  const endpoint = webhookEndpoints.find(e => e.id === endpointId);
  if (!endpoint || !endpoint.isActive) {
    return res.status(404).json({ error: 'Webhook endpoint not found or inactive' });
  }
  
  // Record delivery attempt
  const delivery: any = {
    id: uuidv4(),
    endpointId,
    payload,
    status: 'pending',
    attemptedAt: new Date().toISOString()
  };
  webhookDeliveries.push(delivery);
  
  try {
    // Forward payload to target URL
    const response = await axios.post(endpoint.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': endpoint.secret
      },
      timeout: 10000
    });
    
    delivery.status = 'success';
    delivery.responseCode = response.status;
    delivery.completedAt = new Date().toISOString();
    
    endpoint.lastTriggeredAt = new Date().toISOString();
    endpoint.triggerCount++;
    
    res.json({ success: true, message: 'Webhook delivered' });
  } catch (error: any) {
    delivery.status = 'failed';
    delivery.errorMessage = error.message;
    delivery.completedAt = new Date().toISOString();
    
    res.status(500).json({ error: 'Webhook delivery failed', message: error.message });
  }
});

// Get all webhook endpoints for user
router.get('/webhooks', (req, res) => {
  const userId = req.query.userId as string;
  const endpoints = webhookEndpoints.filter(e => e.userId === userId);
  res.json(endpoints);
});

// Get webhook delivery logs
router.get('/webhooks/deliveries/:endpointId', (req, res) => {
  const deliveries = webhookDeliveries.filter(d => d.endpointId === req.params.endpointId);
  res.json(deliveries);
});

// Test webhook endpoint (send test payload)
router.post('/webhooks/test/:endpointId', async (req, res) => {
  const { endpointId } = req.params;
  const endpoint = webhookEndpoints.find(e => e.id === endpointId);
  
  if (!endpoint) {
    return res.status(404).json({ error: 'Webhook endpoint not found' });
  }
  
  const testPayload = {
    test: true,
    message: 'This is a test webhook from ZENZAP',
    timestamp: new Date().toISOString(),
    endpoint: endpoint.name
  };
  
  try {
    const response = await axios.post(endpoint.url, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': endpoint.secret
      },
      timeout: 10000
    });
    
    res.json({ success: true, responseCode: response.status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete webhook endpoint
router.delete('/webhooks/:id', (req, res) => {
  const index = webhookEndpoints.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Webhook endpoint not found' });
  }
  
  webhookEndpoints.splice(index, 1);
  res.json({ success: true });
});

// Outgoing webhook: Trigger event to all matching endpoints
export async function triggerWebhook(event: string, data: any) {
  const matchingEndpoints = webhookEndpoints.filter(e => e.event === event && e.isActive);
  
  const results = [];
  for (const endpoint of matchingEndpoints) {
    try {
      const response = await axios.post(endpoint.url, {
        event,
        data,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': endpoint.secret
        },
        timeout: 10000
      });
      
      endpoint.lastTriggeredAt = new Date().toISOString();
      endpoint.triggerCount++;
      
      results.push({ endpoint: endpoint.name, success: true });
    } catch (error: any) {
      results.push({ endpoint: endpoint.name, success: false, error: error.message });
    }
  }
  
  return results;
}

export default router;