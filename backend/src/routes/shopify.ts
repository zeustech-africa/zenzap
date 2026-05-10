import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { shopifyStores, shopifyOrders, ShopifyStore, ShopifyOrder } from '../models/Shopify';

const router = express.Router();

// Get Shopify auth URL (copies SleekFlow's OAuth flow)
router.get('/shopify/auth-url', (req, res) => {
  const userId = req.query.userId as string;
  const shopDomain = req.query.shop as string;
  
  if (!shopDomain) {
    return res.status(400).json({ error: 'Shop domain is required' });
  }
  
  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = 'read_products,write_products,read_orders,write_orders,read_customers';
  const redirectUri = `${process.env.APP_URL}/api/shopify/callback`;
  const state = userId;
  
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  
  res.json({ authUrl });
});

// Shopify OAuth callback
router.get('/shopify/callback', async (req, res) => {
  const { code, shop, state } = req.query;
  const userId = state as string;
  
  if (!code || !shop) {
    return res.redirect(`${process.env.APP_URL}/dashboard/shopify?error=missing_params`);
  }
  
  try {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    
    // Exchange code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: apiKey,
      client_secret: apiSecret,
      code
    });
    
    const { access_token, scope } = tokenResponse.data;
    
    // Get shop info
    const shopResponse = await axios.get(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token }
    });
    
    const storeName = shopResponse.data.shop.name;
    
    // Save store connection
    const existingStore = shopifyStores.find(s => s.userId === userId);
    
    if (existingStore) {
      existingStore.storeName = storeName;
      existingStore.storeUrl = shop as string;
      existingStore.accessToken = access_token;
      existingStore.scope = scope;
      existingStore.isConnected = true;
      existingStore.updatedAt = new Date().toISOString();
      existingStore.lastSyncAt = new Date().toISOString();
    } else {
      const newStore: ShopifyStore = {
        id: uuidv4(),
        userId,
        storeName,
        storeUrl: shop as string,
        accessToken: access_token,
        scope,
        isConnected: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString()
      };
      shopifyStores.push(newStore);
    }
    
    // Trigger initial product sync
    await syncProducts(userId, shop as string, access_token);
    
    res.redirect(`${process.env.APP_URL}/dashboard/shopify?connected=true`);
  } catch (error) {
    console.error('Shopify OAuth error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard/shopify?error=connection_failed`);
  }
});

// Sync products from Shopify to ZENZAP catalog
async function syncProducts(userId: string, shopDomain: string, accessToken: string) {
  try {
    const response = await axios.get(`https://${shopDomain}/admin/api/2024-01/products.json?limit=50`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    
    const products = response.data.products;
    
    // Import to catalog (reuse existing product API)
    for (const product of products) {
      const variant = product.variants[0];
      await axios.post(`${process.env.APP_URL}/api/catalog/products`, {
        userId,
        name: product.title,
        description: product.body_html?.replace(/<[^>]*>/g, '') || '',
        price: variant?.price || 0,
        currency: 'ZAR',
        imageUrl: product.image?.src,
        category: product.product_type || 'General',
        stock: variant?.inventory_quantity || 0
      }).catch(e => console.error('Product sync error:', (e as Error).message));
    }
    
    console.log(`Synced ${products.length} products for user ${userId}`);
  } catch (error) {
    console.error('Product sync error:', error);
  }
}

// Get Shopify connection status
router.get('/shopify/status', (req, res) => {
  const userId = req.query.userId as string;
  const store = shopifyStores.find(s => s.userId === userId);
  res.json({ connected: !!store, store: store || null });
});

// Disconnect Shopify
router.delete('/shopify/disconnect', (req, res) => {
  const userId = req.query.userId as string;
  const index = shopifyStores.findIndex(s => s.userId === userId);
  
  if (index !== -1) {
    shopifyStores.splice(index, 1);
  }
  
  res.json({ success: true });
});

// Webhook for new orders (copies SleekFlow's order tracking)
router.post('/shopify/webhook/orders/create', (req, res) => {
  const { id, order_number, customer, total_price, currency, line_items } = req.body;
  const hmac = req.headers['x-shopify-hmac-sha256'] as string;
  
  // Verify webhook signature
  const secret = process.env.SHOPIFY_API_SECRET;
  const generatedHash = crypto.createHmac('sha256', secret!)
    .update(JSON.stringify(req.body))
    .digest('base64');
  
  if (generatedHash !== hmac) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  
  // Find which store this belongs to (simplified)
  const storeUrl = req.headers['x-shopify-shop-domain'];
  const store = shopifyStores.find(s => s.storeUrl === storeUrl);
  
  if (store) {
    const order: ShopifyOrder = {
      id: uuidv4(),
      userId: store.userId,
      orderId: id,
      orderNumber: order_number,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
      totalPrice: parseFloat(total_price),
      currency,
      status: 'new',
      items: line_items.map((item: any) => ({
        productId: item.product_id,
        productName: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      createdAt: new Date().toISOString(),
      syncedToWhatsApp: false
    };
    shopifyOrders.push(order);
  }
  
  res.sendStatus(200);
});

// Get Shopify orders
router.get('/shopify/orders', (req, res) => {
  const userId = req.query.userId as string;
  const orders = shopifyOrders.filter(o => o.userId === userId);
  res.json(orders);
});

export default router;