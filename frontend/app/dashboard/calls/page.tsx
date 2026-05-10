'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CallRecord {
  id: string;
  customerPhone: string;
  customerName: string;
  type: 'voice' | 'video';
  direction: 'outgoing' | 'incoming';
  status: string;
  duration: number;
  startedAt: string;
  endedAt?: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/calls/history?userId=${userId}`);
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Completed</span>;
      case 'ringing': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Ringing</span>;
      case 'missed': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Missed</span>;
      case 'failed': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Failed</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading call history...</div>
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
          <span className="text-white font-bold ml-4">Call History</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">📞 WhatsApp Call History</h1>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Customer</th>
                  <th className="text-left p-4 text-gray-300">Type</th>
                  <th className="text-left p-4 text-gray-300">Direction</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Duration</th>
                  <th className="text-left p-4 text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="text-white">{call.customerName}</div>
                      <div className="text-gray-400 text-sm">{call.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${call.type === 'video' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                        {call.type === 'video' ? '📹 Video' : '📞 Voice'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}
                    </td>
                    <td className="p-4">{getStatusBadge(call.status)}</td>
                    <td className="p-4 text-gray-300">
                      {call.duration > 0 ? formatDuration(call.duration) : '—'}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(call.startedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {calls.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No calls yet. Use the call buttons in the inbox to start voice or video calls.
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How WhatsApp Calls Work</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Click the voice or video call button in any conversation</li>
            <li>WhatsApp will open with a call to the customer</li>
            <li>Call history is automatically logged</li>
            <li>Requires WhatsApp Business app on your phone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}