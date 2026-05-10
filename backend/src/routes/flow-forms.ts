import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { flowForms, formResponses, FlowForm, FormResponse } from '../models/FlowForm';

const router = express.Router();

// Get all forms for user
router.get('/flow-forms', (req, res) => {
  const userId = req.query.userId as string;
  const forms = flowForms.filter(f => f.userId === userId);
  res.json(forms);
});

// Get single form
router.get('/flow-forms/:id', (req, res) => {
  const form = flowForms.find(f => f.id === req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Form not found' });
  }
  res.json(form);
});

// Create form from template
router.post('/flow-forms', (req, res) => {
  const { userId, name, description, triggerKeyword, welcomeMessage, completionMessage, questions } = req.body;
  
  const newForm: FlowForm = {
    id: uuidv4(),
    userId,
    name,
    description: description || '',
    triggerKeyword: triggerKeyword || name.toLowerCase().replace(/\s/g, '_'),
    welcomeMessage: welcomeMessage || `Welcome! Let's get some information.`,
    completionMessage: completionMessage || 'Thank you! Your responses have been saved.',
    questions: questions || [],
    responses: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    completionRate: 0
  };
  
  flowForms.push(newForm);
  res.status(201).json(newForm);
});

// Update form
router.put('/flow-forms/:id', (req, res) => {
  const { name, description, triggerKeyword, welcomeMessage, completionMessage, questions, isActive } = req.body;
  const form = flowForms.find(f => f.id === req.params.id);
  
  if (!form) {
    return res.status(404).json({ error: 'Form not found' });
  }
  
  if (name !== undefined) form.name = name;
  if (description !== undefined) form.description = description;
  if (triggerKeyword !== undefined) form.triggerKeyword = triggerKeyword;
  if (welcomeMessage !== undefined) form.welcomeMessage = welcomeMessage;
  if (completionMessage !== undefined) form.completionMessage = completionMessage;
  if (questions !== undefined) form.questions = questions;
  if (isActive !== undefined) form.isActive = isActive;
  form.updatedAt = new Date().toISOString();
  
  res.json(form);
});

// Delete form
router.delete('/flow-forms/:id', (req, res) => {
  const index = flowForms.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Form not found' });
  }
  
  flowForms.splice(index, 1);
  res.json({ success: true });
});

// Get form responses
router.get('/flow-forms/:id/responses', (req, res) => {
  const responses = formResponses.filter(r => r.formId === req.params.id);
  res.json(responses);
});

// Submit form response (called from WhatsApp webhook)
router.post('/flow-forms/:id/submit', (req, res) => {
  const { customerPhone, customerName, answers, status } = req.body;
  const form = flowForms.find(f => f.id === req.params.id);
  
  if (!form) {
    return res.status(404).json({ error: 'Form not found' });
  }
  
  const existingResponse = formResponses.find(r => r.formId === form.id && r.customerPhone === customerPhone);
  
  if (existingResponse) {
    existingResponse.answers = { ...existingResponse.answers, ...answers };
    existingResponse.status = status || existingResponse.status;
    if (status === 'completed') {
      existingResponse.completedAt = new Date().toISOString();
    }
    existingResponse.updatedAt = new Date().toISOString();
  } else {
    const newResponse: FormResponse = {
      id: uuidv4(),
      formId: form.id,
      customerPhone,
      customerName: customerName || 'Unknown',
      answers,
      status: status || 'in_progress',
      startedAt: new Date().toISOString()
    };
    formResponses.push(newResponse);
    form.responseCount++;
    form.completionRate = (formResponses.filter(r => r.formId === form.id && r.status === 'completed').length / form.responseCount) * 100;
  }
  
  res.json({ success: true });
});

export default router;