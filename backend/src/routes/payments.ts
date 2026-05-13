import express from 'express';
import buildPayfastRouter from '@ngelekanyo/payfast-subscribe';
import { payfastService } from '../services/payfast';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { paymentLinks, paymentTransactions as paymentLinkTransactions, PaymentLink } from '../models/Payment';

const router = express.Router();

// Store subscriptions (in-memory, replace with database)
export const subscriptions: any[] = [];
export const paymentTransactions: any[] = [];

// ============================================================
// PAYFAST SUBSCRIPTION ROUTES (via @ngelekanyo/payfast-subscribe)
// ============================================================

// Callbacks for PayFast subscription events
const onPaymentUpdate = async (payload: any) => {
  const paymentStatus = payload.payment_status;
  const mPaymentId = payload.m_payment_id || '';
  const userId = mPaymentId.split('_')[0];
  const itemName = (payload.item_name || '').replace(' Plan - ZENZAP Subscription', '');

  if (paymentStatus === 'COMPLETE') {
    // Update user subscription in database
    const users = (global as any).users || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].subscription = itemName.toLowerCase();
      users[userIndex].subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    console.log(`✅ Payment completed for ${userId}: ${itemName} plan activated`);
  }
};

const onCancel = async (data: any) => {
  console.log(`🛑 Subscription cancelled:`, data);
};

const onPause = async (data: any) => {
  console.log(`⏸️ Subscription paused:`, data);
};

const onUnpause = async (data: any) => {
  console.log(`▶️ Subscription unpaused:`, data);
};

const onFetch = async (data: any) => {
  console.log(`📄 Subscription fetched:`, data);
};

// Mount PayFast subscription router at /payfast
const payfastRouter = buildPayfastRouter(onPaymentUpdate, onCancel, onPause, onUnpause, onFetch);
router.use('/payfast', payfastRouter);

// ============================================================
// EXISTING ROUTES (subscription plans, payment links, etc.)
// ============================================================

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json(payfastService.getSubscriptionPlans());
});

