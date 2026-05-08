import express from 'express';
import { messages } from './chat';
import { leads } from '../models/Lead';

const router = express.Router();

// Get real dashboard stats for a user
router.get('/stats/:userId', (req, res) => {
  const { userId } = req.params;

  // Count messages this week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const userMessages = messages.filter(m =>
    m.userId === userId && new Date(m.timestamp) >= oneWeekAgo
  );
  const messagesThisWeek = userMessages.length;

  // Calculate percentage change from previous week
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const previousWeekMessages = messages.filter(m =>
    m.userId === userId &&
    new Date(m.timestamp) >= twoWeeksAgo &&
    new Date(m.timestamp) < oneWeekAgo
  ).length;

  const messageChange = previousWeekMessages === 0
    ? (messagesThisWeek > 0 ? 100 : 0)
    : Math.round(((messagesThisWeek - previousWeekMessages) / previousWeekMessages) * 100);

  // Count leads captured this week
  const userLeads = leads.filter(l =>
    l.businessId === userId && new Date(l.createdAt) >= oneWeekAgo
  );
  const leadsThisWeek = userLeads.length;

  // Leads change from previous week
  const previousWeekLeads = leads.filter(l =>
    l.businessId === userId &&
    new Date(l.createdAt) >= twoWeeksAgo &&
    new Date(l.createdAt) < oneWeekAgo
  ).length;

  const leadsChange = previousWeekLeads === 0
    ? (leadsThisWeek > 0 ? 100 : 0)
    : Math.round(((leadsThisWeek - previousWeekLeads) / previousWeekLeads) * 100);

  // Count auto-replies sent
  const autoReplies = messages.filter(m =>
    m.userId === userId && m.fromAdmin === true && m.isAutoReply === true
  ).length;

  // Calculate hours saved (approx 2 minutes per auto-reply)
  const hoursSaved = Math.round((autoReplies * 2) / 60);

  res.json({
    messagesThisWeek,
    messageChange,
    leadsThisWeek,
    leadsChange,
    autoReplies,
    hoursSaved
  });
});

// Get recent messages for a user (for the dashboard recent conversations widget)
router.get('/recent/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 5;

  const userMessages = messages
    .filter(m => m.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map(m => ({
      id: m.id,
      phone: m.userName || m.userId,
      message: m.message,
      timestamp: m.timestamp,
      fromAdmin: m.fromAdmin,
    }));

  res.json(userMessages);
});

export default router;