'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: string[];
  body?: Record<string, string>;
  response?: Record<string, string>;
}

export default function APIDocsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [testResponse, setTestResponse] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const endpoints: Endpoint[] = [
    { method: 'GET', path: '/api/broadcasts', description: 'List all broadcasts' },
    { method: 'POST', path: '/api/broadcasts', description: 'Create new broadcast' },
    { method: 'GET', path: '/api/contacts', description: 'List all contacts' },
    { method: 'POST', path: '/api/contacts', description: 'Create new contact' },
    { method: 'GET', path: '/api/automation/rules', description: 'List auto-reply rules' },
    { method: 'POST', path: '/api/automation/rules', description: 'Create auto-reply rule' },
    { method: 'GET', path: '/api/admin/users', description: 'Get all users (admin)' },
    { method: 'POST', path: '/api/admin/broadcast', description: 'Send admin broadcast' },
    { method: 'GET', path: '/api/admin/stats', description: 'Get system statistics' },
    { method: 'GET', path: '/api/templates', description: 'List message templates' },
    { method: 'POST', path: '/api/payments/links', description: 'Create payment link' },
    { method: 'GET', path: '/api/shopify/products', description: 'Get Shopify products' },
  ];

  const testEndpoint = async (endpoint: Endpoint) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(endpoint.path, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse('Error: ' + String(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading API docs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">API Documentation</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h2 className="text-white font-bold mb-4">Endpoints</h2>
            <div className="space-y-2">
              {endpoints.map((endpoint, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    setTestResponse('');
                  }}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedEndpoint?.path === endpoint.path
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="ml-2 text-sm truncate block">{endpoint.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Details */}
          <div className="lg:col-span-2 bg-white/10 rounded-xl p-6 border border-white/20">
            {selectedEndpoint ? (
              <>
                <h2 className="text-white font-bold mb-4">Endpoint Details</h2>
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <p className="text-gray-300">
                    <span className="text-green-400">{selectedEndpoint.method}</span>
                    <span className="text-white ml-2">{selectedEndpoint.path}</span>
                  </p>
                  <p className="text-gray-400 mt-2">{selectedEndpoint.description}</p>
                </div>

                <h3 className="text-white font-medium mb-2">Try it out</h3>
                <button
                  onClick={() => testEndpoint(selectedEndpoint)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm mb-4"
                >
                  Send Request
                </button>

                {testResponse && (
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Response:</p>
                    <pre className="text-green-400 text-xs overflow-x-auto">
                      {testResponse}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">
                Select an endpoint to view details and test
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}