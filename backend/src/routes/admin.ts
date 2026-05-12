import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users, pendingUsers } from './auth';
import { AdminRole, hasPermission } from '../models/Roles';

interface AdminBroadcast {
  id: string;
  subject: string;
  message: string;
  recipients: string;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
  name?: string;
  sentCount?: number;
  deliveredCount?: number;
  failedCount?: number;
}

interface AdminSettings {
  systemName: string;
  adminEmail: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

interface AdminUserWithName {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  password: string;
  createdAt: string;
}

interface AgentActivity {
  userId: string;
  agentName: string;
  messagesSent: number;
  messagesReceived: number;
  avgResponseTime: number;
  conversations: number;
  lastActive: string;
}

interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

const adminBroadcasts: AdminBroadcast[] = [];
let agentActivities: AgentActivity[] = [];
let auditLogs: AuditLogEntry[] = [];
let adminUsersWithRoles: AdminUserWithName[] = [];

let adminSettings: AdminSettings = {
  systemName: 'ZENZAP',
  adminEmail: 'admin@zenzap.com',
  maintenanceMode: false,
  emailNotifications: true,
  updatedAt: new Date().toISOString()
};

// Store admin password hash (in production, use environment variable or database)
let adminPasswordHash: string | null = null;

// Default admin user - in production, this should be in database
let adminUser: AdminUser | null = null;

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

// ===== ROLE-BASED ACCESS CONTROL MIDDLEWARE =====

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: AdminRole;
      };
    }
  }
}

// Middleware to check admin permissions
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const adminRole = (req as any).adminUser?.role;
    if (!adminRole) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (hasPermission(adminRole, permission) || adminRole === 'super_admin') {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}

// ===== ADMIN USER MANAGEMENT (Role-Based) =====

router.get('/admin-users', requirePermission('manage_admins'), (req, res) => {
  res.json(adminUsersWithRoles.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  })));
});

