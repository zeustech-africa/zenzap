import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { agents, Agent, AgentMetrics } from '../models/Agent';

const router = express.Router();

// Get all agents for business
router.get('/agents', (req, res) => {
  const userId = req.query.userId as string;
  // In production, filter agents by business
  res.json(agents);
});

// Get agent by ID
router.get('/agents/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

// Create new agent
router.post('/agents', (req, res) => {
  const { name, email, phone, role } = req.body;
  
  const newAgent: Agent = {
    id: uuidv4(),
    name,
    email,
    phone,
    role: role || 'agent',
    status: 'offline',
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    metrics: {
      totalMessages: 0,
      responsesSent: 0,
      avgResponseTime: 0,
      resolutionRate: 0,
      customerSatisfaction: 0,
      conversationsAssigned: 0,
      conversationsResolved: 0,
      updatedAt: new Date().toISOString()
    }
  };
  
  agents.push(newAgent);
  res.status(201).json(newAgent);
});

// Update agent status
router.patch('/agents/:id/status', (req, res) => {
  const { status } = req.body;
  const agent = agents.find(a => a.id === req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  agent.status = status;
  agent.lastActive = new Date().toISOString();
  res.json(agent);
});

// Update agent metrics (called when messages are sent/received)
router.post('/agents/:id/metrics', (req, res) => {
  const { responsesSent, avgResponseTime, resolutionRate, customerSatisfaction, conversationsAssigned, conversationsResolved } = req.body;
  const agent = agents.find(a => a.id === req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  if (responsesSent !== undefined) agent.metrics.responsesSent += responsesSent;
  if (avgResponseTime !== undefined) agent.metrics.avgResponseTime = avgResponseTime;
  if (resolutionRate !== undefined) agent.metrics.resolutionRate = resolutionRate;
  if (customerSatisfaction !== undefined) agent.metrics.customerSatisfaction = customerSatisfaction;
  if (conversationsAssigned !== undefined) agent.metrics.conversationsAssigned += conversationsAssigned;
  if (conversationsResolved !== undefined) agent.metrics.conversationsResolved += conversationsResolved;
  agent.metrics.totalMessages = agent.metrics.responsesSent;
  agent.metrics.updatedAt = new Date().toISOString();
  
  res.json(agent);
});

// Delete agent
router.delete('/agents/:id', (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  agents.splice(index, 1);
  res.json({ success: true });
});

export default router;