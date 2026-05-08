import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// In-memory storage (replace with database)
export const users: any[] = [];
export const pendingUsers: any[] = [];

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Also serve uploaded files statically (handled by index.ts or directly)
router.use('/uploads', express.static(uploadsDir));

router.post('/register', async (req, res) => {
  try {
    const { businessName, email, phone, password, ownerName } = req.body;

    // Check if user exists in either array
    if (users.find(u => u.email === email) || pendingUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = {
      id: userId,
      businessName,
      email,
      phone,
      ownerName,
      password: hashedPassword,
      status: 'pending',
      subscription: 'free',
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      idDocumentUrl: null,
      facePhotoUrl: null
    };

    pendingUsers.push(newUser);

    // In production, send email to admin
    console.log(`📧 New registration: ${businessName} (${email}) - Pending approval`);

    res.status(201).json({
      message: 'Registration submitted. Awaiting admin approval.',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = [...users, ...pendingUsers].find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'zenzap-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        businessName: user.businessName,
        email: user.email,
        subscription: user.subscription,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin endpoints (protected - add auth middleware later)
router.get('/admin/pending-users', (_req, res) => {
  res.json(pendingUsers);
});

router.post('/admin/approve/:userId', (req, res) => {
  const userIndex = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const approvedUser = pendingUsers[userIndex];
  approvedUser.status = 'active';
  users.push(approvedUser);
  pendingUsers.splice(userIndex, 1);

  res.json({ message: 'User approved successfully' });
});

router.post('/admin/reject/:userId', (req, res) => {
  const userIndex = pendingUsers.findIndex(u => u.id === req.params.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  pendingUsers.splice(userIndex, 1);
  res.json({ message: 'User rejected' });
});

// Status check endpoint - allows frontend to poll for approval status
router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const user = [...users, ...pendingUsers].find(u => u.id === userId);

  if (user) {
    res.json({ status: user.status, approved: user.status === 'approved' || user.status === 'active' });
  } else {
    res.json({ status: 'not_found' });
  }
});

// ID document upload endpoint (accepts multipart form data)
router.post('/upload-id', upload.single('idDocument'), (req, res) => {
  try {
    const { userId, registrationData } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find user in pending users
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      user.idDocumentUrl = `/uploads/${file.filename}`;
      user.idDocumentPath = file.path;
      console.log(`✅ ID uploaded for user ${user.businessName}: ${user.idDocumentUrl}`);
      res.json({ success: true, url: user.idDocumentUrl });
    } else {
      // If no userId match, still accept the upload but log a warning
      console.warn(`⚠️ No pending user found for ID upload, userId: ${userId}`);
      // Store the file anyway and succeed
      res.json({ success: true, message: 'ID document uploaded successfully' });
    }
  } catch (error) {
    console.error('ID upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Face image upload endpoint (accepts multipart form data)
router.post('/upload-face', upload.single('faceImage'), (req, res) => {
  try {
    const { userId, registrationData } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find user in pending users
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      user.facePhotoUrl = `/uploads/${file.filename}`;
      user.facePhotoPath = file.path;
      console.log(`✅ Face capture uploaded for user ${user.businessName}: ${user.facePhotoUrl}`);
      res.json({ success: true, url: user.facePhotoUrl });
    } else {
      // If no userId match, still accept the upload but log a warning
      console.warn(`⚠️ No pending user found for face upload, userId: ${userId}`);
      res.json({ success: true, message: 'Face image uploaded successfully' });
    }
  } catch (error) {
    console.error('Face upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;