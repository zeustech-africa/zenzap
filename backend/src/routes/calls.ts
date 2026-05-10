import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { callRecords, CallRecord } from '../models/Call';

const router = express.Router();

// Initiate WhatsApp voice/video call
router.post('/calls/initiate', async (req, res) => {
  const { userId, customerPhone, customerName, type } = req.body;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return res.status(400).json({ error: 'WhatsApp API not configured' });
  }

  try {
    // Create call record
    const callId = uuidv4();
    const callRecord: CallRecord = {
      id: callId,
      userId,
      customerPhone,
      customerName: customerName || 'Customer',
      type: type || 'voice',
      direction: 'outgoing',
      status: 'initiated',
      duration: 0,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    callRecords.push(callRecord);

    // Generate WhatsApp call link (deep link)
    const callLink = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?call=true${type === 'video' ? '&video=true' : ''}`;

    // Update call status
    callRecord.status = 'ringing';

    res.json({
      success: true,
      callId,
      callLink,
      status: callRecord.status,
      message: `${type === 'video' ? 'Video call' : 'Voice call'} initiated. Click the link to start the call on WhatsApp.`
    });
  } catch (error: any) {
    console.error('Call initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// Update call status (called from webhook or manual)
router.post('/calls/update/:callId', (req, res) => {
  const { callId } = req.params;
  const { status, duration } = req.body;

  const call = callRecords.find(c => c.id === callId);
  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  call.status = status || call.status;
  if (duration) call.duration = duration;
  if (status === 'completed' || status === 'missed' || status === 'failed') {
    call.endedAt = new Date().toISOString();
  }

  res.json({ success: true });
});

// Get call history for user
router.get('/calls/history', (req, res) => {
  const userId = req.query.userId as string;
  const calls = callRecords.filter(c => c.userId === userId).sort((a, b) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  res.json(calls);
});

export default router;