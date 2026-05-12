import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  notes?: string;
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
}

const contacts: Contact[] = [];

// Get all contacts
router.get('/contacts', (req, res) => {
  const userId = req.query.userId as string;
  const userContacts = contacts.filter(c => c.userId === userId);
  res.json(userContacts);
});

// Get single contact
router.get('/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  res.json(contact);
});

// Create contact
router.post('/contacts', (req, res) => {
  const { userId, name, phone, email, tags, notes } = req.body;
  
  const newContact: Contact = {
    id: uuidv4(),
    userId,
    name,
    phone,
    email,
    tags: tags || [],
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  contacts.push(newContact);
  res.status(201).json(newContact);
});

// Update contact
router.put('/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  
  const { name, phone, email, tags, notes } = req.body;
  if (name) contact.name = name;
  if (phone) contact.phone = phone;
  if (email) contact.email = email;
  if (tags) contact.tags = tags;
  if (notes) contact.notes = notes;
  contact.updatedAt = new Date().toISOString();
  
  res.json(contact);
});

// Delete contact
router.delete('/contacts/:id', (req, res) => {
  const index = contacts.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  contacts.splice(index, 1);
  res.json({ success: true });
});

export default router;