import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhook';
import zapierWebhookRoutes from './routes/webhooks';
import messageRoutes from './routes/messages';
import templateRoutes from './routes/templates';
import bookingRoutes from './routes/booking';
import customerRoutes from './routes/customers';
import paymentRoutes from './routes/payments';
import leadRoutes from './routes/leads';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import supportRoutes from './routes/support';
import chatRoutes from './routes/chat';
import dashboardRoutes from './routes/dashboard';
import whatsappRoutes from './routes/whatsapp';
import coexistenceRoutes from './routes/coexistence';
import flowRoutes from './routes/flows';
import adsRoutes from './routes/ads';
import agentRoutes from './routes/agents';
import nluRoutes from './routes/nlu';
import instagramRoutes from './routes/instagram';
import catalogRoutes from './routes/catalog';
import cartRecoveryRoutes from './routes/cart-recovery';
import optInRoutes from './routes/optin';
import verificationRoutes from './routes/verification';
import flowFormRoutes from './routes/flow-forms';
import shopifyRoutes from './routes/shopify';
import crmRoutes from './routes/crm';
import callRoutes from './routes/calls';
import { reminderService } from './services/reminder';
import { users, pendingUsers } from './routes/auth';
import { messages } from './routes/chat';

dotenv.config();

// Reset all in-memory data on server start (clean slate for production testing)
users.length = 0;
pendingUsers.length = 0;
messages.length = 0;
console.log('✅ All in-memory data cleared on startup');

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ZENZAP API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', webhookRoutes);
app.use('/api', zapierWebhookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', templateRoutes);
app.use('/api', bookingRoutes);
app.use('/api', customerRoutes);
app.use('/api', paymentRoutes);
app.use('/api', leadRoutes);
app.use('/api', aiRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', supportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api', coexistenceRoutes);
app.use('/api', flowRoutes);
app.use('/api', adsRoutes);
app.use('/api', agentRoutes);
app.use('/api', nluRoutes);
app.use('/api', instagramRoutes);
app.use('/api', catalogRoutes);
app.use('/api', cartRecoveryRoutes);
app.use('/api', optInRoutes);
app.use('/api', verificationRoutes);
app.use('/api', flowFormRoutes);
app.use('/api', shopifyRoutes);
app.use('/api', crmRoutes);
app.use('/api', callRoutes);

// Start reminder service
reminderService.start();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ZENZAP Backend running on port ${PORT}`);
  console.log(`   API available at http://localhost:${PORT}`);
});
