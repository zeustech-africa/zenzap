import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verificationStatuses, VerificationStatus } from '../models/Verification';

const router = express.Router();

// Get verification status for user
router.get('/verification/status', (req, res) => {
  const userId = req.query.userId as string;
  const status = verificationStatuses.find(s => s.userId === userId);
  
  if (!status) {
    return res.json({
      status: 'not_started',
      businessVerified: false,
      displayNameSubmitted: false,
      documentsUploaded: false
    });
  }
  
  res.json(status);
});

// Update verification progress
router.post('/verification/update', (req, res) => {
  const { userId, businessVerified, displayNameSubmitted, documentsUploaded, status } = req.body;
  
  let record = verificationStatuses.find(s => s.userId === userId);
  
  if (record) {
    record.businessVerified = businessVerified ?? record.businessVerified;
    record.displayNameSubmitted = displayNameSubmitted ?? record.displayNameSubmitted;
    record.documentsUploaded = documentsUploaded ?? record.documentsUploaded;
    record.status = status || record.status;
    record.lastUpdated = new Date().toISOString();
  } else {
    record = {
      id: uuidv4(),
      userId,
      status: status || 'in_progress',
      businessVerified: businessVerified || false,
      displayNameSubmitted: displayNameSubmitted || false,
      documentsUploaded: documentsUploaded || false,
      lastUpdated: new Date().toISOString()
    };
    verificationStatuses.push(record);
  }
  
  res.json(record);
});

export default router;