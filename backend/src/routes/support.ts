import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { messages, supportTickets, Message, SupportTicket } from '../models/Message';

const router = express.Router();

// Get all tickets for admin
router.get('/admin/tickets', (req, res) => {
  res.json(supportTickets);
});

// Get tickets for a business user
router.get('/tickets/:businessId', (req, res) => {
  const userTickets = supportTickets.filter(t => t.businessId === req.params.businessId);
  res.json(userTickets);
});

// Create new support ticket
router.post('/tickets', (req, res) => {
  const { userId, businessId, subject, message } = req.body;
  
  const newTicket: SupportTicket = {
    id: uuidv4(),
    userId,
    businessId,
    subject,
    status: 'open',
    priority: 'medium',
    messages: [{
      id: uuidv4(),
      fromUserId: userId,
      fromUserType: 'business',
      toUserId: 'admin',
      toUserType: 'admin',
      content: message,
      read: false,
      createdAt: new Date().toISOString()
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  supportTickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Get messages for a ticket
router.get('/tickets/:ticketId/messages', (req, res) => {
  const ticket = supportTickets.find(t => t.id === req.params.ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(ticket.messages);
});

// Send message in a ticket
router.post('/tickets/:ticketId/messages', (req, res) => {
  const { fromUserId, fromUserType, toUserId, toUserType, content } = req.body;
  const ticket = supportTickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  const newMessage: Message = {
    id: uuidv4(),
    fromUserId,
    fromUserType,
    toUserId,
    toUserType,
    content,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  ticket.messages.push(newMessage);
  ticket.updatedAt = new Date().toISOString();
  
  res.status(201).json(newMessage);
});

// Mark messages as read
router.patch('/tickets/:ticketId/read', (req, res) => {
  const { userId } = req.body;
  const ticket = supportTickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  ticket.messages.forEach(msg => {
    if (msg.toUserId === userId && !msg.read) {
      msg.read = true;
    }
  });
  
  res.json({ success: true });
});

// Update ticket status (admin only)
router.patch('/admin/tickets/:ticketId/status', (req, res) => {
  const { status } = req.body;
  const ticket = supportTickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  
  res.json(ticket);
});

export default router;