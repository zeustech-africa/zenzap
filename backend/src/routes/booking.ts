import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { appointments, staffMembers, Appointment, Staff } from '../models/Appointment';

const router = express.Router();

// Get all appointments for a business
router.get('/appointments', (req, res) => {
  const businessId = req.query.businessId as string;
  const filtered = businessId 
    ? appointments.filter(a => a.businessId === businessId)
    : appointments;
  
  res.json(filtered);
});

// Get appointment by ID
router.get('/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json(appointment);
});

// Create appointment (from WhatsApp or dashboard)
router.post('/appointments', (req, res) => {
  const { businessId, customerName, customerPhone, service, staffId, date, time, duration, notes } = req.body;
  
  if (!customerName || !customerPhone || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newAppointment: Appointment = {
    id: uuidv4(),
    businessId: businessId || 'default',
    customerId: uuidv4(),
    customerName,
    customerPhone: customerPhone.replace(/[^0-9]/g, ''),
    service: service || 'General',
    staffId,
    staffName: staffMembers.find(s => s.id === staffId)?.name,
    date,
    time,
    duration: duration || 60,
    status: 'pending',
    notes,
    reminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

// Update appointment status
router.patch('/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  const appointment = appointments.find(a => a.id === req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  res.json(appointment);
});

// Cancel appointment
router.delete('/appointments/:id', (req, res) => {
  const index = appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointments[index].status = 'cancelled';
  res.json({ message: 'Appointment cancelled' });
});

// Get staff members
router.get('/staff', (req, res) => {
  res.json(staffMembers);
});

// Add staff member
router.post('/staff', (req, res) => {
  const { name, email, phone, services } = req.body;
  
  const newStaff: Staff = {
    id: uuidv4(),
    businessId: 'default',
    name,
    email,
    phone,
    services: services || [],
    availability: [],
    isActive: true
  };
  
  staffMembers.push(newStaff);
  res.status(201).json(newStaff);
});

export default router;