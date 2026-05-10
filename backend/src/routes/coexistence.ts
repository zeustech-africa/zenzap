import express from 'express';

const router = express.Router();

// In-memory storage for user coexistence preferences
const userCoexistence: Map<string, { enabled: boolean; updatedAt: string }> = new Map();

// Get coexistence status for user
router.get('/coexistence/status', (req, res) => {
  const userId = req.query.userId as string;
  const status = userCoexistence.get(userId);
  
  res.json({
    enabled: status?.enabled || false,
    lastUpdated: status?.updatedAt || null,
    featureChanges: {
      messageEdit: false,
      disappearingMessages: false,
      viewOnceMessages: false,
      liveLocation: false,
      broadcastLists: 'read-only'
    }
  });
});

// Toggle coexistence mode
router.post('/coexistence/toggle', (req, res) => {
  const { userId, enabled } = req.body;
  
  userCoexistence.set(userId, {
    enabled,
    updatedAt: new Date().toISOString()
  });
  
  console.log(`Coexistence mode ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  
  res.json({
    success: true,
    enabled,
    message: enabled 
      ? 'Coexistence mode enabled. You can now use WhatsApp Business App and ZENZAP together.'
      : 'Coexistence mode disabled. You will only be able to use ZENZAP.'
  });
});

export default router;