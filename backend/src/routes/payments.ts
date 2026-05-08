import express from 'express';
import { payfastService } from '../services/payfast';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Store subscriptions (in-memory, replace with database)
export const subscriptions: any[] = [];
export const paymentTransactions: any[] = [];

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json(payfastService.getSubscriptionPlans());
});

// Initiate subscription payment
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

// PayFast ITN (Instant Transaction Notification) webhook
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

export default router;