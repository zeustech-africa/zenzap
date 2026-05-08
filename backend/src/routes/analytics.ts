import express from 'express';
import { analyticsService } from '../services/analytics';

const router = express.Router();

// Get message statistics
router.get('/analytics/messages', (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  const days = parseInt(req.query.days as string) || 30;
  const stats = analyticsService.getMessageStats(businessId, days);
  res.json(stats);
});

// Get response time statistics
router.get('/analytics/response-times', (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  const stats = analyticsService.getResponseTimeStats(businessId);
  res.json(stats);
});

// Get lead conversion funnel
router.get('/analytics/conversion-funnel', (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  const funnel = analyticsService.getConversionFunnel(businessId);
  res.json(funnel);
});

// Get revenue statistics
router.get('/analytics/revenue', (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  const stats = analyticsService.getRevenueStats(businessId);
  res.json(stats);
});

// Get booking statistics
router.get('/analytics/bookings', (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  const stats = analyticsService.getBookingStats(businessId);
  res.json(stats);
});

// Get all analytics in one call
router.get('/analytics/dashboard', async (req, res) => {
  const businessId = req.query.businessId as string || 'default';
  
  const [messages, responseTimes, funnel, revenue, bookings] = await Promise.all([
    Promise.resolve(analyticsService.getMessageStats(businessId)),
    Promise.resolve(analyticsService.getResponseTimeStats(businessId)),
    Promise.resolve(analyticsService.getConversionFunnel(businessId)),
    Promise.resolve(analyticsService.getRevenueStats(businessId)),
    Promise.resolve(analyticsService.getBookingStats(businessId))
  ]);
  
  res.json({
    messages,
    responseTimes,
    funnel,
    revenue,
    bookings
  });
});

export default router;