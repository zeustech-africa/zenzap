'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CoexistencePage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/coexistence/status?userId=${userId}`);
      const data = await response.json();
      setEnabled(data.enabled);
    } catch (error) {
      console.error('Failed to fetch coexistence status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoexistence = async () => {
    const newValue = !enabled;
    setSaving(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/coexistence/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: newValue })
      });
      
      if (response.ok) {
        setEnabled(newValue);
        alert(newValue 
          ? '✅ Coexistence mode ON! You can now use WhatsApp Business App and ZENZAP together.'
          : 'Coexistence mode OFF. You will only use ZENZAP.'
        );
      }
    } catch (error) {
      alert('Failed to change coexistence mode. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          <span className="text-white font-bold ml-4">WhatsApp Coexistence</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📱💻</div>
            <h1 className="text-2xl font-bold text-white mb-2">Use Both App & ZENZAP</h1>
            <p className="text-gray-300">
              Keep using your WhatsApp Business App while ZENZAP works in the background
            </p>
          </div>

          {/* What is Coexistence? */}
          <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/30">
            <h3 className="text-blue-400 font-semibold mb-2">✨ What does this do?</h3>
            <p className="text-gray-300 text-sm">
              Normally, you can't use the WhatsApp Business App and ZENZAP at the same time.
              <strong className="block mt-2 text-white">Coexistence mode lets you use BOTH!</strong>
              You can keep your phone app AND use ZENZAP's automation.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg mb-6">
            <div>
              <div className="text-white font-semibold">Enable Coexistence Mode</div>
              <div className="text-gray-400 text-sm">
                {enabled 
                  ? '✅ Both app and ZENZAP are active'
                  : '❌ Only ZENZAP is active (app not connected)'
                }
              </div>
            </div>
            <button
              onClick={toggleCoexistence}
              disabled={saving}
              className={`w-12 h-6 rounded-full transition ${
                enabled ? 'bg-green-500' : 'bg-gray-600'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* What changes when ON */}
          {enabled && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ What changes when Coexistence is ON</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✖</span> You cannot edit or delete sent messages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✖</span> Disappearing messages will be turned off
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✖</span> View once messages will not work
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✖</span> Live location sharing will not work
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">ℹ️</span> Broadcast lists become read-only
                </li>
              </ul>
            </div>
          )}

          {/* Simple Explanation */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">💡 Simple Explanation</h3>
            <p className="text-gray-300 text-sm">
              <strong>OFF (Default):</strong> Only ZENZAP works. Your WhatsApp app won't receive messages.<br />
              <strong>ON:</strong> Both work together! You can use your phone app AND ZENZAP at the same time.
            </p>
          </div>

          {/* Connection Status */}
          <div className="mt-6 text-center">
            <Link href="/dashboard/whatsapp-connection" className="text-orange-400 hover:text-orange-300 text-sm">
              Need to connect your WhatsApp first? Click here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}