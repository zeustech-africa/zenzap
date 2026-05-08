import express from 'express';
import { industryTemplateService } from '../services/templates';

const router = express.Router();

// Get all industry templates
router.get('/templates', (req, res) => {
  const templates = industryTemplateService.getAllTemplates();
  res.json(templates);
});

// Get template by ID
router.get('/templates/:id', (req, res) => {
  const template = industryTemplateService.getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// Activate a template for a user
router.post('/templates/:id/activate', async (req, res) => {
  const userId = req.body.userId; // In production, get from auth token
  const templateId = req.params.id;
  
  const template = industryTemplateService.getTemplateById(templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  await industryTemplateService.activateTemplate(userId, templateId);
  
  res.json({ 
    success: true, 
    message: `Template ${template.name} activated successfully`,
    autoReplies: template.autoReplies,
    quickReplies: template.quickReplies,
    welcomeMessage: template.welcomeMessage
  });
});

export default router;