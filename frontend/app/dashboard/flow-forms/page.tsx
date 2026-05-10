'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FormQuestion {
  id: string;
  order: number;
  type: string;
  question: string;
  required: boolean;
  options?: string[];
}

interface FlowForm {
  id: string;
  name: string;
  description: string;
  triggerKeyword: string;
  welcomeMessage: string;
  completionMessage: string;
  questions: FormQuestion[];
  isActive: boolean;
  responseCount: number;
  completionRate: number;
  createdAt: string;
}

export default function FlowFormsPage() {
  const [forms, setForms] = useState<FlowForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<FlowForm | null>(null);
  const [showResponses, setShowResponses] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/flow-forms?userId=${userId}`);
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      id: 'customer_registration',
      name: 'Customer Registration',
      description: 'Collect customer name, email, phone, and location',
      triggerKeyword: 'register',
      welcomeMessage: 'Welcome! Let me get your details to serve you better.',
      completionMessage: 'Thank you for registering! We\'ll be in touch.',
      questions: [
        { id: 'q1', order: 1, type: 'text', question: 'What is your full name?', required: true },
        { id: 'q2', order: 2, type: 'email', question: 'What is your email address?', required: true },
        { id: 'q3', order: 3, type: 'phone', question: 'What is your WhatsApp number?', required: true },
        { id: 'q4', order: 4, type: 'text', question: 'Where are you located?', required: false }
      ]
    },
    {
      id: 'appointment_booking',
      name: 'Appointment Booking',
      description: 'Book appointments via WhatsApp',
      triggerKeyword: 'book',
      welcomeMessage: 'I can help you book an appointment. Let me ask a few questions.',
      completionMessage: 'Your appointment has been booked! We\'ll send a reminder.',
      questions: [
        { id: 'q1', order: 1, type: 'text', question: 'What service would you like?', required: true },
        { id: 'q2', order: 2, type: 'date', question: 'What date works for you?', required: true },
        { id: 'q3', order: 3, type: 'text', question: 'What time works for you?', required: true }
      ]
    },
    {
      id: 'feedback_survey',
      name: 'Feedback Survey',
      description: 'Collect customer feedback',
      triggerKeyword: 'feedback',
      welcomeMessage: 'We value your feedback! Please answer a few questions.',
      completionMessage: 'Thank you for your feedback!',
      questions: [
        { id: 'q1', order: 1, type: 'select', question: 'How would you rate our service?', required: true, options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Terrible'] },
        { id: 'q2', order: 2, type: 'text', question: 'What did you like?', required: false },
        { id: 'q3', order: 3, type: 'text', question: 'What can we improve?', required: false }
      ]
    }
  ];

  const createFormFromTemplate = async (template: any) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/flow-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: template.name,
          description: template.description,
          triggerKeyword: template.triggerKeyword,
          welcomeMessage: template.welcomeMessage,
          completionMessage: template.completionMessage,
          questions: template.questions.map((q: any, idx: number) => ({
            id: `q${idx + 1}`,
            order: idx + 1,
            type: q.type,
            question: q.question,
            required: q.required,
            options: q.options
          }))
        })
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setSelectedTemplate(null);
        await fetchForms();
      }
    } catch (error) {
      alert('Failed to create form');
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Delete this form?')) return;
    
    try {
      await fetch(`/api/flow-forms/${id}`, { method: 'DELETE' });
      await fetchForms();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const toggleFormStatus = async (id: string, currentStatus: boolean) => {
    const form = forms.find(f => f.id === id);
    if (!form) return;
    
    try {
      await fetch(`/api/flow-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isActive: !currentStatus })
      });
      await fetchForms();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">WhatsApp Flows</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📋 Interactive Forms</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Create Form
          </button>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3">📝 Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-medium">Customer Registration</h3>
              <p className="text-gray-400 text-sm">Collect customer contact details</p>
              <p className="text-gray-500 text-xs mt-2">Trigger: "register"</p>
              <button
                onClick={() => createFormFromTemplate(templates[0])}
                className="mt-3 text-orange-400 text-sm hover:text-orange-300"
              >
                Use Template →
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-medium">Appointment Booking</h3>
              <p className="text-gray-400 text-sm">Book appointments via WhatsApp</p>
              <p className="text-gray-500 text-xs mt-2">Trigger: "book"</p>
              <button
                onClick={() => createFormFromTemplate(templates[1])}
                className="mt-3 text-orange-400 text-sm hover:text-orange-300"
              >
                Use Template →
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-medium">Feedback Survey</h3>
              <p className="text-gray-400 text-sm">Collect customer feedback</p>
              <p className="text-gray-500 text-xs mt-2">Trigger: "feedback"</p>
              <button
                onClick={() => createFormFromTemplate(templates[2])}
                className="mt-3 text-orange-400 text-sm hover:text-orange-300"
              >
                Use Template →
              </button>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="divide-y divide-white/10">
            {forms.map((form) => (
              <div key={form.id} className="p-4 hover:bg-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{form.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${form.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{form.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Trigger: "{form.triggerKeyword}"</span>
                      <span>{form.questions.length} questions</span>
                      <span>{form.responseCount} responses</span>
                      <span>{form.completionRate.toFixed(0)}% complete</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFormStatus(form.id, form.isActive)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        form.isActive
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      }`}
                    >
                      {form.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {forms.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No forms yet. Create one from templates above.
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How WhatsApp Flows Work</h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Create a form from template or customize your own</li>
            <li>Customer sends the trigger keyword (e.g., "register")</li>
            <li>ZENZAP sends the form questions one by one</li>
            <li>Customer answers and submits responses</li>
            <li>Data is saved to your customer record</li>
          </ol>
        </div>
      </div>
    </div>
  );
}