'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Broadcast sent to ${selectedAudience === 'all' ? 'all customers' : selectedAudience}`);
    setMessage('');
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Broadcast Messages</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-2">Send Broadcast</h1>
          <p className="text-gray-300 mb-6">Send messages to your customers in bulk.</p>

          {/* Audience Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">Send to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'all', name: 'All Customers', count: '1,234 contacts' },
                { id: 'active', name: 'Active Customers', count: '456 contacts' },
                { id: 'inactive', name: 'Inactive (30+ days)', count: '778 contacts' },
                { id: 'leads', name: 'New Leads', count: '89 contacts' }
              ].map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => setSelectedAudience(audience.id)}
                  className={`p-4 rounded-xl text-left transition ${
                    selectedAudience === audience.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">{audience.name}</div>
                  <div className="text-xs opacity-80">{audience.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              placeholder="Type your broadcast message here..."
            />
            <div className="text-right text-gray-400 text-xs mt-1">
              {message.length} characters
            </div>
          </div>

          {/* Template Suggestions */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">Template Ideas</label>
            <div className="flex flex-wrap gap-2">
              {[
                "🎉 Special offer: 20% off this week only!",
                "📢 Reminder: Your appointment is tomorrow at 10am",
                "✨ New products just arrived! Check them out",
                "💝 Thank you for being a loyal customer"
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(template)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full transition"
                >
                  {template.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendBroadcast}
            disabled={!message.trim() || sending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : `Send to ${selectedAudience === 'all' ? 'All Customers' : selectedAudience}`}
          </button>

          <p className="text-gray-400 text-center text-sm mt-4">
            Messages will be sent via WhatsApp. Standard message rates apply.
          </p>
        </div>
      </div>
    </div>
  );
}