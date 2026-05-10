'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  successRate: number;
  variables: string[];
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      const data = await response.json();
      setTemplate(data);
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20', icon: '✅' };
      case 'pending':
        return { text: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⏳' };
      case 'rejected':
        return { text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20', icon: '❌' };
      default:
        return { text: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '📝' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Template not found</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(template.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard/templates" className="text-gray-400 hover:text-white transition">
            ← Templates
          </Link>
          <span className="text-white font-bold ml-4">{template.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{template.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.icon} {statusInfo.text}
                </span>
                <span className="text-gray-400 text-sm">{template.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {template.status === 'rejected' && (
                <Link
                  href={`/dashboard/templates/edit/${template.id}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit & Resubmit
                </Link>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {template.status === 'rejected' && template.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
              <h3 className="text-red-400 font-semibold mb-1">Rejection Reason</h3>
              <p className="text-gray-300 text-sm">{template.rejectionReason}</p>
            </div>
          )}

          {/* Message Content */}
          <div className="mb-6">
            <h2 className="text-white font-semibold mb-2">Message Content</h2>
            <div className="bg-white/5 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {template.content}
              </pre>
            </div>
          </div>

          {/* Variables */}
          {template.variables.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-2">Variables</h2>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((v, i) => (
                  <span key={i} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{template.usageCount}</div>
              <div className="text-gray-400 text-sm">Times Used</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{template.successRate}%</div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
          </div>

          {/* Dates */}
          <div className="text-gray-500 text-xs border-t border-white/10 pt-4">
            <div>Created: {new Date(template.createdAt).toLocaleString()}</div>
            <div>Last updated: {new Date(template.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}