import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface UserSettings {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  timezone: string;
  notifications: {
    email: boolean;
    whatsapp: boolean;
  };
  updatedAt: string;
}

const userSettings: UserSettings[] = [];

// Get user settings
router.get('/settings', (req, res) => {
  const userId = req.query.userId as string;
  const settings = userSettings.find(s => s.userId === userId);
  
  if (!settings) {
    // Return default settings
    return res.json({
      businessName: '',
      businessEmail: '',
      businessPhone: '',
      timezone: 'Africa/Johannesburg',
      notifications: { email: true, whatsapp: true }
    });
  }
  
  res.json(settings);
});

// Update user settings
router.post('/settings', (req, res) => {
  const { userId, businessName, businessEmail, businessPhone, timezone, notifications } = req.body;
  
  let settings = userSettings.find(s => s.userId === userId);
  
  if (settings) {
    settings.businessName = businessName || settings.businessName;
    settings.businessEmail = businessEmail || settings.businessEmail;
    settings.businessPhone = businessPhone || settings.businessPhone;
    settings.timezone = timezone || settings.timezone;
    settings.notifications = notifications || settings.notifications;
    settings.updatedAt = new Date().toISOString();
  } else {
    settings = {
      id: uuidv4(),
      userId,
      businessName: businessName || '',
      businessEmail: businessEmail || '',
      businessPhone: businessPhone || '',
      timezone: timezone || 'Africa/Johannesburg',
      notifications: notifications || { email: true, whatsapp: true },
      updatedAt: new Date().toISOString()
    };
    userSettings.push(settings);
  }
  
  res.json(settings);
});

export default router;