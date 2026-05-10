import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { optInRecords, optInLogs, OptInRecord } from '../models/OptIn';

const router = express.Router();

// Get all opt-in records for user
router.get('/optin/records', (req, res) => {
  const userId = req.query.userId as string;
  const records = optInRecords.filter(r => r.userId === userId);
  res.json(records);
});

// Get single opt-in record by phone
router.get('/optin/record/:phone', (req, res) => {
  const userId = req.query.userId as string;
  const record = optInRecords.find(r => r.userId === userId && r.customerPhone === req.params.phone);
  
  if (!record) {
    return res.status(404).json({ error: 'Opt-in record not found' });
  }
  res.json(record);
});

// Create or update opt-in record
router.post('/optin/record', (req, res) => {
  const { userId, customerPhone, customerName, optInSource, optInMethod, marketingConsent, transactionalConsent, notes } = req.body;
  
  let record = optInRecords.find(r => r.userId === userId && r.customerPhone === customerPhone);
  
  if (record) {
    // Update existing record
    const oldConsent = record.marketingConsent;
    record.customerName = customerName || record.customerName;
    record.marketingConsent = marketingConsent ?? record.marketingConsent;
    record.transactionalConsent = transactionalConsent ?? record.transactionalConsent;
    record.lastUpdated = new Date().toISOString();
    record.notes = notes || record.notes;
    
    // Log the update
    optInLogs.push({
      id: uuidv4(),
      userId,
      customerPhone,
      action: 'update',
      changes: `Marketing consent: ${oldConsent} → ${record.marketingConsent}`,
      source: optInSource,
      performedBy: 'system',
      timestamp: new Date().toISOString()
    });
  } else {
    // Create new record
    record = {
      id: uuidv4(),
      userId,
      customerPhone,
      customerName,
      optInSource,
      optInDate: new Date().toISOString(),
      optInMethod,
      consentGiven: marketingConsent || transactionalConsent,
      marketingConsent: marketingConsent || false,
      transactionalConsent: transactionalConsent || false,
      lastUpdated: new Date().toISOString(),
      notes
    };
    optInRecords.push(record);
    
    // Log the opt-in
    optInLogs.push({
      id: uuidv4(),
      userId,
      customerPhone,
      action: 'opt_in',
      source: optInSource,
      performedBy: 'system',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json(record);
});

// Opt-out customer (withdraw consent)
router.post('/optin/opt-out/:phone', (req, res) => {
  const { userId, source, performedBy } = req.body;
  const record = optInRecords.find(r => r.userId === userId && r.customerPhone === req.params.phone);
  
  if (!record) {
    return res.status(404).json({ error: 'Opt-in record not found' });
  }
  
  record.marketingConsent = false;
  record.consentGiven = false;
  record.lastUpdated = new Date().toISOString();
  
  optInLogs.push({
    id: uuidv4(),
    userId,
    customerPhone: req.params.phone,
    action: 'opt_out',
    source: source || 'manual',
    performedBy: performedBy || 'system',
    timestamp: new Date().toISOString()
  });
  
  res.json({ success: true, message: 'Customer opted out successfully' });
});

// Get opt-in logs
router.get('/optin/logs', (req, res) => {
  const userId = req.query.userId as string;
  const logs = optInLogs.filter(l => l.userId === userId);
  res.json(logs);
});

// Check if customer can receive marketing messages
router.get('/optin/can-send/:phone', (req, res) => {
  const userId = req.query.userId as string;
  const record = optInRecords.find(r => r.userId === userId && r.customerPhone === req.params.phone);
  
  const canSendMarketing = record ? record.marketingConsent : false;
  const canSendTransactional = record ? record.transactionalConsent : true; // Always allowed for transactional
  
  res.json({
    canSendMarketing,
    canSendTransactional,
    hasConsent: record?.consentGiven || false,
    record
  });
});

// Bulk import opt-in records (CSV)
router.post('/optin/bulk-import', (req, res) => {
  const { userId, records } = req.body;
  
  const imported = [];
  for (const record of records) {
    const existing = optInRecords.find(r => r.userId === userId && r.customerPhone === record.phone);
    
    if (!existing) {
      const newRecord: OptInRecord = {
        id: uuidv4(),
        userId,
        customerPhone: record.phone,
        customerName: record.name,
        optInSource: record.source || 'import',
        optInDate: record.date || new Date().toISOString(),
        optInMethod: 'import',
        consentGiven: true,
        marketingConsent: record.marketingConsent !== false,
        transactionalConsent: true,
        lastUpdated: new Date().toISOString(),
        notes: record.notes
      };
      optInRecords.push(newRecord);
      imported.push(newRecord);
    }
  }
  
  res.json({ success: true, count: imported.length });
});

export default router;