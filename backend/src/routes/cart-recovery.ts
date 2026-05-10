import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { abandonedCarts, discountCodes, AbandonedCart, CartItem } from '../models/Cart';

const router = express.Router();

// Track abandoned cart (called when customer leaves checkout)
router.post('/cart/track', (req, res) => {
  const { userId, customerName, customerPhone, customerEmail, items, totalAmount } = req.body;

  // Check if existing cart for this customer
  const existingCart = abandonedCarts.find(c =>
    c.customerPhone === customerPhone && c.status !== 'recovered'
  );

  if (existingCart) {
    // Update existing cart
    existingCart.items = items;
    existingCart.totalAmount = totalAmount;
    existingCart.updatedAt = new Date().toISOString();
    return res.json({ cartId: existingCart.id, message: 'Cart updated' });
  }

  // Create new abandoned cart
  const newCart: AbandonedCart = {
    id: uuidv4(),
    userId,
    customerName,
    customerPhone,
    customerEmail,
    items,
    totalAmount,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  abandonedCarts.push(newCart);

  // Schedule reminders (in production, use a job queue)
  scheduleReminders(newCart.id);

  res.status(201).json({ cartId: newCart.id, message: 'Cart tracked for recovery' });
});

// Schedule reminder timers (simplified - copies SleekFlow's timing)
function scheduleReminders(cartId: string) {
  const intervals = [1, 6, 24]; // hours: 1 hour, 6 hours, 24 hours

  intervals.forEach((hours, index) => {
    setTimeout(async () => {
      const cart = abandonedCarts.find(c => c.id === cartId);
      if (cart && cart.status !== 'recovered' && cart.status !== 'lost') {
        await sendRecoveryReminder(cartId, index + 1);
      }
    }, hours * 60 * 60 * 1000);
  });
}

// Send recovery reminder via WhatsApp
async function sendRecoveryReminder(cartId: string, reminderNumber: number) {
  const cart = abandonedCarts.find(c => c.id === cartId);
  if (!cart) return;

  // Generate discount code (20% off for reminder 2 and 3)
  let discountCode = '';
  let discountPercent = 0;

  if (reminderNumber === 2) {
    discountPercent = 10;
    discountCode = generateDiscountCode(cart.customerPhone, discountPercent);
  } else if (reminderNumber === 3) {
    discountPercent = 15;
    discountCode = generateDiscountCode(cart.customerPhone, discountPercent);
  }

  // Prepare message
  let message = `🛒 Hey ${cart.customerName}, you left items in your cart!\n\n`;
  message += `Items: ${cart.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}\n`;
  message += `Total: R${cart.totalAmount.toFixed(2)}\n\n`;
  message += `Complete your purchase here: ${process.env.APP_URL}/checkout?cart=${cartId}\n\n`;

  if (discountCode) {
    message += `🎉 Use code: ${discountCode} for ${discountPercent}% OFF!\n`;
  }

  // Send via WhatsApp API
  // (Implementation would call WhatsApp API)
  console.log(`📨 Sending recovery reminder to ${cart.customerPhone}: ${message}`);

  // Update cart status
  cart.status = `reminder_sent_${reminderNumber}` as any;
  cart.reminderSentAt = [...(cart.reminderSentAt || []), new Date().toISOString()];
  if (discountCode) {
    cart.discountCode = discountCode;
    cart.discountAmount = discountPercent;
  }
  cart.updatedAt = new Date().toISOString();
}

// Generate unique discount code
function generateDiscountCode(phone: string, percent: number): string {
  const shortPhone = phone.slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `SAVE${percent}${shortPhone}${random}`;

  discountCodes.push({
    id: uuidv4(),
    code,
    discountPercent: percent,
    isUsed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  });

  return code;
}

// Mark cart as recovered
router.post('/cart/recovered/:cartId', (req, res) => {
  const cart = abandonedCarts.find(c => c.id === req.params.cartId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  cart.status = 'recovered';
  cart.recoveredAt = new Date().toISOString();
  cart.updatedAt = new Date().toISOString();

  res.json({ success: true });
});

// Get abandoned carts for user
router.get('/cart/abandoned', (req, res) => {
  const userId = req.query.userId as string;
  const carts = abandonedCarts.filter(c => c.userId === userId);
  res.json(carts);
});

// Get recovery stats
router.get('/cart/stats', (req, res) => {
  const userId = req.query.userId as string;
  const carts = abandonedCarts.filter(c => c.userId === userId);

  const total = carts.length;
  const recovered = carts.filter(c => c.status === 'recovered').length;
  const lost = carts.filter(c => c.status === 'lost').length;
  const pending = total - recovered - lost;

  const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;

  res.json({
    total,
    recovered,
    lost,
    pending,
    recoveryRate: recoveryRate.toFixed(1),
    potentialRevenue: carts.reduce((sum, c) => sum + c.totalAmount, 0)
  });
});

export default router;