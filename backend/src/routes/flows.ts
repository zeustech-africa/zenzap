import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { flows, Flow, Step, Trigger, Action } from '../models/Flow';

const router = express.Router();

// Get all flows for user
router.get('/flows', (req, res) => {
  const userId = req.query.userId as string;
  const userFlows = flows.filter(f => f.userId === userId);
  res.json(userFlows);
});

// Get single flow
router.get('/flows/:id', (req, res) => {
  const flow = flows.find(f => f.id === req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  res.json(flow);
});

// Create flow (copies ManyChat's pattern)
router.post('/flows', (req, res) => {
  const { userId, name, description, trigger, steps } = req.body;
  
  const newFlow: Flow = {
    id: uuidv4(),
    userId,
    name,
    description,
    trigger,
    steps: steps || [],
    isActive: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  flows.push(newFlow);
  res.status(201).json(newFlow);
});

// Update flow
router.put('/flows/:id', (req, res) => {
  const { name, description, trigger, steps } = req.body;
  const flow = flows.find(f => f.id === req.params.id);
  
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  
  flow.name = name;
  flow.description = description;
  flow.trigger = trigger;
  flow.steps = steps;
  flow.updatedAt = new Date().toISOString();
  
  res.json(flow);
});

// Delete flow
router.delete('/flows/:id', (req, res) => {
  const index = flows.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  
  flows.splice(index, 1);
  res.json({ success: true });
});

// Activate flow (deactivates others of same trigger type)
router.post('/flows/:id/activate', (req, res) => {
  const flow = flows.find(f => f.id === req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  
  // Deactivate other flows with same trigger type
  flows.forEach(f => {
    if (f.userId === flow.userId && f.trigger.type === flow.trigger.type) {
      f.isActive = false;
    }
  });
  
  flow.isActive = true;
  flow.updatedAt = new Date().toISOString();
  
  res.json({ success: true, isActive: true });
});

// Deactivate flow
router.post('/flows/:id/deactivate', (req, res) => {
  const flow = flows.find(f => f.id === req.params.id);
  if (!flow) {
    return res.status(404).json({ error: 'Flow not found' });
  }
  
  flow.isActive = false;
  flow.updatedAt = new Date().toISOString();
  
  res.json({ success: true, isActive: false });
});

// Increment usage count (called when flow is triggered)
router.post('/flows/:id/used', (req, res) => {
  const flow = flows.find(f => f.id === req.params.id);
  if (flow) {
    flow.usageCount++;
    res.json({ usageCount: flow.usageCount });
  } else {
    res.status(404).json({ error: 'Flow not found' });
  }
});

export default router;