import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for chat file uploads
const chatUploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat-files');
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, chatUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({ storage: chatStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// In-memory store for chat messages
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  fromAdmin: boolean;
  isAutoReply?: boolean;
  toUserId: string;
  timestamp: string;
  read: boolean;
  fileUrl?: string;
  fileName?: string;
}

export const messages: ChatMessage[] = [];

// Get messages for a specific user
router.get('/messages/:userId', (req, res) => {
  const { userId } = req.params;
  const userMessages = messages.filter(
    m => m.userId === userId || m.toUserId === userId
  );
  res.json(userMessages);
});

// Get all conversations for admin
router.get('/conversations', (_req, res) => {
  const conversationsMap = new Map<string, {
    userId: string;
    userName: string;
    lastMessage: string;
    lastTimestamp: string;
    unread: boolean;
  }>();

  messages.forEach(msg => {
    const key = msg.userId;
    const existing = conversationsMap.get(key);
    if (!existing || new Date(msg.timestamp) > new Date(existing.lastTimestamp)) {
      conversationsMap.set(key, {
        userId: msg.userId,
        userName: msg.userName || 'User',
        lastMessage: msg.message,
        lastTimestamp: msg.timestamp,
        unread: !msg.read && !msg.fromAdmin,
      });
    } else if (!msg.read && !msg.fromAdmin) {
      // Mark conversation as having unread messages
      existing.unread = true;
    }
  });

  res.json(Array.from(conversationsMap.values()));
});

// Send a message
router.post('/send', (req, res) => {
  const { userId, userName, message, fromAdmin, toUserId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const newMessage: ChatMessage = {
    id: uuidv4(),
    userId: userId || toUserId || 'unknown',
    userName: userName || 'User',
    message: message.trim(),
    fromAdmin: fromAdmin || false,
    toUserId: toUserId || 'admin',
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  console.log(`📨 Message sent: ${fromAdmin ? 'Admin' : userName} -> ${newMessage.userId}`);

  res.status(201).json(newMessage);
});

// Mark messages as read for a user
router.post('/read/:userId', (req, res) => {
  const { userId } = req.params;
  let count = 0;
  messages.forEach(m => {
    if (m.userId === userId && !m.read) {
      m.read = true;
      count++;
    }
  });
  res.json({ success: true, count });
});

// File upload endpoint
router.post('/upload-file', upload.single('file'), (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileMessage: ChatMessage = {
    id: uuidv4(),
    userId: userId || 'unknown',
    userName: '',
    message: `📎 Sent file: ${file.originalname}`,
    fromAdmin: false,
    toUserId: 'admin',
    timestamp: new Date().toISOString(),
    read: false,
    fileUrl: `/uploads/chat-files/${file.filename}`,
    fileName: file.originalname,
  };

  messages.push(fileMessage);
  console.log(`📎 File uploaded by ${userId}: ${file.originalname}`);

  res.json({ success: true, message: fileMessage });
});

export default router;
