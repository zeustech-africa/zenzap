'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WebhookEndpoint {
  id: string;
  name: string;
  event: string;
  url: string;
  isActive: boolean;
  webhookUrl: string;
  secret: string;
  triggerCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    event: 'new_customer',
    targetUrl: ''
  });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/webhooks?userId=${userId}`);
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!formData.name || !formData.targetUrl) {
      alert('Please fill in name and target URL');
      return;
    }
    
    setCreating(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/webhooks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData })
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({ name: '', event: 'new_customer', targetUrl: '' });
        await fetchWebhooks();
      } else {
        alert('Failed to create webhook');
      }
    } catch (error) {
      alert('Error creating webhook');
    } finally {
      setCreating(false);
    }
  };

  const testWebhook = async (id: string) => {
    setTesting(id);
    try {
      const response = await fetch(`/api/webhooks/test/${id}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert('Test webhook sent successfully!');
      } else {
        alert(`Test failed: ${data.error}`);
      }
    } catch (error) {
      alert('Error testing webhook');
    } finally {
      setTesting(null);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    
    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      await fetchWebhooks();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getEventLabel = (event: string) => {
    switch (event) {
      case 'new_customer': return 'New Customer';
      case 'new_lead': return 'New Lead';
      case 'new_message': return 'New Message';
      case 'new_booking': return 'New Booking';
      case 'new_order': return 'New Order';
      default: return event;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading webhooks...</div>
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
          <span className="text-white font-bold ml-4">CRM Integration (Zapier)</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">🔄 Webhook Endpoints</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Create Webhook
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">📋 How to Connect to Zapier / CRM</h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Create a webhook endpoint below (choose event type)</li>
            <li>Copy the generated webhook URL</li>
            <li>Paste the URL into Zapier as a "Webhook URL"</li>
            <li>Select "Catch Hook" trigger in Zapier</li>
            <li>ZENZAP will send data whenever the event occurs</li>
          </ol>
        </div>

        {/* Webhooks List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="divide-y divide-white/10">
            {endpoints.map((webhook) => (
              <div key={webhook.id} className="p-4 hover:bg-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{webhook.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${webhook.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Event: {getEventLabel(webhook.event)}</div>
                    <div className="text-gray-500 text-xs mt-1">Target: {webhook.url}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      Webhook URL: 
                      <code className="ml-1 text-orange-400">{webhook.webhookUrl}</code>
                      <button
                        onClick={() => copyToClipboard(webhook.webhookUrl, webhook.id)}
                        className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
                      >
                        {copied === webhook.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Secret: 
                      <code className="ml-1 text-gray-400">{webhook.secret ? webhook.secret.substring(0, 16) : ''}...</code>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Triggered: {webhook.triggerCount} times
                      {webhook.lastTriggeredAt && ` (last: ${new Date(webhook.lastTriggeredAt).toLocaleString()})`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testing === webhook.id}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-sm transition"
                    >
                      {testing === webhook.id ? 'Testing...' : 'Test'}
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
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

        {endpoints.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No webhook endpoints yet. Create one to connect to Zapier or CRM.
          </div>
        )}

        {/* Create Webhook Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-white font-bold text-lg mb-4">Create Webhook Endpoint</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name (e.g., HubSpot Integration)"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <select
                  value={formData.event}
                  onChange={(e) => setFormData({...formData, event: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="new_customer">New Customer</option>
                  <option value="new_lead">New Lead</option>
                  <option value="new_message">New Message</option>
                  <option value="new_booking">New Booking</option>
                  <option value="new_order">New Order</option>
                </select>
                <input
                  type="url"
                  placeholder="Target URL (where to send data)"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-gray-400 text-xs">Example: https://hooks.zapier.com/... or your CRM webhook URL</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createWebhook}
                  disabled={creating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Webhook'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}