router.post('/admin-users', requirePermission('manage_admins'), async (req, res) => {
  const { email, name, role, password } = req.body;
  if (!email || !name || !role || !password) {
    return res.status(400).json({ error: 'Email, name, role, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin: AdminUserWithName = {
    id: uuidv4(),
    email,
    name,
    role: role as AdminRole,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  adminUsersWithRoles.push(newAdmin);

  // Log the action
  logAdminAction(
    (req as any).adminUser?.id || 'system',
    (req as any).adminUser?.email || 'system',
    'create_admin',
    `Created admin user ${email} with role ${role}`,
    req.ip || ''
  );

  res.json({ id: newAdmin.id, email, name, role });
});

router.delete('/admin-users/:id', requirePermission('manage_admins'), (req, res) => {
  const index = adminUsersWithRoles.findIndex((u) => u.id === req.params.id);
  if (index !== -1) {
    const removed = adminUsersWithRoles.splice(index, 1)[0];
    logAdminAction(
      (req as any).adminUser?.id || 'system',
      (req as any).adminUser?.email || 'system',
      'delete_admin',
      `Deleted admin user ${removed.email}`,
      req.ip || ''
    );
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// ===== AGENT PERFORMANCE METRICS =====

export function updateAgentActivity(userId: string, agentName: string, messageSent: boolean, responseTime?: number) {
  let activity = agentActivities.find(a => a.userId === userId);
  if (!activity) {
    activity = {
      userId,
      agentName,
      messagesSent: 0,
      messagesReceived: 0,
      avgResponseTime: 0,
      conversations: 0,
      lastActive: new Date().toISOString()
    };
    agentActivities.push(activity);
  }

  if (messageSent) {
    activity.messagesSent++;
  } else {
    activity.messagesReceived++;
  }

  if (responseTime) {
    const total = activity.avgResponseTime * (activity.conversations || 1);
    activity.conversations++;
    activity.avgResponseTime = (total + responseTime) / activity.conversations;
  }

  activity.lastActive = new Date().toISOString();
}

router.get('/agent-metrics', requirePermission('view_agents'), (req, res) => {
  res.json(agentActivities);
});

// ===== AUDIT LOGS =====

export function logAdminAction(adminId: string, adminEmail: string, action: string, details: string, ipAddress: string) {
  auditLogs.push({
    id: uuidv4(),
    adminId,
    adminEmail,
    action,
    details,
    ipAddress,
    timestamp: new Date().toISOString()
  });

  // Keep only last 1000 logs
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }
}

router.get('/audit-logs', requirePermission('view_audit_logs'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(auditLogs.slice(-limit));
});

// ===== STANDARD ROUTES =====

router.get('/users', requirePermission('view_users'), (req, res) => {
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

router.get('/users/:id', requirePermission('view_users'), (req, res) => {
  const { id } = req.params;
  const user = [...users, ...pendingUsers].find(u => u.id === id);
  if (user) {
    res.json(safeUser(user));
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/pending-users', requirePermission('view_users'), (_req, res) => {
  res.json(pendingUsers.map(safeUser));
});

router.get('/stats', requirePermission('view_analytics'), (_req, res) => {
  res.json({
    totalUsers: users.length + pendingUsers.length,
    pendingApprovals: pendingUsers.length,
    activeUsers: users.filter(u => u.status === 'active' || u.status === 'approved').length,
    freeUsers: users.filter(u => u.subscription === 'free').length,
    paidUsers: users.filter(u => u.subscription !== 'free').length,
    starterUsers: users.filter(u => u.subscription === 'starter').length,
    proUsers: users.filter(u => u.subscription === 'pro').length,
    businessUsers: users.filter(u => u.subscription === 'business').length,
    monthlyRevenue: users.filter(u => u.subscription !== 'free').reduce((sum, u) => {
      const prices: Record<string, number> = { starter: 299, pro: 599, business: 999 };
      return sum + (prices[u.subscription as string] || 0);
    }, 0)
  });
});

router.get('/health', requirePermission('*'), (_req, res) => {
  res.json({
    api: 'healthy',
    database: 'healthy',
    whatsapp: 'healthy',
    stripe: 'configured',
    lastCheck: new Date().toISOString()
  });
});

router.get('/alerts', requirePermission('*'), (_req, res) => {
  res.json([
    { id: '1', type: 'info', message: 'System running normally', timestamp: new Date().toISOString(), resolved: true }
  ]);
});

router.post('/approve/:userId', requirePermission('manage_users'), (req, res) => {
  const idx = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (idx !== -1) {
    const user = pendingUsers.splice(idx, 1)[0];
    user.status = 'approved';
    users.push(user);

    // Audit log
    const adminId = (req as any).adminUser?.id;
    const adminEmail = (req as any).adminUser?.email;
    logAdminAction(adminId || 'system', adminEmail || 'system', 'approve_user', `Approved user ${req.params.userId}`, req.ip || '');

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/reject/:userId', requirePermission('manage_users'), (req, res) => {
  const idx = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (idx !== -1) {
    const user = pendingUsers.splice(idx, 1)[0];
    user.status = 'rejected';
    users.push(user);

    // Audit log
    const adminId = (req as any).adminUser?.id;
    const adminEmail = (req as any).adminUser?.email;
    logAdminAction(adminId || 'system', adminEmail || 'system', 'reject_user', `Rejected user ${req.params.userId}`, req.ip || '');

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/suspend/:userId', requirePermission('manage_users'), (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (user) {
    user.status = 'suspended';

    // Audit log
    const adminId = (req as any).adminUser?.id;
    const adminEmail = (req as any).adminUser?.email;
    logAdminAction(adminId || 'system', adminEmail || 'system', 'suspend_user', `Suspended user ${req.params.userId}`, req.ip || '');

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/update-subscription/:userId', requirePermission('manage_users'), (req, res) => {
  const { plan } = req.body;
  const user = users.find(u => u.id === req.params.userId);
  if (user) {
    user.subscription = plan;

    // Audit log
    const adminId = (req as any).adminUser?.id;
    const adminEmail = (req as any).adminUser?.email;
    logAdminAction(adminId || 'system', adminEmail || 'system', 'update_subscription', `Changed ${req.params.userId} plan to ${plan}`, req.ip || '');

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/mrr-details', requirePermission('view_analytics'), (_req, res) => {
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

// ===== EXPORT REPORTS (CSV) =====

router.get('/export/users', requirePermission('export_reports'), (req, res) => {
  const allUsers = [...users, ...pendingUsers];

  const headers = ['ID', 'Business Name', 'Owner Name', 'Email', 'Phone', 'Status', 'Subscription', 'Registered At'];
  const rows = allUsers.map(u => [
    u.id, u.businessName, u.ownerName, u.email, u.phone, u.status, u.subscription, u.registeredAt
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
  res.send(csv);
});

router.get('/export/broadcasts', requirePermission('export_reports'), (req, res) => {
  const headers = ['ID', 'Name', 'Subject', 'Recipients', 'Status', 'Sent At', 'Sent Count', 'Delivered Count', 'Failed Count'];
  const rows = adminBroadcasts.map(b => [
    b.id, b.name || '', b.subject || '', b.recipients, b.status, b.sentAt, b.sentCount || 0, b.deliveredCount || 0, b.failedCount || 0
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=broadcasts-export.csv');
  res.send(csv);
});

// ===== BROADCASTS =====

// Get all broadcasts (history)
router.get('/broadcasts', requirePermission('view_broadcasts'), (_req, res) => {
  res.json(adminBroadcasts.sort((a, b) => 
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  ));
});

// Send email broadcast
router.post('/broadcast', requirePermission('send_broadcasts'), async (req, res) => {
  const { subject, message, recipients } = req.body;
  
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }
  
  // Determine recipient list based on filter
  let targetUsers: any[] = [];
  const allUsers = [...users, ...pendingUsers].filter(u => u.status === 'approved');
  
  switch(recipients) {
    case 'active':
      targetUsers = allUsers.filter(u => u.status === 'approved');
      break;
    case 'free':
      targetUsers = allUsers.filter(u => u.subscription === 'free');
      break;
    case 'paid':
      targetUsers = allUsers.filter(u => u.subscription !== 'free');
      break;
    default:
      targetUsers = allUsers;
  }
  
  // Create broadcast record
  const broadcast: AdminBroadcast = {
    id: uuidv4(),
    subject,
    message,
    recipients,
    recipientCount: targetUsers.length,
    status: 'pending',
    sentAt: new Date().toISOString(),
  };
  
  adminBroadcasts.push(broadcast);

  // Audit log
  const adminId = (req as any).adminUser?.id;
  const adminEmail = (req as any).adminUser?.email;
  logAdminAction(adminId || 'system', adminEmail || 'system', 'send_broadcast', `Sent broadcast "${subject}" to ${targetUsers.length} users`, req.ip || '');
  
  // NOTE: Email sending requires SMTP configuration
  // For now, simulate sending and update status
  setTimeout(() => {
    const idx = adminBroadcasts.findIndex(b => b.id === broadcast.id);
    if (idx !== -1) {
      adminBroadcasts[idx].status = 'sent';
    }
  }, 2000);
  
  res.json({ 
    success: true, 
    message: `Broadcast queued for ${targetUsers.length} users`,
    broadcastId: broadcast.id,
    note: 'Email sending requires SMTP configuration. This is a simulation.'
  });
});

// ===== SETTINGS =====

// Get current admin settings
router.get('/settings', requirePermission('view_settings'), (_req, res) => {
  res.json(adminSettings);
});

// Update admin settings
router.post('/settings', requirePermission('edit_settings'), (req, res) => {
  const { systemName, adminEmail, maintenanceMode, emailNotifications } = req.body;
  
  if (systemName !== undefined) adminSettings.systemName = systemName;
  if (adminEmail !== undefined) adminSettings.adminEmail = adminEmail;
  if (maintenanceMode !== undefined) adminSettings.maintenanceMode = maintenanceMode;
  if (emailNotifications !== undefined) adminSettings.emailNotifications = emailNotifications;
  
  adminSettings.updatedAt = new Date().toISOString();

  // Audit log
  const adminId = (req as any).adminUser?.id;
  const adminEmailAddr = (req as any).adminUser?.email;
  logAdminAction(adminId || 'system', adminEmailAddr || 'system', 'update_settings', 'Updated system settings', req.ip || '');
  
  res.json({ success: true, settings: adminSettings });
});

// ===== AUTH =====

// Change admin password
router.post('/change-password', requirePermission('*'), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  
  // Get admin user from auth (assuming admin is stored in users array with role='admin')
  const adminUserFromAuth = users.find(u => u.role === 'admin' || u.email === 'admin@zenzap.com');
  
  if (!adminUserFromAuth) {
    // First time setup - allow setting initial password
    adminPasswordHash = await bcrypt.hash(newPassword, 10);
    return res.json({ success: true, message: 'Admin password set successfully' });
  }
  
  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, adminUserFromAuth.password);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  // Update password
  adminUserFromAuth.password = await bcrypt.hash(newPassword, 10);
  
  res.json({ success: true, message: 'Password changed successfully' });
});

// Setup admin user (first time only)
router.post('/setup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  if (adminUser) {
    return res.status(400).json({ error: 'Admin already set up' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  adminUser = {
    id: 'admin-1',
    email: email,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  
  res.json({ success: true, message: 'Admin account created successfully' });
});

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Check if admin exists
  if (!adminUser) {
    return res.status(401).json({ error: 'Admin not set up. Please run setup first.' });
  }
  
  // Verify email
  if (adminUser.email !== email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, adminUser.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET || 'zenzap-admin-secret-key',
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    token,
    admin: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    }
  });
});

// Verify admin token (for protected routes)
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zenzap-admin-secret-key');
    res.json({ valid: true, admin: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Check maintenance mode status (used by frontend to block user access)
router.get('/maintenance-status', (_req, res) => {
  res.json({ maintenanceMode: adminSettings.maintenanceMode });
});

export default router;