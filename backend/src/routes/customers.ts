import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { customers, customerInteractions, Customer, CustomerNote, CustomerInteraction } from '../models/Customer';

const router = express.Router();

// Get all customers
router.get('/customers', (req, res) => {
  const businessId = req.query.businessId as string;
  let filtered = customers;
  if (businessId) {
    filtered = customers.filter(c => c.businessId === businessId);
  }
  res.json(filtered);
});

// Get customer by ID
router.get('/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Search customers by name or phone
router.get('/customers/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = customers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.phone.includes(query) ||
    c.email?.toLowerCase().includes(query)
  );
  res.json(results);
});

// Create new customer
router.post('/customers', (req, res) => {
  const { name, phone, email, tags, businessId } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  // Check if customer already exists
  const existing = customers.find(c => c.phone === phone && c.businessId === (businessId || 'default'));
  if (existing) {
    return res.status(409).json({ error: 'Customer already exists', customer: existing });
  }
  
  const newCustomer: Customer = {
    id: uuidv4(),
    businessId: businessId || 'default',
    name,
    phone: phone.replace(/[^0-9]/g, ''),
    email,
    tags: tags || [],
    notes: [],
    totalInteractions: 0,
    lastInteractionAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  };
  
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.patch('/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const { name, email, tags, status } = req.body;
  if (name) customer.name = name;
  if (email) customer.email = email;
  if (tags) customer.tags = tags;
  if (status) customer.status = status;
  customer.updatedAt = new Date().toISOString();
  
  res.json(customer);
});

// Add note to customer
router.post('/customers/:id/notes', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const { content, createdBy } = req.body;
  const newNote: CustomerNote = {
    id: uuidv4(),
    content,
    createdBy: createdBy || 'system',
    createdAt: new Date().toISOString()
  };
  
  customer.notes.push(newNote);
  customer.updatedAt = new Date().toISOString();
  
  res.status(201).json(newNote);
});

// Get customer notes
router.get('/customers/:id/notes', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer.notes);
});

// Add tag to customer
router.post('/customers/:id/tags', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const { tag } = req.body;
  if (!customer.tags.includes(tag)) {
    customer.tags.push(tag);
    customer.updatedAt = new Date().toISOString();
  }
  
  res.json(customer);
});

// Remove tag from customer
router.delete('/customers/:id/tags/:tag', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customer.tags = customer.tags.filter(t => t !== req.params.tag);
  customer.updatedAt = new Date().toISOString();
  
  res.json(customer);
});

// Get customer interactions
router.get('/customers/:id/interactions', (req, res) => {
  const interactions = customerInteractions.filter(i => i.customerId === req.params.id);
  res.json(interactions);
});

// Record interaction (called automatically by webhook)
router.post('/interactions', (req, res) => {
  const { customerId, type, details, timestamp } = req.body;
  
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    customer.totalInteractions += 1;
    customer.lastInteractionAt = timestamp || new Date().toISOString();
  }
  
  const newInteraction: CustomerInteraction = {
    id: uuidv4(),
    customerId,
    type,
    details,
    timestamp: timestamp || new Date().toISOString()
  };
  
  customerInteractions.push(newInteraction);
  res.status(201).json(newInteraction);
});

// Get customer segments by tags
router.get('/segments/:tag', (req, res) => {
  const tag = req.params.tag;
  const segmented = customers.filter(c => c.tags.includes(tag));
  res.json(segmented);
});

export default router;