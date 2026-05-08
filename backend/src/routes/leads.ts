import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { leads, followUpSequences, Lead, LeadNote, FollowUpSequence } from '../models/Lead';

const router = express.Router();

// Get all leads for a business
router.get('/leads', (req, res) => {
  const businessId = req.query.businessId as string;
  let filtered = leads;
  if (businessId) {
    filtered = leads.filter(l => l.businessId === businessId);
  }
  res.json(filtered);
});

// Get lead by ID
router.get('/leads/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json(lead);
});

// Update lead status
router.patch('/leads/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  lead.status = status;
  lead.updatedAt = new Date().toISOString();

  if (notes) {
    lead.notes.push({
      id: uuidv4(),
      content: notes,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    });
  }

  res.json(lead);
});

// Add note to lead
router.post('/leads/:id/notes', (req, res) => {
  const { content, createdBy } = req.body;
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const note: LeadNote = {
    id: uuidv4(),
    content,
    createdBy: createdBy || 'system',
    createdAt: new Date().toISOString()
  };
  lead.notes.push(note);
  lead.updatedAt = new Date().toISOString();

  res.status(201).json(note);
});

// Schedule follow-up
router.post('/leads/:id/followup', (req, res) => {
  const { scheduledTime, message } = req.body;
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  lead.nextFollowUpAt = scheduledTime;
  lead.updatedAt = new Date().toISOString();

  // In production, schedule actual message delivery
  console.log(`Follow-up scheduled for ${lead.customerName} at ${scheduledTime}`);

  res.json({ message: 'Follow-up scheduled', scheduledTime });
});

// Get lead statistics
router.get('/leads/stats/summary', (req, res) => {
  const businessId = req.query.businessId as string;
  let filtered = leads;
  if (businessId) {
    filtered = leads.filter(l => l.businessId === businessId);
  }

  const stats = {
    total: filtered.length,
    new: filtered.filter(l => l.status === 'new').length,
    contacted: filtered.filter(l => l.status === 'contacted').length,
    qualified: filtered.filter(l => l.status === 'qualified').length,
    won: filtered.filter(l => l.status === 'won').length,
    lost: filtered.filter(l => l.status === 'lost').length,
    conversionRate: 0
  };

  stats.conversionRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;

  res.json(stats);
});

// Get follow-up sequences
router.get('/followup-sequences', (req, res) => {
  res.json(followUpSequences);
});

// Create follow-up sequence
router.post('/followup-sequences', (req, res) => {
  const { name, trigger, steps } = req.body;

  const newSequence: FollowUpSequence = {
    id: uuidv4(),
    businessId: 'default',
    name,
    trigger,
    steps,
    isActive: true
  };

  followUpSequences.push(newSequence);
  res.status(201).json(newSequence);
});

export default router;