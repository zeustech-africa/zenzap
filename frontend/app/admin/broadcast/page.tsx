'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminBroadcastPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState('all');

  const sendBroadcast = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message');
      return;
    }
    
    setSending(true);
    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, recipients })
      });
      
      if (response.ok) {
        alert('Broadcast sent successfully!');
        setSubject('');
        setMessage('');
      } else {
        alert('Failed to send broadcast');
      }
    } catch (error) {
      alert('Error sending broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white font-bold ml-4">Email Broadcast</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-6">Send Email to All Users</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Recipients</label>
              <select
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users Only</option>
                <option value="free">Free Plan Users</option>
                <option value="paid">Paid Subscribers</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Write your message here..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>

          <button
            onClick={sendBroadcast}
            disabled={sending}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}