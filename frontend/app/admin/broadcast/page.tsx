'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Broadcast {
  id: string;
  subject: string;
  message: string;
  recipients: string;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
}

export default function AdminBroadcastPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState('all');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcasts');
      const data = await res.json();
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

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

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setSubject('');
        setMessage('');
        fetchBroadcasts();
      } else {
        alert(data.error || 'Failed to send broadcast');
      }
    } catch (error) {
      alert('Error sending broadcast');
    } finally {
      setSending(false);
    }
  };

  const getRecipientLabel = (type: string) => {
    switch(type) {
      case 'all': return 'All Users';
      case 'active': return 'Active Users';
      case 'free': return 'Free Plan';
      case 'paid': return 'Paid Subscribers';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Sent</span>;
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'failed': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">Failed</span>;
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white font-bold ml-4">Email Broadcast</span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="float-right text-orange-400 hover:text-orange-300"
          >
            {showHistory ? 'New Broadcast' : 'History'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {!showHistory ? (
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-6">Send Email to Users</h2>
            
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
              <p className="text-yellow-400 text-sm">
                ℹ️ Email sending requires SMTP configuration. For now, broadcasts are simulated and saved to history.
              </p>
            </div>

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
        ) : (
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-6">Broadcast History</h2>
            
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading history...</div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No broadcasts sent yet.</div>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{broadcast.subject}</h3>
                        <p className="text-gray-400 text-xs">
                          {new Date(broadcast.sentAt).toLocaleString()} • {getRecipientLabel(broadcast.recipients)} • {broadcast.recipientCount} recipients
                        </p>
                      </div>
                      {getStatusBadge(broadcast.status)}
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{broadcast.message.substring(0, 150)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}