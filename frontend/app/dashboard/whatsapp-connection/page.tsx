'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WhatsAppConnectionPage() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for connection result
    const urlParams = new URLSearchParams(window.location.search);
    const connectedParam = urlParams.get('connected');
    const errorParam = urlParams.get('error');
    
    if (connectedParam === 'true') {
      setConnected(true);
    }
    if (errorParam) {
      setError(errorParam);
    }
    
    // Also check status via API
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/whatsapp/status?userId=${userId}`);
      const data = await response.json();
      setConnected(data.status === 'connected');
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const startConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get user ID from the token or from a protected endpoint
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      const userId = userData.id;
      
      const authResponse = await fetch(`/api/whatsapp/auth-url?userId=${userId}`);
      const data = await authResponse.json();
      window.location.href = data.authUrl;
    } catch (error) {
      setError('Failed to start connection. Please try again.');
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Disconnect WhatsApp? You will no longer receive messages in ZENZAP.')) return;
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/whatsapp/disconnect?userId=${userId}`, { method: 'DELETE' });
      setConnected(false);
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  if (connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">WhatsApp Connected!</h1>
            <p className="text-gray-300 mb-6">
              Your WhatsApp Business account is successfully connected to ZENZAP.
            </p>
            <button
              onClick={disconnect}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
            >
              Disconnect
            </button>
            <Link
              href="/dashboard"
              className="inline-block ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
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
          <span className="text-white font-bold ml-4">Connect WhatsApp</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💬</div>
            <h1 className="text-2xl font-bold text-white mb-4">Connect Your WhatsApp Business</h1>
            <p className="text-gray-300">
              Connect your WhatsApp Business account to start automating customer conversations.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 text-center">
              <p className="text-red-300 text-sm">Connection failed: {error}</p>
            </div>
          )}

          <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/30">
            <h3 className="text-blue-400 font-semibold mb-2">📋 What you need:</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>A Facebook Business account</li>
              <li>A WhatsApp Business number</li>
              <li>5 minutes to complete the setup</li>
            </ul>
          </div>

          <button
            onClick={startConnection}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect WhatsApp Business →'}
          </button>

          <div className="mt-6 bg-white/5 rounded-lg p-4 text-left">
            <h3 className="text-white font-semibold mb-2">📋 What happens next:</h3>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>You'll be redirected to Facebook to log in</li>
              <li>Grant permission for ZENZAP to manage your WhatsApp</li>
              <li>Select your WhatsApp Business number</li>
              <li>You'll be redirected back to ZENZAP</li>
              <li>Your WhatsApp is connected!</li>
            </ol>
          </div>

          <div className="mt-4 text-yellow-500/80 text-sm bg-yellow-500/10 p-3 rounded-lg">
            <strong>Note:</strong> You can continue using your WhatsApp Business app. ZENZAP works alongside it!
          </div>
        </div>
      </div>
    </div>
  );
}