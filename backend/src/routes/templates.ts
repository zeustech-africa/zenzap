import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { templates, Template } from '../models/Template';

const router = express.Router();

// Helper to extract variables from {{variable}} patterns
function extractVariables(content: string): string[] {
  const regex = /{{(.*?)}}/g;
  const matches = content.match(regex) as string[] | null;
  return [...new Set((matches || []).map((v) => v.replace(/{{|}}/g, '')))];
}

// Get all templates for user
router.get('/templates', (req, res) => {
  const userId = req.query.userId as string;
  const userTemplates = templates.filter(t => t.userId === userId);
  res.json(userTemplates);
});

// Get single template
router.get('/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// Create template
router.post('/templates', (req, res) => {
  const { userId, name, category, content } = req.body;
  
  const newTemplate: Template = {
    id: uuidv4(),
    userId,
    name,
    category,
    content,
    variables: extractVariables(content),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    successRate: 0
  };
  
  templates.push(newTemplate);
  res.status(201).json(newTemplate);
});

// Update template
router.put('/templates/:id', (req, res) => {
  const { name, category, content } = req.body;
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  template.name = name;
  template.category = category;
  template.content = content;
  template.variables = extractVariables(content);
  template.status = 'draft';
  template.updatedAt = new Date().toISOString();
  
  res.json(template);
});

// Delete template
router.delete('/templates/:id', (req, res) => {
  const index = templates.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates.splice(index, 1);
  res.json({ success: true });
});

// Submit template to Meta for approval
router.post('/templates/:id/submit', async (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  template.status = 'pending';
  template.updatedAt = new Date().toISOString();
  
  // In production, this would call Meta API to submit template
  // For now, simulate approval after 5 seconds (for testing)
  setTimeout(() => {
    template.status = 'approved';
    template.updatedAt = new Date().toISOString();
    console.log(`✅ Template "${template.name}" approved by Meta (simulated)`);
  }, 5000);
  
  res.json({ success: true, message: 'Template submitted for approval' });
});

export default router;