'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  features: string[];
  autoReplies: Array<{ keyword: string; response: string; enabled: boolean }>;
  quickReplies: string[];
  welcomeMessage: string;
  bookingEnabled: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateTemplate = async (templateId: string) => {
    setActivating(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }) // In production, get from auth
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        // In production, also update auto-replies in dashboard
        setSelectedTemplate(null);
      } else {
        alert('Failed to activate template');
      }
    } catch (error) {
      alert('Error activating template');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Industry Templates</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Choose Your Industry Template</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Get started faster with a pre-configured automation setup tailored to your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:border-orange-500 transition-all">
              <div className="p-6">
                <div className="text-5xl mb-4">{template.icon}</div>
                <h2 className="text-xl font-bold text-white mb-2">{template.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                
                <div className="mb-4">
                  <h3 className="text-white text-sm font-semibold mb-2">Features:</h3>
                  <ul className="space-y-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                        <span className="text-orange-500">✓</span> {feature}
                      </li>
                    ))}
                    {template.features.length > 3 && (
                      <li className="text-gray-500 text-sm">+{template.features.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Preview Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-purple-900 p-6 border-b border-white/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedTemplate.icon}</div>
                <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Welcome Message</h3>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-300">{selectedTemplate.welcomeMessage}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Auto-Replies</h3>
                <div className="space-y-2">
                  {selectedTemplate.autoReplies.map((rule, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <div className="text-orange-400 text-sm font-mono">/keyword: {rule.keyword}</div>
                      <div className="text-gray-300 text-sm mt-1">{rule.response}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Quick Replies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.quickReplies.map((reply, idx) => (
                    <span key={idx} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm">{reply}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => activateTemplate(selectedTemplate.id)}
                  disabled={activating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {activating ? 'Activating...' : 'Activate This Template'}
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}