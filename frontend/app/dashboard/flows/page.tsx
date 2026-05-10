'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Flow {
  id: string;
  name: string;
  description?: string;
  trigger: { type: string; keyword?: string };
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/flows?userId=${userId}`);
      const data = await response.json();
      setFlows(data);
    } catch (error) {
      console.error('Failed to fetch flows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlow = async (id: string, currentStatus: boolean) => {
    const endpoint = currentStatus ? 'deactivate' : 'activate';
    try {
      await fetch(`/api/flows/${id}/${endpoint}`, { method: 'POST' });
      await fetchFlows();
    } catch (error) {
      console.error('Failed to toggle flow:', error);
    }
  };

  const deleteFlow = async (id: string) => {
    if (!confirm('Delete this flow?')) return;
    try {
      await fetch(`/api/flows/${id}`, { method: 'DELETE' });
      await fetchFlows();
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
  };

  const getTriggerText = (trigger: { type: string; keyword?: string }) => {
    switch (trigger.type) {
      case 'welcome': return 'When customer starts conversation';
      case 'keyword': return `When customer says "${trigger.keyword}"`;
      case 'time': return 'After time delay';
      default: return trigger.type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading flows...</div>
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
          <span className="text-white font-bold ml-4">Auto-Flows</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Automation Flows</h1>
          <Link
            href="/dashboard/flows/create"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + New Flow
          </Link>
        </div>

        {/* Pre-made Templates (Simplified - No complex building) */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3">✨ Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Welcome Message", trigger: "welcome", description: "Send welcome message to new customers" },
              { name: "Booking Flow", trigger: "keyword: book", description: "Help customers book appointments" },
              { name: "Price Inquiry", trigger: "keyword: price", description: "Auto-reply with price information" }
            ].map((template, idx) => (
              <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-white font-medium">{template.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{template.description}</p>
                <p className="text-gray-500 text-xs mt-2">Trigger: {template.trigger}</p>
                <Link
                  href={`/dashboard/flows/create?template=${idx}`}
                  className="inline-block mt-3 text-orange-400 text-sm hover:text-orange-300"
                >
                  Use Template →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Flows List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Name</th>
                  <th className="text-left p-4 text-gray-300">Trigger</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Used</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((flow) => (
                  <tr key={flow.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <Link href={`/dashboard/flows/${flow.id}`} className="text-white hover:text-orange-400">
                        {flow.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">{getTriggerText(flow.trigger)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFlow(flow.id, flow.isActive)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          flow.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-gray-300">{flow.usageCount}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/flows/${flow.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                          Edit
                        </Link>
                        <button onClick={() => deleteFlow(flow.id)} className="text-red-400 hover:text-red-300 text-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}