// Initiate subscription payment (legacy)
router.post('/subscribe/:plan', (req, res) => {
  const planKey = req.params.plan;
  const { businessId, email, name, returnUrl } = req.body;
  
  const plans = payfastService.getSubscriptionPlans();
  const plan = plans[planKey as keyof typeof plans];
  
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  
  const transactionId = uuidv4();
  
  const paymentRequest = payfastService.createPaymentRequest(
    {
      amount: plan.price,
      item_name: `ZENZAP ${plan.name}`,
      item_description: `${plan.messages} messages/month, ${plan.agents} agents`,
      custom_str1: businessId,
      custom_str2: planKey,
      email_address: email,
      name_first: name?.split(' ')[0],
      name_last: name?.split(' ')[1]
    },
    returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/subscription/success`,
    returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/subscription/cancel`
  );
  
  // Store pending transaction
  paymentTransactions.push({
    id: transactionId,
    businessId,
    plan: planKey,
    amount: plan.price,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  res.json({
    paymentUrl: paymentRequest.url,
    formData: paymentRequest.formData,
    transactionId
  });
});

// PayFast ITN (Instant Transaction Notification) webhook (legacy)
router.post('/payments/notify', (req, res) => {
  const pfData = req.body;
  
  // Verify payment
  const isValid = payfastService.verifyPayment(pfData);
  
  if (isValid && pfData.payment_status === 'COMPLETE') {
    const transaction = paymentTransactions.find(t => t.id === pfData.m_payment_id);
    
    if (transaction) {
      transaction.status = 'completed';
      transaction.pfPaymentId = pfData.pf_payment_id;
      transaction.completedAt = new Date().toISOString();
      
      // Create subscription record
      const subscription = {
        id: uuidv4(),
        businessId: transaction.businessId,
        plan: transaction.plan,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: transaction.amount,
        lastPaymentId: pfData.pf_payment_id
      };
      
      subscriptions.push(subscription);
      
      console.log(`✅ Subscription activated for business ${transaction.businessId}: ${transaction.plan}`);
    }
  }
  
  // Acknowledge receipt
  res.send('OK');
});

// Get business subscription status
router.get('/subscription/:businessId', (req, res) => {
  const { businessId } = req.params;
  const subscription = subscriptions.find(s => s.businessId === businessId && s.status === 'active');
  
  if (subscription) {
    res.json({
      status: 'active',
      plan: subscription.plan,
      endDate: subscription.endDate,
      daysRemaining: Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    });
  } else {
    res.json({ status: 'inactive' });
  }
});

// Get payment history
router.get('/history/:businessId', (req, res) => {
  const { businessId } = req.params;
  const history = paymentTransactions.filter(t => t.businessId === businessId);
  res.json(history);
});

// ============================================================
// PAYMENT LINK ROUTES (In-Chat Payment Links)
// ============================================================

// Generate payment link (copies SleekFlow's logic)
router.post('/payments/create-link', async (req, res) => {
  const { userId, customerName, customerEmail, customerPhone, amount, description } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }
  
  // Generate unique ID
  const paymentId = uuidv4();
  const expireHours = 48; // Links expire in 48 hours
  
  // Create PayFast payment URL (simplified)
  const payfastMerchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
  const payfastMerchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
  const isTest = process.env.PAYFAST_TEST_MODE !== 'false';
  
  const returnUrl = `${process.env.APP_URL}/dashboard/payments/success?payment_id=${paymentId}`;
  const cancelUrl = `${process.env.APP_URL}/dashboard/payments/cancel?payment_id=${paymentId}`;
  const notifyUrl = `${process.env.APP_URL}/api/payments/webhook`;
  
  // Generate signature
  const dataString = `merchant_id=${payfastMerchantId}&merchant_key=${payfastMerchantKey}&return_url=${returnUrl}&cancel_url=${cancelUrl}&notify_url=${notifyUrl}&amount=${amount}&item_name=${encodeURIComponent(description)}&m_payment_id=${paymentId}`;
  const signature = crypto.createHash('md5').update(dataString).digest('hex');
  
  const payfastUrl = isTest 
    ? `https://sandbox.payfast.co.za/eng/process?${dataString}&signature=${signature}`
    : `https://www.payfast.co.za/eng/process?${dataString}&signature=${signature}`;
  
  // Store payment link
  const newPaymentLink: PaymentLink = {
    id: paymentId,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    amount,
    currency: 'ZAR',
    description,
    status: 'pending',
    paymentUrl: payfastUrl,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expireHours * 60 * 60 * 1000).toISOString()
  };
  
  paymentLinks.push(newPaymentLink);
  
  // Generate short link for WhatsApp (simplified)
  const shortLink = `${process.env.APP_URL}/pay/${paymentId}`;
  
  res.json({
    paymentId,
    paymentUrl: payfastUrl,
    shortLink,
    amount,
    description,
    expiresAt: newPaymentLink.expiresAt,
    message: '🔗 Payment link created! Send this link to your customer via WhatsApp.'
  });
});

// Get payment links for user
router.get('/payments/links', (req, res) => {
  const userId = req.query.userId as string;
  const links = paymentLinks.filter(l => l.userId === userId);
  res.json(links);
});

// Get single payment link
router.get('/payments/links/:id', (req, res) => {
  const link = paymentLinks.find(l => l.id === req.params.id);
  if (!link) {
    return res.status(404).json({ error: 'Payment link not found' });
  }
  res.json(link);
});

// Update payment status (called from webhook)
router.post('/payments/webhook', (req, res) => {
  const pfData = req.body;
  const paymentId = pfData.m_payment_id;
  
  const link = paymentLinks.find(l => l.id === paymentId);
  if (link && pfData.payment_status === 'COMPLETE') {
    link.status = 'paid';
    link.paidAt = new Date().toISOString();
    
    // Store transaction
    paymentLinkTransactions.push({
      id: uuidv4(),
      paymentLinkId: paymentId,
      amount: link.amount,
      status: 'completed',
      payfastPaymentId: pfData.pf_payment_id,
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Payment completed for link ${paymentId}`);
  }
  
  res.send('OK');
});

// Cancel payment link
router.delete('/payments/links/:id', (req, res) => {
  const index = paymentLinks.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Payment link not found' });
  }
  
  paymentLinks.splice(index, 1);
  res.json({ success: true });
});

export default router;