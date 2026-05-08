'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AutoReplyRule {
  id: string;
  keyword: string;
  response: string;
  enabled: boolean;
}

export default function AutoRepliesPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([
    { id: '1', keyword: 'price', response: 'Our pricing starts at R299/month. Would you like a demo?', enabled: true },
    { id: '2', keyword: 'hours', response: 'We are open Mon-Fri 9am-5pm. How can we help?', enabled: true },
    { id: '3', keyword: 'booking', response: 'You can book an appointment here: [booking link]', enabled: false },
  ]);

  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [businessHours, setBusinessHours] = useState({ start: '09:00', end: '17:00' });

  const addRule = () => {
    if (!newKeyword || !newResponse) return;
    setRules([...rules, { id: Date.now().toString(), keyword: newKeyword, response: newResponse, enabled: true }]);
    setNewKeyword('');
    setNewResponse('');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Auto-Replies</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Business Hours */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold mb-4">Business Hours</h2>
          <div className="flex gap-4">
            <input
              type="time"
              value={businessHours.start}
              onChange={(e) => setBusinessHours({ ...businessHours, start: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <span className="text-white">to</span>
            <input
              type="time"
              value={businessHours.end}
              onChange={(e) => setBusinessHours({ ...businessHours, end: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition">
              Save Hours
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3">Messages received outside business hours will receive an away message.</p>
        </div>

        {/* Auto-Reply Rules */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">Keyword Auto-Replies</h2>
          
          {/* Existing Rules */}
          <div className="space-y-3 mb-6">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-mono text-sm">/keyword: {rule.keyword}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{rule.response}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleRule(rule.id)} className="text-gray-400 hover:text-white text-sm">
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Rule */}
          <div className="border-t border-white/20 pt-4">
            <h3 className="text-white font-medium mb-3">Add New Auto-Reply Rule</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Keyword (e.g., price, hours, booking)"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value.toLowerCase())}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <textarea
                placeholder="Auto-reply message..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={addRule}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
              >
                + Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}