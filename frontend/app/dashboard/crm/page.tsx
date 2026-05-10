'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CRMConnection {
  id: string;
  provider: 'hubspot' | 'salesforce';
  isConnected: boolean;
  lastSyncAt?: string;
}

export default function CRMPage() {
  const [connections, setConnections] = useState<CRMConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hubspot' | 'salesforce'>('hubspot');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/crm/connections?userId=${userId}`);
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Failed to fetch CRM connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectCRM = async (provider: 'hubspot' | 'salesforce') => {
    setConnecting(provider);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/crm/${provider}/auth-url?userId=${userId}`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      alert(`Failed to connect ${provider}`);
      setConnecting(null);
    }
  };

  const disconnectCRM = async (provider: 'hubspot' | 'salesforce') => {
    if (!confirm(`Disconnect ${provider}? Contacts will no longer sync automatically.`)) return;
    
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/crm/disconnect/${provider}?userId=${userId}`, { method: 'DELETE' });
      await fetchConnections();
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  const isConnected = (provider: string) => {
    return connections.some(c => c.provider === provider && c.isConnected);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading CRM integrations...</div>
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
          <span className="text-white font-bold ml-4">CRM Integration</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">🔄 Connect Your CRM</h1>
        <p className="text-gray-300 mb-8">Sync your WhatsApp contacts with HubSpot or Salesforce automatically.</p>

        {/* Provider Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('hubspot')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'hubspot'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            HubSpot
          </button>
          <button
            onClick={() => setActiveTab('salesforce')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'salesforce'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Salesforce
          </button>
        </div>

        {/* HubSpot Section */}
        {activeTab === 'hubspot' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">📊</div>
              <div>
                <h2 className="text-xl font-bold text-white">HubSpot Integration</h2>
                <p className="text-gray-400 text-sm">Sync contacts and track WhatsApp conversations</p>
              </div>
            </div>

            {isConnected('hubspot') ? (
              <div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white">Connected to HubSpot</span>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnectCRM('hubspot')}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">✅ Contacts from WhatsApp will automatically sync to HubSpot</p>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => connectCRM('hubspot')}
                  disabled={connecting === 'hubspot'}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {connecting === 'hubspot' ? 'Connecting...' : 'Connect HubSpot →'}
                </button>
                <p className="text-gray-500 text-xs mt-4 text-center">
                  You'll be redirected to HubSpot to authorize access
                </p>
              </div>
            )}

            {isConnected('hubspot') && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <h3 className="text-white font-semibold mb-2">What gets synced:</h3>
                <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                  <li>Customer name and contact details</li>
                  <li>WhatsApp conversation history</li>
                  <li>Lead status and tags</li>
                  <li>Automatically create/update contacts</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Salesforce Section */}
        {activeTab === 'salesforce' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">☁️</div>
              <div>
                <h2 className="text-xl font-bold text-white">Salesforce Integration</h2>
                <p className="text-gray-400 text-sm">Sync contacts and track WhatsApp conversations</p>
              </div>
            </div>

            {isConnected('salesforce') ? (
              <div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white">Connected to Salesforce</span>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnectCRM('salesforce')}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">✅ Contacts from WhatsApp will automatically sync to Salesforce</p>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => connectCRM('salesforce')}
                  disabled={connecting === 'salesforce'}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {connecting === 'salesforce' ? 'Connecting...' : 'Connect Salesforce →'}
                </button>
                <p className="text-gray-500 text-xs mt-4 text-center">
                  You'll be redirected to Salesforce to authorize access
                </p>
              </div>
            )}

            {isConnected('salesforce') && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <h3 className="text-white font-semibold mb-2">What gets synced:</h3>
                <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                  <li>Customer name and contact details</li>
                  <li>WhatsApp conversation history</li>
                  <li>Lead/Contact records</li>
                  <li>Automatically create/update contacts</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How CRM Integration Works</h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Connect your HubSpot or Salesforce account with one click</li>
            <li>New WhatsApp contacts are automatically created in your CRM</li>
            <li>Conversation history is tracked in the contact record</li>
            <li>Leads from WhatsApp appear in your sales pipeline</li>
          </ol>
        </div>
      </div>
    </div>
  );
}