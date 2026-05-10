'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  successRate: number;
  variables: string[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/templates?userId=${userId}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const submitForApproval = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}/submit`, { method: 'POST' });
      if (response.ok) {
        alert('Template submitted for approval!');
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to submit template:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">✅ Approved</span>;
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">⏳ Pending</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">❌ Rejected</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">📝 Draft</span>;
    }
  };

  const filteredTemplates = templates.filter(t => filter === 'all' || t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Message Templates</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Message Templates</h1>
          <Link
            href="/dashboard/templates/create"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + New Template
          </Link>
        </div>

        {/* Pre-made Templates Section */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3">✨ Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Welcome Message", category: "Utility", content: "Welcome to {{business_name}}! How can we help you today?" },
              { name: "Price Inquiry", category: "Marketing", content: "Thank you for your interest! Our {{product_name}} costs {{price}}. Would you like to know more?" },
              { name: "Appointment Reminder", category: "Utility", content: "Reminder: Your appointment is scheduled for {{date}} at {{time}}. Reply CONFIRM to confirm." }
            ].map((preset, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-white font-medium">{preset.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{preset.category}</p>
                <p className="text-gray-300 text-xs mt-2 line-clamp-2">{preset.content}</p>
                <button className="mt-3 text-orange-400 text-sm hover:text-orange-300">Use Template →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['all', 'draft', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({templates.filter(t => t.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Templates List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Name</th>
                  <th className="text-left p-4 text-gray-300">Category</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Created</th>
                  <th className="text-left p-4 text-gray-300">Used</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr key={template.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <Link href={`/dashboard/templates/${template.id}`} className="text-white hover:text-orange-400 transition">
                          {template.name}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-300">{template.category}</td>
                      <td className="p-4">
                        <div>{getStatusBadge(template.status)}</div>
                        {template.status === 'rejected' && template.rejectionReason && (
                          <div className="text-red-400/80 text-xs mt-1" title={template.rejectionReason}>
                            {template.rejectionReason.length > 40
                              ? template.rejectionReason.slice(0, 40) + '...'
                              : template.rejectionReason}
                          </div>
                        )}
                        {template.status === 'approved' && (
                          <div className="text-green-400/60 text-xs mt-1">
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(template.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-300">{template.usageCount}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/templates/edit/${template.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                            Edit
                          </Link>
                          {template.status === 'draft' && (
                            <button onClick={() => submitForApproval(template.id)} className="text-green-400 hover:text-green-300 text-sm">
                              Submit
                            </button>
                          )}
                          <button onClick={() => deleteTemplate(template.id)} className="text-red-400 hover:text-red-300 text-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}