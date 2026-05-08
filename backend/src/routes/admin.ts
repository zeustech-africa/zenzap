import express from 'express';
import { users, pendingUsers } from './auth';

const router = express.Router();

// Helper to strip sensitive fields
const safeUser = (user: any) => ({
  id: user.id,
  businessName: user.businessName,
  ownerName: user.ownerName,
  email: user.email,
  phone: user.phone,
  status: user.status,
  subscription: user.subscription,
  registeredAt: user.registeredAt,
  idDocumentUrl: user.idDocumentUrl || null,
  facePhotoUrl: user.facePhotoUrl || null,
});

router.get('/users', (req, res) => {
  const { filter } = req.query;
  const allUsers = [...users, ...pendingUsers];
  let filteredUsers = allUsers;

  switch(filter) {
    case 'pending':
      filteredUsers = pendingUsers;
      break;
    case 'active':
      filteredUsers = users.filter(u => u.status === 'approved');
      break;
    case 'free':
      filteredUsers = users.filter(u => u.subscription === 'free');
      break;
    case 'paid':
      filteredUsers = users.filter(u => u.subscription !== 'free');
      break;
    default:
      break;
  }

  res.json(filteredUsers.map(u => ({
    id: u.id,
    businessName: u.businessName,
    ownerName: u.ownerName,
    email: u.email,
    phone: u.phone,
    status: u.status,
    subscription: u.subscription || 'free'
  })));
});

router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = [...users, ...pendingUsers].find(u => u.id === id);
  if (user) {
    res.json(safeUser(user));
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/pending-users', (_req, res) => {
  res.json(pendingUsers.map(safeUser));
});

router.get('/stats', (_req, res) => {
  res.json({
    totalUsers: users.length + pendingUsers.length,
    pendingApprovals: pendingUsers.length,
    activeUsers: users.filter(u => u.status === 'active' || u.status === 'approved').length,
    freeUsers: users.filter(u => u.subscription === 'free').length,
    paidUsers: users.filter(u => u.subscription !== 'free').length,
    monthlyRevenue: users.filter(u => u.subscription !== 'free').reduce((sum, u) => {
      const prices: Record<string, number> = { starter: 299, pro: 599, business: 999 };
      return sum + (prices[u.subscription as string] || 0);
    }, 0)
  });
});

router.get('/health', (_req, res) => {
  res.json({
    api: 'healthy',
    database: 'healthy',
    whatsapp: 'healthy',
    stripe: 'configured',
    lastCheck: new Date().toISOString()
  });
});

router.get('/alerts', (_req, res) => {
  res.json([
    { id: '1', type: 'info', message: 'System running normally', timestamp: new Date().toISOString(), resolved: true }
  ]);
});

router.post('/approve/:userId', (req, res) => {
  const idx = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (idx !== -1) {
    const user = pendingUsers.splice(idx, 1)[0];
    user.status = 'approved';
    users.push(user);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/reject/:userId', (req, res) => {
  const idx = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (idx !== -1) {
    const user = pendingUsers.splice(idx, 1)[0];
    user.status = 'rejected';
    users.push(user);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/suspend/:userId', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (user) {
    user.status = 'suspended';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/update-subscription/:userId', (req, res) => {
  const { plan } = req.body;
  const user = users.find(u => u.id === req.params.userId);
  if (user) {
    user.subscription = plan;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/mrr-details', (_req, res) => {
  const prices: Record<string, number> = { starter: 299, pro: 599, business: 999 };
  const breakdown = users
    .filter(u => u.subscription !== 'free')
    .map(u => ({
      id: u.id,
      businessName: u.businessName,
      ownerName: u.ownerName,
      email: u.email,
      plan: u.subscription,
      amount: prices[u.subscription as string] || 0
    }));
  const total = breakdown.reduce((sum, u) => sum + u.amount, 0);
  res.json({ total, breakdown });
});

export default router;
